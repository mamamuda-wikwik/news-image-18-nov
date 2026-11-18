// news-image-20261118
//
// Copies the held picture (entry.png, stored next to this script) into an
// output directory, after checking that the picture is a genuine PNG inside
// the bounty limits. The copy is verified byte-for-byte afterwards, so two
// runs always produce identical output bytes.
//
// Usage (all three are accepted):
//   node main.ts                          -> $MAKEFUN_OUTPUT_DIR or /output
//   node main.ts <directory>              -> that directory
//   node main.ts --output <directory>     -> that directory
// (-o, --out and --output-dir work the same as --output.)

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PICTURE_NAME = "entry.png";
const MAX_FILE_BYTES = 1024 * 1024; // 1 MiB
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_TAIL = Buffer.from([
  0x00, 0x00, 0x00, 0x00, // IEND chunk length: 0
  0x49, 0x45, 0x4e, 0x44, // "IEND"
  0xae, 0x42, 0x60, 0x82, // IEND CRC
]);

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Work out where the copy should go, from the command line or the env.
function pickOutputDir(argv: string[]): string {
  let flagged: string | undefined;
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--output" || arg === "--out" || arg === "--output-dir" || arg === "-o") {
      if (i + 1 >= argv.length) fail(`option ${arg} needs a directory after it`);
      flagged = argv[i + 1];
      i += 1;
    } else if (
      arg.startsWith("--output=") ||
      arg.startsWith("--out=") ||
      arg.startsWith("--output-dir=")
    ) {
      flagged = arg.slice(arg.indexOf("=") + 1);
      if (flagged === "") fail(`option ${arg} needs a non-empty directory`);
    } else if (arg.startsWith("-o") && arg.length > 2) {
      flagged = arg.slice(2);
    } else if (arg.startsWith("-")) {
      fail(`unknown option: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }

  if (flagged !== undefined && positionals.length > 0) {
    fail("give the output directory once, either as a flag or as a positional argument");
  }
  if (positionals.length > 1) {
    fail(`expected at most one directory argument, got ${positionals.length}`);
  }
  if (flagged !== undefined) return resolve(flagged);
  if (positionals.length === 1) return resolve(positionals[0]);

  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") return resolve(fromEnv.trim());
  return "/output";
}

// Check the header, the IHDR dimensions and the IEND trailer of a PNG blob.
function checkPng(blob: Buffer, label: string): { width: number; height: number } {
  if (blob.length === 0) fail(`${label} is empty`);
  if (blob.length > MAX_FILE_BYTES) {
    fail(`${label} is ${blob.length} bytes, over the ${MAX_FILE_BYTES} byte limit`);
  }
  if (blob.length < 8 || !blob.subarray(0, 8).equals(PNG_MAGIC)) {
    fail(`${label} does not start with the PNG signature`);
  }
  if (blob.length < 33 || blob.toString("ascii", 12, 16) !== "IHDR") {
    fail(`${label} has no IHDR chunk where one is expected`);
  }
  if (blob.readUInt32BE(8) !== 13) {
    fail(`${label} has a malformed IHDR chunk (length is not 13 bytes)`);
  }
  const bitDepth = blob[24];
  const colorType = blob[25];
  if (![1, 2, 4, 8, 16].includes(bitDepth) || ![0, 2, 3, 4, 6].includes(colorType)) {
    fail(`${label} has an unsupported IHDR bit depth (${bitDepth}) or colour type (${colorType})`);
  }
  const width = blob.readUInt32BE(16);
  const height = blob.readUInt32BE(20);
  if (width === 0 || height === 0) fail(`${label} has zero width or height`);
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    fail(`${label} is ${width}x${height}, over the ${MAX_WIDTH}x${MAX_HEIGHT} limit`);
  }
  if (blob.length < 12 || !blob.subarray(blob.length - 12).equals(PNG_TAIL)) {
    fail(`${label} does not end with a proper IEND trailer`);
  }
  return { width, height };
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(here, PICTURE_NAME);
  if (!existsSync(sourcePath)) fail(`could not find ${PICTURE_NAME} next to main.ts`);

  const original = readFileSync(sourcePath);
  const { width, height } = checkPng(original, PICTURE_NAME);

  const outputDir = pickOutputDir(process.argv.slice(2));
  mkdirSync(outputDir, { recursive: true });
  const destPath = join(outputDir, PICTURE_NAME);
  copyFileSync(sourcePath, destPath);

  const copied = readFileSync(destPath);
  if (copied.length !== original.length) {
    fail(`copy is ${copied.length} bytes, original is ${original.length} bytes`);
  }
  if (!copied.equals(original)) fail("copy differs from the original, byte for byte");
  checkPng(copied, `copied ${PICTURE_NAME}`);

  console.log(`OK: ${PICTURE_NAME} ${original.length} bytes ${width}x${height} -> ${destPath}`);
}

main();
