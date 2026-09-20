# Presentation templates

Canonical copies of the shared files used by the 11 Quarto RevealJS
presentation repositories under
[@IndrajeetPatil](https://github.com/IndrajeetPatil).

Each deck used to hand-maintain its own copy of these files, which is why they
drifted apart. This directory is the single source of truth: change a file
here, then propagate it to the decks.

## Files

| Template | Destination in a deck repository |
|----------|----------------------------------|
| [`accessibility.html`](accessibility.html) | `accessibility.html` |
| [`_quarto-a11y.yml`](_quarto-a11y.yml) | `_quarto-a11y.yml` |
| [`.editorconfig`](.editorconfig) | `.editorconfig` |
| [`justfile.python`](justfile.python) / [`justfile.r`](justfile.r) | `justfile` |
| [`gitignore.python`](gitignore.python) / [`gitignore.r`](gitignore.r) | `.gitignore` |
| [`build-presentation.python.yaml`](build-presentation.python.yaml) / [`build-presentation.r.yaml`](build-presentation.r.yaml) | `.github/workflows/build-presentation.yaml` |
| [`robots.txt.tmpl`](robots.txt.tmpl) | `robots.txt` |

The `.python` and `.r` suffixes select the backend: a deck is either a
Python/uv deck or an R deck, and the drift check is told which one via its
`backend` input.

`gitignore.python` and `gitignore.r` are deliberately **not** dotfiles. Storing
them as `.gitignore.python` would hide them here and, worse, make Git treat
them as ignore rules for this repository. They are renamed to `.gitignore` when
copied into a deck.

`robots.txt.tmpl` is a template, not a finished file: the `{{SLUG}}`
placeholder is replaced by the deck repository's name, so
`IndrajeetPatil/some-talk` renders
`Sitemap: https://www.indrapatil.com/some-talk/sitemap.xml`.

## How decks consume these

Decks do not fetch these files at build time; each deck keeps its own committed
copy so it stays buildable on its own. Instead, they verify that their copy
still matches this directory using the reusable
[`check-presentation-drift.yaml`](../../.github/workflows/check-presentation-drift.yaml)
workflow:

```yaml
name: Check Template Drift

on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:

jobs:
  check-template-drift:
    uses: IndrajeetPatil/workflows/.github/workflows/check-presentation-drift.yaml@main
    with:
      backend: python # or: r
    permissions:
      contents: read
```

The workflow checks out both the deck and this repository, diffs every file in
the table above, and fails with the full `diff -u` output for each file that
has drifted.
