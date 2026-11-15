// Audits every rendered HTML page in the site directory with axe-core.
// RevealJS decks are audited slide by slide with all fragments shown and
// every tab of each panel tabset opened, so hidden content is covered.
import { createReadStream } from "node:fs";
import { glob, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "playwright";

// WCAG 2.2 AA plus axe best practices; experimental and AAA rules stay off.
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const SITE = path.resolve(process.argv[2] ?? "_site");
const TYPES = {
  ".css": "text/css",
  ".gif": "image/gif",
  ".html": "text/html",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let file = path.join(SITE, decodeURIComponent(url.pathname));
  if (!file.startsWith(`${SITE}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    await stat(file);
  } catch {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    "content-type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const pages = (await Array.fromAsync(glob("**/*.html", { cwd: SITE })))
  // Skip hidden paths and Quarto's vendored dependency directories (`*_files`).
  .filter(
    (file) => !file.split(path.sep).some((part) => part.startsWith(".") || part.endsWith("_files")),
  )
  .sort();
if (pages.length === 0) {
  console.error(`::error::No HTML pages found in ${SITE}.`);
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const violations = new Map();

async function audit(file, where) {
  const { violations: found } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  for (const { id, impact, help, helpUrl, nodes } of found) {
    for (const node of nodes) {
      const target = node.target.join(" ");
      const key = `${file}\u0000${where}\u0000${id}\u0000${target}`;
      if (!violations.has(key)) {
        violations.set(key, {
          file,
          where,
          rule: `${id} (${impact}): ${help}`,
          target,
          helpUrl,
          summary: node.failureSummary,
        });
      }
    }
  }
}

// Waits two animation frames so the slide or tab change has been painted.
const settle = () =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );

for (const file of pages) {
  await page.goto(`${origin}/${file.split(path.sep).join("/")}`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "*,*::before,*::after{transition:none!important;animation:none!important}",
  });
  const slides = await page.evaluate(async () => {
    const reveal = globalThis.Reveal;
    if (!reveal?.getSlides) return 0;
    if (!reveal.isReady()) await new Promise((resolve) => reveal.on("ready", resolve));
    reveal.configure({ fragments: false, transition: "none", backgroundTransition: "none" });
    return reveal.getSlides().length;
  });
  if (slides === 0) {
    await audit(file, "page");
    continue;
  }
  for (let index = 0; index < slides; index += 1) {
    const where = await page.evaluate((slideIndex) => {
      const reveal = globalThis.Reveal;
      const slide = reveal.getSlides()[slideIndex];
      const { h, v } = reveal.getIndices(slide);
      reveal.slide(h, v);
      return `slide ${slideIndex + 1}${slide.id ? ` (#${slide.id})` : ""}`;
    }, index);
    await settle();
    await audit(file, where);
    // Open each further tab of every panel tabset on the slide in turn.
    const tabs = await page.evaluate(
      () => globalThis.Reveal.getCurrentSlide().querySelectorAll(".panel-tabset [role='tab']").length,
    );
    for (let tab = 0; tab < tabs; tab += 1) {
      const opened = await page.evaluate((tabIndex) => {
        const element = globalThis.Reveal.getCurrentSlide().querySelectorAll(
          ".panel-tabset [role='tab']",
        )[tabIndex];
        if (element.getAttribute("aria-selected") === "true") return null;
        element.click();
        return element.textContent.trim();
      }, tab);
      if (opened === null) continue;
      await settle();
      await audit(file, `${where}, tab "${opened}"`);
    }
  }
  console.log(`Audited ${file}: ${slides} slides.`);
}

await browser.close();
server.close();

if (violations.size > 0) {
  for (const { file, where, rule, target, helpUrl, summary } of violations.values()) {
    console.log(`::error::${file} ${where}: ${rule} at ${target}`);
    console.log(`  ${summary.replaceAll("\n", "\n  ")}\n  ${helpUrl}`);
  }
  console.log(`::error::axe-core found ${violations.size} accessibility violation(s).`);
  process.exit(1);
}
console.log(`axe-core found no accessibility violations in ${pages.length} page(s).`);
