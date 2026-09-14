# Vendored Quarto extension

`a11y-v0.2.3.tar.gz` is an unchanged copy of the [0.2.3 release asset](https://github.com/mcanouil/quarto-revealjs-a11y/releases/download/0.2.3/a11y-v0.2.3.tar.gz)
from `mcanouil/quarto-revealjs-a11y`, corresponding to upstream commit
`0ae858c05f6108558d7bd5204a3dbb540dc8f5e6`.

SHA-256: `854bf2cc4229facb041b375253b75038f866f3a5a86aafd826adb0ea817a6994`.
This matches the upstream release asset's published digest. All five packaged
extension files were also compared byte-for-byte with that commit's source.
The archive includes the upstream MIT licence at `_extensions/a11y/LICENSE`.

Both presentation workflows and downstream local installers download this
stored file from `workflows/main` and verify its digest before invoking Quarto.
Unlike GitHub's generated source archives, these compressed bytes are tracked
in Git and do not depend on GitHub's archive generator.

Keep existing versioned archives unchanged. For an upgrade, add a new release
asset after verifying its provenance and contents; update the archive URL and
SHA-256 in both presentation workflows and downstream installation recipes.
