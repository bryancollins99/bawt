// scripts/upload-products.mjs
//
// ONE-TIME uploader: reads the three product zips from ~/src and puts them into
// the PRIVATE Netlify Blobs store "product-downloads", keyed by a stable slug.
// The zips are never committed to git and never served from public/ or dist/;
// they are only reachable through a valid download token (see download.js).
//
// Run once. A bare `node` script has no injected Blobs context, so supply the
// site id + a Netlify personal access token explicitly (this always works):
//
//   NETLIFY_SITE_ID=<site-id> NETLIFY_AUTH_TOKEN=<netlify-PAT> \
//     node scripts/upload-products.mjs
//
// (If run inside a Netlify build/function context where a Blobs context is
// already present, the explicit config is skipped automatically.)
//
// Re-running is idempotent (it overwrites each key with the current file).

import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getStore } from "@netlify/blobs";
import { BLOB_STORE_NAME, PRODUCTS } from "../netlify/functions/_deliver-lib.js";

const HOME = os.homedir();
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_OUTPUT = path.join(REPO_ROOT, "build-output");

// slug -> source zip on disk (outside the repo, never committed).
// Mixed pattern: the older three products live under ~/src; the two products
// built in-repo (deadline database, prompt pack) are packaged into build-output/
// by their build scripts, so point at those. Run each build script first:
//   node scripts/build-deadline-database.mjs && node scripts/build-prompt-pack.mjs
const SOURCES = {
  "filler-word-pack": path.join(HOME, "src", "filler-word-editor-pack-v1.0.zip"),
  "claude-code-for-writers": path.join(HOME, "src", "cc-for-writers-v1.0.zip"),
  "zettelkasten-kit": path.join(HOME, "src", "zk-creators-kit-v1.0.zip"),
  "writers-deadline-database": path.join(BUILD_OUTPUT, "deadline-database-v1.0.zip"),
  "prompt-word-bank-pack": path.join(BUILD_OUTPUT, "prompt-word-bank-pack-v1.0.zip"),
};

// Sanity: every product slug in the mapping must have a source file here.
const mappedSlugs = new Set(Object.values(PRODUCTS).map((p) => p.slug));
for (const slug of mappedSlugs) {
  if (!SOURCES[slug]) {
    console.error(`No source zip configured for mapped slug "${slug}"`);
    process.exit(1);
  }
}

async function main() {
  // In a deployed Netlify context the Blobs context is injected and getStore(name)
  // works. In a bare `node` script it is not, so pass siteID + token explicitly.
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN;

  let store;
  try {
    store =
      siteID && token
        ? getStore({ name: BLOB_STORE_NAME, siteID, token })
        : getStore(BLOB_STORE_NAME);
  } catch (e) {
    console.error(
      "Could not open the Blobs store. Run with an explicit context:\n" +
        "  NETLIFY_SITE_ID=<site-id> NETLIFY_AUTH_TOKEN=<netlify-PAT> " +
        "node scripts/upload-products.mjs",
    );
    console.error(e.message);
    process.exit(1);
  }

  for (const [slug, file] of Object.entries(SOURCES)) {
    let data;
    try {
      data = await readFile(file);
    } catch (e) {
      console.error(`Skipping ${slug}: cannot read ${file} (${e.code || e.message})`);
      process.exitCode = 1;
      continue;
    }
    await store.set(slug, data, {
      metadata: { filename: path.basename(file), bytes: data.length },
    });
    console.log(`Uploaded ${slug} <- ${file} (${data.length} bytes)`);
  }
  console.log(`Done. Store: "${BLOB_STORE_NAME}".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
