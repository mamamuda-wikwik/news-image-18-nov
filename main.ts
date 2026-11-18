// 18 November 2026 in one image — make.fun news-image-20261118 entry.
//
// Copies the held front-page image (entry.png, next to this file) to
// <output>/entry.png. No network, no randomness: two runs write
// identical bytes. Node 22, standard library only.
//
// Usage:
//   node main.ts [--output <dir>]
// Output dir: --output, else $MAKEFUN_OUTPUT_DIR, else /output.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'entry.png');

function outDir(): string {
  const args = process.argv.slice(2);
  const i = args.indexOf('--output');
  if (i >= 0 && args[i + 1]) return args[i + 1];
  if (process.env.MAKEFUN_OUTPUT_DIR) return process.env.MAKEFUN_OUTPUT_DIR;
  return '/output';
}

function fail(msg: string): never {
  console.error('error: ' + msg);
  process.exit(1);
}

if (!existsSync(SRC)) fail('entry.png not found next to main.ts');

const buf = readFileSync(SRC);
if (buf.length < 33) fail('entry.png too small to be a PNG');
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) fail('entry.png is not a PNG file');
if (!buf.subarray(12, 16).equals(Buffer.from('IHDR'))) fail('entry.png has no IHDR chunk');
if (buf.readUInt32BE(8) !== 13) fail('entry.png IHDR chunk has wrong length');
if (buf.length < 45 || !buf.subarray(buf.length - 8, buf.length - 4).equals(Buffer.from('IEND'))) fail('entry.png has no IEND trailer');
if (buf.length > 1024 * 1024) fail(`entry.png is ${buf.length} bytes, over the 1 MiB limit`);
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width === 0 || height === 0) fail('entry.png has zero width or height');
if (width > 1024 || height > 1024) fail(`entry.png is ${width}x${height}, over the 1024x1024 limit`);

const out = outDir();
mkdirSync(out, { recursive: true });
const dest = join(out, 'entry.png');
copyFileSync(SRC, dest);
const written = statSync(dest).size;
if (written !== buf.length) fail('output size mismatch after copy');
console.log(`entry.png ${width}x${height}, ${buf.length} bytes -> ${dest}`);
