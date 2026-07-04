// scripts/upload-products.mjs
//
// ONE-TIME uploader: reads the three product zips from ~/src and puts them into
// the PRIVATE Netlify Blobs store "product-downloads", keyed by a stable slug.
// The zips are never committed to git and never served from public/ or dist/;
// they are only reachable through a valid download token (see download.js).
//
// Run once, with the Netlify environment available so @netlify/blobs can resolve
// the site + token automatically. Either of:
//
//   netlify env:exec -- node scripts/upload-products.mjs
//   # or, with an explicit context:
//   NETLIFY_SITE_ID=<id> NETLIFY_AUTH_TOKEN=<token> node scripts/upload-products.mjs
//
// Re-running is idempotent (it overwrites each key with the current file).

import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { BLOB_STORE_NAME, PRODUCTS } from "../netlify/functions/_deliver-lib.js";

const HOME = os.homedir();

// slug -> source zip on disk (outside the repo, never committed).
const SOURCES = {
  "filler-word-pack": path.join(HOME, "src", "filler-word-editor-pack-v1.0.zip"),
  "claude-code-for-writers": path.join(HOME, "src", "cc-for-writers-v1.0.zip"),
  "zettelkasten-kit": path.join(HOME, "src", "zk-creators-kit-v1.0.zip"),
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
  let store;
  try {
    store = getStore(BLOB_STORE_NAME);
  } catch (e) {
    console.error(
      "Could not open the Blobs store. Run this with the Netlify env available " +
        "(e.g. `netlify env:exec -- node scripts/upload-products.mjs`).",
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
