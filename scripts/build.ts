/**
 * scripts/build.ts — @design-system/layout build script
 *
 * Run with: bun run scripts/build.ts
 * Flags:
 *   --css-only    only process CSS files
 *   --js-only     only transpile JS (skips CSS and type declarations)
 *   --types-only  only emit .d.ts files
 *   --watch       re-run on src/ changes (CSS + JS, no type declarations)
 *
 * Build pipeline per file:
 *
 *   CSS:
 *     src/<x>.css
 *       → dist/<x>.css           (LightningCSS: normalize, no minify)
 *       → dist/<x>.min.css       (LightningCSS: minify)
 *       → dist/<x>.css.map       (source map for readable output)
 *
 *   TypeScript (readable, unbundled — for bundler consumers):
 *     src/<x>.ts
 *       → dist/<x>.js            (tsc: transpile only, preserves imports)
 *       → dist/<x>.js.map        (source map)
 *       → dist/<x>.d.ts          (type declaration)
 *       → dist/<x>.d.ts.map      (declaration source map)
 *
 *   TypeScript (minified, bundled — for CDN consumers):
 *     src/<x>.ts
 *       → dist/<x>.min.js        (Bun.build: bundles deps, minifies)
 *       → dist/<x>.min.js.map    (source map)
 *
 * The readable JS preserves import statements (e.g. `import from '../core.js'`)
 * so bundlers can deduplicate the core utilities across modules.
 *
 * The minified JS bundles the core inline, making each file self-contained
 * for CDN <script type="module"> usage with no additional network requests.
 */

import { readdir, rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname, basename, extname } from "node:path";
import {
  transform as lcTransform,
  type BundleAsyncOptions,
} from "lightningcss";

/* ── Argument parsing ────────────────────────────────────── */

const args = new Set(process.argv.slice(2));
const CSS_ONLY = args.has("--css-only");
const JS_ONLY = args.has("--js-only");
const TYPES_ONLY = args.has("--types-only");
const WATCH = args.has("--watch");

const doCss = !JS_ONLY && !TYPES_ONLY;
const doJs = !CSS_ONLY && !TYPES_ONLY;
const doTypes = !CSS_ONLY && !JS_ONLY && !WATCH;

/* ── Paths ───────────────────────────────────────────────── */

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

/* ── Utilities ───────────────────────────────────────────── */

/** Recursively yield all file paths under a directory. */
async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

/** Mirror a src/ path to a dist/ path, optionally changing the extension. */
function toDistPath(srcPath: string, newExt?: string): string {
  const rel = relative(SRC, srcPath);
  const out = join(DIST, rel);
  if (!newExt) return out;
  return out.slice(0, -extname(out).length) + newExt;
}

/** Ensure a directory and all its parents exist. */
async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** Write a file, creating parent directories as needed. */
async function write(
  filePath: string,
  content: Uint8Array | string,
): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content);
  const rel = relative(ROOT, filePath);
  console.log(`  ✓  ${rel}`);
}

/** Spawn a subprocess and throw on non-zero exit. */
async function spawn(cmd: string[], opts?: { cwd?: string }): Promise<void> {
  const proc = Bun.spawn(cmd, {
    cwd: opts?.cwd ?? ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`Command failed (exit ${code}): ${cmd.join(" ")}`);
  }
}

/* ── CSS pipeline ────────────────────────────────────────── */

async function buildCSS(srcPath: string): Promise<void> {
  const src = await readFile(srcPath);

  // Readable output — normalizes syntax, emits source map
  const { code: readableCode, map: readableMap } = lcTransform({
    filename: srcPath,
    code: src,
    sourceMap: true,
  });

  const outReadable = toDistPath(srcPath); // dist/x.css
  const outMinified = toDistPath(srcPath, ".min.css"); // dist/x.min.css
  const outMap = outReadable + ".map"; // dist/x.css.map

  // Append the source map comment to the readable output
  const readableWithMap = readableMap
    ? Buffer.from(readableCode).toString() +
      `\n/*# sourceMappingURL=${basename(outMap)} */\n`
    : readableCode;

  await write(outReadable, readableWithMap);
  if (readableMap) await write(outMap, JSON.stringify(readableMap));

  // Minified output
  const { code: minCode } = lcTransform({
    filename: srcPath,
    code: src,
    minify: true,
  });

  await write(outMinified, minCode);
}

/* ── TypeScript pipeline ─────────────────────────────────── */

/*
    Readable + type declarations: handled by tsc in one pass.
    tsc reads tsconfig.json (rootDir: src, outDir: dist) and emits:
      - dist/<x>.js           (transpiled, preserves imports)
      - dist/<x>.js.map
      - dist/<x>.d.ts
      - dist/<x>.d.ts.map
    This is deliberately unbundled — import statements in the source
    become import statements in the output, which bundlers resolve.
*/
async function buildTypescript(): Promise<void> {
  console.log("\n  Running tsc…");
  await spawn(["tsc", "--project", "tsconfig.json"]);
}

/*
    Minified + bundled: handled by Bun.build() (esbuild) per entry point.
    Each entry point bundles its own dependencies (e.g. stacked.min.js
    inlines core.ts) so it's self-contained for CDN delivery.

    We discover entry points by finding all .ts files in src/ that are
    NOT internal-only helpers (no underscore prefix).
*/
async function buildMinified(): Promise<void> {
  const entrypoints: string[] = [];

  for await (const file of walk(SRC)) {
    if (extname(file) !== ".ts") continue;
    if (basename(file).startsWith("_")) continue; // skip private helpers
    entrypoints.push(file);
  }

  for (const entry of entrypoints) {
    const outDir = dirname(toDistPath(entry));
    const outName = basename(entry, ".ts") + ".min";

    const result = await Bun.build({
      entrypoints: [entry],
      outdir: outDir,
      format: "esm",
      minify: true,
      sourcemap: "external",
      naming: {
        entry: `${outName}.js`,
        chunk: `${outName}.[hash].js`,
      },
    });

    if (!result.success) {
      for (const log of result.logs) {
        console.error(log);
      }
      throw new Error(`Bun.build() failed for: ${entry}`);
    }

    // Log each output file
    for (const output of result.outputs) {
      const rel = relative(ROOT, output.path);
      console.log(`  ✓  ${rel}`);
    }
  }
}

/* ── Main ────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const start = performance.now();
  console.log("\n@design-system/layout — build\n");

  // Clean dist/
  console.log("  Cleaning dist/…");
  await rm(DIST, { recursive: true, force: true });
  await ensureDir(DIST);

  // CSS
  if (doCss) {
    console.log("\n  Processing CSS…");
    for await (const file of walk(SRC)) {
      if (extname(file) === ".css") {
        await buildCSS(file);
      }
    }
  }

  // TypeScript (readable via tsc, minified via Bun.build)
  if (doJs || doTypes) {
    console.log("\n  Transpiling TypeScript (tsc)…");
    await buildTypescript();
  }

  if (doJs) {
    console.log("\n  Bundling minified JS (Bun.build)…");
    await buildMinified();
  }

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`\n  Done in ${elapsed}s\n`);
}

/* ── Watch mode ──────────────────────────────────────────── */

async function watch(): Promise<void> {
  console.log("\n@design-system/layout — watch mode\n");
  console.log("  Watching src/ for changes…\n");

  // Initial build
  await main();

  // Bun's built-in file watcher
  const watcher = Bun.file(SRC);

  // Re-run on any change in src/
  // Note: `Bun.watch` is available in Bun >= 1.1
  // For earlier versions, fall back to `fs.watch`
  const { watch: nodeWatch } = await import("node:fs");
  nodeWatch(SRC, { recursive: true }, async (_, filename) => {
    if (!filename) return;
    console.log(`\n  Changed: ${filename}`);
    try {
      await main();
    } catch (err) {
      console.error("  Build error:", err);
    }
  });
}

/* ── Entry point ─────────────────────────────────────────── */

try {
  if (WATCH) {
    await watch();
  } else {
    await main();
  }
} catch (err) {
  console.error("\n  Build failed:\n", err);
  process.exit(1);
}
