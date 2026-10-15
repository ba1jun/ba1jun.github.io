# Local photo masters

Keep full-resolution photo originals here. This directory is excluded from
Git except for this guide, so back up the originals somewhere outside this
repository as well.

Folder structure:

```text
photos-originals/
  profile/
    jun-bai.jpg
  research/
    circuitlens.png
  journeys/
    202605-turkey/
      cappadocia-erciyes.jpg
```

The homepage portrait is published as an 800px WebP at
`public/photos/profile/jun-bai.webp`.

Research figure originals also live here. The CircuitLens figure is published
as an 800px WebP at `public/research/images/circuitlens.webp`.

Generate journey web versions with:

```sh
bun run images -- 202605-turkey --clean --cover "istanbul-Yeni Camii-1"
```

The command removes the date prefix from the published folder name, normalizes
filenames for URLs, and creates a 1200px AVIF thumbnail, a 2560px AVIF
lightbox image, and an optional 1920px `cover.avif`. Commit those generated
files, but do not commit the originals. When the selected source file is named
`cover`, it is treated as cover-only and is not added to the gallery.
