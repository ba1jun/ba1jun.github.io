import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

const SOURCE_ROOT = path.resolve("photos-originals", "journeys");
const OUTPUT_ROOT = path.resolve("public", "photos", "journeys");
const SUPPORTED_EXTENSIONS = new Set([
  ".avif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

const VARIANTS = [
  { suffix: "-thumb", maxSide: 1200, quality: 58 },
  { suffix: "", maxSide: 2560, quality: 68 },
];

function usage() {
  console.log(`Usage: node scripts/optimize-journey-images.js [journey] [options]

Examples:
  bun run images
  bun run images -- 202605-turkey --clean --cover "istanbul-Yeni Camii-1"

Originals: photos-originals/journeys/<journey>/
Generated: public/photos/journeys/<journey-without-date-prefix>/

Options:
  --cover <filename>  Also generate cover.avif from this source image
  --clean             Remove that journey's generated directory first`);
}

function parseArguments(args) {
  let journey;
  let cover;
  let clean = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--cover") {
      cover = args[index + 1];
      if (!cover) throw new Error("--cover requires a filename.");
      index += 1;
    } else if (argument === "--clean") {
      clean = true;
    } else if (argument === "--help" || argument === "-h") {
      return { help: true };
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (journey) {
      throw new Error(`Unexpected argument: ${argument}`);
    } else {
      journey = argument;
    }
  }

  if (cover && !journey) {
    throw new Error("--cover can only be used with one journey.");
  }

  return { journey, cover, clean, help: false };
}

function slugify(value) {
  return value
    .replaceAll("ı", "i")
    .replaceAll("İ", "I")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function journeySlug(directoryName) {
  return slugify(directoryName.replace(/^\d{6}[-_]/, ""));
}

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImages(entryPath)));
      continue;
    }
    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function orientedDimensions(metadata) {
  const swapSides = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
  return {
    width: swapSides ? metadata.height : metadata.width,
    height: swapSides ? metadata.width : metadata.height,
  };
}

function fittedEvenDimensions(width, height, maxSide) {
  if (!width || !height) {
    throw new Error("Image dimensions could not be read.");
  }

  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(2, Math.floor((width * scale) / 2) * 2),
    height: Math.max(2, Math.floor((height * scale) / 2) * 2),
  };
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeImage(sourcePath) {
  const relativePath = path.relative(SOURCE_ROOT, sourcePath);
  const pathParts = relativePath.split(path.sep);
  const sourceJourney = pathParts.shift();
  if (!sourceJourney) throw new Error(`Invalid source path: ${sourcePath}`);
  const nestedDirectories = pathParts
    .slice(0, -1)
    .map((directory) => slugify(directory));
  const basename = slugify(path.basename(sourcePath, path.extname(sourcePath)));
  const outputDirectory = path.join(
    OUTPUT_ROOT,
    journeySlug(sourceJourney),
    ...nestedDirectories,
  );
  const metadata = await sharp(sourcePath).metadata();
  const dimensions = orientedDimensions(metadata);
  const sourceSize = (await stat(sourcePath)).size;
  const outputs = [];

  await mkdir(outputDirectory, { recursive: true });

  for (const variant of VARIANTS) {
    const size = fittedEvenDimensions(
      dimensions.width,
      dimensions.height,
      variant.maxSide,
    );
    const outputPath = path.join(
      outputDirectory,
      `${basename}${variant.suffix}.avif`,
    );

    await sharp(sourcePath)
      .rotate()
      .resize(size.width, size.height, { fit: "fill" })
      .avif({
        quality: variant.quality,
        effort: 4,
        chromaSubsampling: "4:2:0",
      })
      .toFile(outputPath);

    outputs.push({
      name: path.relative(process.cwd(), outputPath),
      size: (await stat(outputPath)).size,
      width: size.width,
      height: size.height,
    });
  }

  return { relativePath, sourceSize, outputs };
}

async function generateCover(sourcePath) {
  const sourceJourney = path
    .relative(SOURCE_ROOT, sourcePath)
    .split(path.sep)[0];
  const outputDirectory = path.join(OUTPUT_ROOT, journeySlug(sourceJourney));
  const metadata = await sharp(sourcePath).metadata();
  const dimensions = orientedDimensions(metadata);
  const size = fittedEvenDimensions(dimensions.width, dimensions.height, 1920);
  const outputPath = path.join(outputDirectory, "cover.avif");

  await mkdir(outputDirectory, { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize(size.width, size.height, { fit: "fill" })
    .avif({ quality: 68, effort: 4, chromaSubsampling: "4:2:0" })
    .toFile(outputPath);

  return {
    name: path.relative(process.cwd(), outputPath),
    size: (await stat(outputPath)).size,
    width: size.width,
    height: size.height,
  };
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  usage();
  process.exit(0);
}

const sourceDirectory = options.journey
  ? path.join(SOURCE_ROOT, options.journey)
  : SOURCE_ROOT;

try {
  const files = await collectImages(sourceDirectory);
  if (files.length === 0) {
    throw new Error(`No source images found in ${sourceDirectory}`);
  }

  let coverSource;
  if (options.cover) {
    const requestedCover = slugify(
      path.basename(options.cover, path.extname(options.cover)),
    );
    const coverMatches = files.filter(
      (file) =>
        slugify(path.basename(file, path.extname(file))) === requestedCover,
    );
    if (coverMatches.length !== 1) {
      throw new Error(
        `Expected one cover source matching "${options.cover}", found ${coverMatches.length}.`,
      );
    }
    [coverSource] = coverMatches;
  }

  const galleryFiles =
    coverSource &&
    slugify(path.basename(coverSource, path.extname(coverSource))) === "cover"
      ? files.filter((file) => file !== coverSource)
      : files;

  const outputJourneys = [
    ...new Set(
      files.map((file) =>
        journeySlug(path.relative(SOURCE_ROOT, file).split(path.sep)[0]),
      ),
    ),
  ];

  if (options.clean) {
    for (const outputJourney of outputJourneys) {
      const outputDirectory = path.resolve(OUTPUT_ROOT, outputJourney);
      if (path.dirname(outputDirectory) !== OUTPUT_ROOT) {
        throw new Error(`Refusing to clean unsafe path: ${outputDirectory}`);
      }
      await rm(outputDirectory, { recursive: true, force: true });
    }
  }

  const outputNames = galleryFiles.map((file) => {
    const relativePath = path.relative(SOURCE_ROOT, file);
    const parts = relativePath.split(path.sep);
    return `${journeySlug(parts[0])}/${slugify(path.basename(file, path.extname(file)))}`;
  });
  if (new Set(outputNames).size !== outputNames.length) {
    throw new Error("Normalized output filenames are not unique.");
  }

  console.log(`Optimizing ${galleryFiles.length} journey image(s)...`);
  let sourceTotal = 0;
  let outputTotal = 0;

  for (const file of galleryFiles) {
    const result = await optimizeImage(file);
    sourceTotal += result.sourceSize;
    console.log(`\n${result.relativePath} (${formatBytes(result.sourceSize)})`);
    for (const output of result.outputs) {
      outputTotal += output.size;
      console.log(
        `  ${output.width}x${output.height}  ${formatBytes(output.size)}  ${output.name}`,
      );
    }
  }

  if (coverSource) {
    const cover = await generateCover(coverSource);
    outputTotal += cover.size;
    console.log(
      `\nCover: ${cover.width}x${cover.height}  ${formatBytes(cover.size)}  ${cover.name}`,
    );
  }

  console.log(
    `\nGenerated ${VARIANTS.length * galleryFiles.length + (coverSource ? 1 : 0)} files: ${formatBytes(outputTotal)} from ${formatBytes(sourceTotal)} of originals.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  usage();
  process.exit(1);
}
