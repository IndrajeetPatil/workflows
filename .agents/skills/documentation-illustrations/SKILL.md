---
name: documentation-illustrations
description: >
  Create or revise informative diagrams and illustrations for reusable workflow
  documentation. Use when generated docs artwork, architecture diagrams, or
  workflow quality check illustrations are requested.
---

# Documentation illustrations

Everything this skill needs is in this repository: the existing figures and
prompt specifications in `docs/figures/`, and the workflow definitions in
`.github/workflows/`. Do not look for references, prompts, or assets anywhere
else.

## Inputs

- **Visual references:** inspect existing figures in `docs/figures/` (such as
  `presentation-quality-checks.webp`, `python-package-quality-checks.webp`,
  `r-package-quality-checks.webp`, `security-design.webp`, `accepted-risks.webp`,
  `workflow-families.webp`, and `cache-isolation.webp`) and match the layout
  closest to the subject.

- **Prior prompts:** read the companion `.prompt.txt` files stored beside each
  figure in `docs/figures/` (e.g. `python-package-quality-checks.prompt.txt`,
  `r-package-quality-checks.prompt.txt`, and
  `presentation-quality-checks.prompt.txt`).

- **Workflow facts:** workflow definitions in `.github/workflows/` and the
  guides in `docs/` are the sole authority for step names, toolchains, matrix
  entries, security boundaries, and check requirements.

## House style

| Element | Value | Purpose |
| --- | --- | --- |
| Canvas | `#faf8f4` | Flat warm paper background with generous whitespace |
| Primary text | `#201d18` | Near-black warm ink for titles, headings, and primary labels |
| Secondary text | `#5d574c` | Muted ink for summaries, notes, and explanatory labels |
| Hairlines | `#e3ded2` | Warm grey dividing lines between bands or panels |
| Accent | `#14584d` | Deep teal for all technology outline icons, check paths, and arrows |
| Alert | `#9a3d2e` | Muted rust used sparingly for failure stops, denials, or threats |

### Typography and aesthetics

- Titles and band headings use a large Fraunces-like editorial serif.

- Step labels, summaries, and sub-notes use a clean Hanken-like sans.

- Line drawing is flat, crisp, and monoline stroke art rendered as a bitmap.

- Step flows are unboxed; elements sit directly on the warm paper canvas rather
  than inside cards, rounded boxes, or drop-shadowed panels.

- Thin orthogonal arrows connect steps; paths split cleanly and never cross.

### Color consistency rule

- **Technology outline icons must use deep teal (`#14584d`).** Do not render
  step outline icons or technology symbols in dark ink or charcoal. The deep
  teal accent must apply uniformly to all step outline icons as well as the
  connecting orthogonal arrows, providing consistent visual rhythm across all
  documentation diagrams.

- Primary text and step titles remain near-black ink (`#201d18`), and sub-notes
  remain muted ink (`#5d574c`).

- Denials, halts, and failure stops use muted rust (`#9a3d2e`) only when an
  error path is explicitly shown.

### Prohibitions

Never include:

- Shadows, gradients, textures, or 3D effects.
- Cards, rounded panels, or boxed containers around steps.
- Emoji, decorative checkmark badges, or decorative footers.
- Ordinal band or step numbering (e.g., no "Band 1" or "Step 1" text).
- Invented statistics, fake percentages, or arbitrary metrics.
- Watermarks, vignetting, or colored backgrounds other than `#faf8f4`.

## Layout archetypes

### 1. Three-band quality checks (3:2 landscape, e.g. 1264x848)

The standard format for workflow family quality checks (see
`presentation-quality-checks.webp`, `python-package-quality-checks.webp`, and
`r-package-quality-checks.webp`):

- Divided into three horizontal tiers by fine hairlines (`#e3ded2`).

- Left column of each tier: Fraunces-like serif heading and a one-line muted
  sans summary.

- Right column of each tier: an unboxed step-by-step flow of three steps
  connected by thin orthogonal teal arrows (`#14584d`). Each step features a
  deep teal outline icon, a step label in ink (`#201d18`), and a concise note
  in muted ink (`#5d574c`) underneath.

### 2. Multi-panel horizontal strip (Wide landscape, e.g. 2172x724)

Used for category overviews and risk matrices (see `workflow-families.webp` and
`accepted-risks.webp`):

- Divided into equal vertical panels or columns by fine hairlines (`#e3ded2`).

- Each panel features a distinct line-art motif and a centered label below.

### 3. Architecture diagrams (Landscape, e.g. 1568x1003)

Used for system security architecture and credential isolation (see
`security-design.webp`):

- Central reusable workflow execution block passing through an owner guard.

- Isolated jobs grouped by privilege level with write credentials segregated.

- Dedicated pull-request security gate separated by a fine horizontal hairline.

## Prompt template

```text
Use case: infographic-diagram. Asset type: documentation diagram for
reusable GitHub Actions workflows. Landscape 3:2, flat canvas warm paper
#faf8f4, ink #201d18, muted ink #5d574c, fine hairlines #e3ded2, deep teal
#14584d accent for all step outline icons and connecting arrows, muted rust
#9a3d2e only for failure stops. Fraunces-like serif title and band headings,
Hanken-like sans labels, generous whitespace, flat outline icons in deep teal
#14584d, thin orthogonal teal arrows. No shadows, gradients, texture, 3D,
cards, boxed panels, emoji, decorative footers, ordinal numbering, or
invented statistics.

IMPORTANT COLOR REQUIREMENT: Each step on the right MUST feature a clean
outline icon rendered in deep teal (#14584d) alongside the thin orthogonal teal
arrows (#14584d), so that all technology and check step icons prominently
showcase the deep teal color.

Title exactly: '[title]'

Layout: Three horizontal bands separated by fine horizontal hairlines
(#e3ded2), each band having its heading and a one-line muted summary on the
left, and its unboxed step-by-step flow on the right connected by thin
orthogonal teal arrows (#14584d).

Band 1 (top):
- Left heading: '[heading]'
- Left summary: '[summary]'
- Right flow (each step with a deep teal #14584d outline icon):
  '[step 1]' (underneath note: '[note 1]') →
  '[step 2]' (underneath note: '[note 2]') →
  '[step 3]' (underneath note: '[note 3]')

Band 2 (middle):
- Left heading: '[heading]'
- Left summary: '[summary]'
- Right flow (each step with a deep teal #14584d outline icon):
  '[step 1]' (underneath note: '[note 1]') →
  '[step 2]' (underneath note: '[note 2]') →
  '[step 3]' (underneath note: '[note 3]')

Band 3 (bottom):
- Left heading: '[heading]'
- Left summary: '[summary]'
- Right flow (each step with a deep teal #14584d outline icon):
  '[step 1]' (underneath note: '[note 1]') →
  '[step 2]' (underneath note: '[note 2]') →
  '[step 3]' (underneath note: '[note 3]')
```

For follow-up edits, specify what to preserve ("preserve every element,
position, arrow, icon, color, and label") followed by the exact modification.

## Asset and documentation workflow

- **Generation:** Invoke the built-in image generator subagent
  (`image-generator`).

- **WebP compression:** Convert raster outputs to WebP using `cwebp -q 90`
  (e.g. `cwebp -q 90 generated.jpg -o docs/figures/<slug>.webp`).

- **Prompt persistence:** Always save the exact prompt used in a companion
  `docs/figures/<slug>.prompt.txt` file alongside the WebP asset.

- **Vector diagrams:** Hand-author SVG only when vector scalability and
  editable source text are specifically required (e.g. `docs/figures/cran-release.svg`).

- **Documentation embedding:** Embed figures in Markdown using descriptive alt
  text that outlines the diagram contents, followed by structured text
  detailing each stage or band.
