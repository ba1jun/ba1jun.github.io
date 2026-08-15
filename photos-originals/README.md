# Local photo masters

Keep full-resolution journey originals here. This directory is excluded from
Git except for this guide, so back up the originals somewhere outside this
repository as well.

Folder structure:

```text
photos-originals/
  journeys/
    202605-turkey/
      cappadocia-erciyes.jpg
```

Generate the web versions with:

```sh
bun run images -- 202605-turkey --clean --cover "istanbul-Yeni Camii-1"
```

The command removes the date prefix from the published folder name, normalizes
filenames for URLs, and creates a 1200px AVIF thumbnail, a 2560px AVIF
lightbox image, and an optional 1920px `cover.avif`. Commit those generated
files, but do not commit the originals. When the selected source file is named
`cover`, it is treated as cover-only and is not added to the gallery.
