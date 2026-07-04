// scripts/build-deadline-database.mjs
//
// PRODUCT BUILD (Writers' Deadline Database, $29).
//
// Reads src/data/contests.json (ALL records) and emits ONE self-contained HTML
// file the buyer downloads and owns: embedded JSON data + inline CSS + vanilla
// JS, zero external/CDN dependencies. It works offline by double-clicking the
// file. Features: full-text search; filters (genre, region, free-vs-paid entry,
// has-cash-prize); sort by deadline / prize; days-left computed on load.
//
// Design split (see DECISIONS.md): the content generator `build({ outDir })` is
// pure and is what the self-test drives. The CLI tail below packages the output
// into build-output/deadline-database-v1.0.zip for the one-time Blobs upload.
// The zip step shells out to `zip` and is deliberately OUTSIDE build() so the
// tested path never needs the binary and no build output leaks into dist/.
//
// Brand palette: serif, cream #f6f4ef, red #b23a48 (the email-deliver palette).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CONTESTS_PATH = path.join(REPO_ROOT, "src", "data", "contests.json");

export const PRODUCT = {
  slug: "writers-deadline-database",
  zip: "deadline-database-v1.0.zip",
  htmlName: "writers-deadline-database-v1.0.html",
  version: "1.0",
};

// en dash (U+2013) + em dash (U+2014). Regular hyphen-minus is left alone, so
// slugs like "short-story" survive untouched.
const FANCY_DASH = /[–—]/;

// Clean fancy dashes out of a source string before it is embedded. Number
// ranges ("500-1,000") read best as "500 to 1,000"; every other use collapses
// to a plain hyphen. Deterministic, idempotent.
function cleanDashes(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2")
    .replace(/\s*[–—]\s*/g, "-");
}

function cleanRecord(rec) {
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    if (typeof v === "string") out[k] = cleanDashes(v);
    else if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === "string" ? cleanDashes(x) : x));
    else out[k] = v;
  }
  return out;
}

// Normalise a raw contest record into the shape the client renders. Keeps only
// the fields the UI shows so the embedded payload stays lean.
function toRow(rec) {
  const genres = Array.isArray(rec.genres) ? rec.genres : [];
  return {
    name: rec.name || "",
    type: rec.type || "contest",
    genres,
    region: rec.region || null,
    fee: rec.fee || (rec.freeEntry ? "Free entry" : ""),
    freeEntry: !!rec.freeEntry,
    hasCashPrize: !!rec.hasCashPrize,
    prize: rec.prize || "",
    prizeValue: prizeToNumber(rec.prize),
    eligibility: rec.eligibility || "",
    deadline: rec.deadline || null,
    projected: !!rec.projected,
    recurring: !!rec.recurring,
    url: rec.url || "",
    source: rec.source || "",
  };
}

// Parse the largest currency amount out of a free-text prize string so rows can
// be sorted by prize value. "£5,000 first prize" -> 5000. Currency-agnostic
// (used only for ordering, not display).
function prizeToNumber(prize) {
  if (typeof prize !== "string") return 0;
  const matches = prize.replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
  if (!matches) return 0;
  return matches.reduce((max, n) => Math.max(max, parseFloat(n)), 0);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(s) {
  return String(s)
    .split(/[-\s]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function buildHtml(rows, builtOn) {
  const genreSet = new Set();
  const regionSet = new Set();
  for (const r of rows) {
    r.genres.forEach((g) => genreSet.add(g));
    if (r.region) regionSet.add(r.region);
  }
  const genres = [...genreSet].sort();
  const regions = [...regionSet].sort();

  const genreOptions = genres.map((g) => `<option value="${esc(g)}">${esc(titleCase(g))}</option>`).join("");
  const regionOptions = regions.map((r) => `<option value="${esc(r)}">${esc(r.toUpperCase())}</option>`).join("");

  // The full dataset is embedded as JSON so the file works offline with no fetch.
  const dataJson = JSON.stringify(rows);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Writers' Deadline Database v${PRODUCT.version}</title>
<style>
  :root{
    --cream:#f6f4ef; --card:#ffffff; --ink:#2b2b2b; --ink-2:#555; --muted:#8a857c;
    --red:#b23a48; --red-dark:#8f2c39; --line:#e3ddd2;
    --good:#2e7d32; --good-bg:#eaf3eb; --warn:#b26a00; --warn-bg:#f7efe2;
    --bad:#b3261e; --bad-bg:#f9e9e8;
    --serif:Georgia,'Times New Roman',Times,serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--cream);color:var(--ink);font-family:var(--serif);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1140px;margin:0 auto;padding:28px 18px 72px}
  a{color:var(--red)}
  a:hover{color:var(--red-dark)}
  :focus-visible{outline:3px solid var(--red);outline-offset:2px;border-radius:4px}

  header.top{border-bottom:2px solid var(--line);padding-bottom:20px;margin-bottom:22px}
  .eyebrow{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--red);font-weight:700;margin-bottom:8px}
  h1{font-size:clamp(26px,5vw,36px);line-height:1.1;letter-spacing:-.01em}
  .lede{margin-top:10px;color:var(--ink-2);max-width:66ch}
  .howto{margin-top:16px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;max-width:none}
  .howto h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:var(--red);margin-bottom:8px}
  .howto ul{margin:0 0 0 20px;color:var(--ink-2);font-size:15px}
  .howto li{margin:4px 0}
  .howto .meta{margin-top:10px;font-size:13px;color:var(--muted)}

  .controls{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;margin:22px 0 14px;padding:16px;background:var(--card);border:1px solid var(--line);border-radius:10px}
  .field{display:flex;flex-direction:column;gap:5px;min-width:150px}
  .field label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-2)}
  input[type=text],select{font-family:var(--serif);font-size:15px;padding:8px 11px;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink)}
  input[type=text]{min-width:230px}
  .checks{display:flex;flex-wrap:wrap;align-items:center;gap:18px;margin:2px 0 14px;font-size:15px;color:var(--ink-2)}
  .checks label{display:flex;align-items:center;gap:7px;cursor:pointer}
  .count{font-size:15px;color:var(--ink-2);margin-bottom:10px}
  .count strong{color:var(--ink)}
  button.reset{font-family:var(--serif);font-size:14px;padding:8px 16px;border:1px solid var(--red);background:#fff;color:var(--red);border-radius:7px;cursor:pointer}
  button.reset:hover{background:var(--red);color:#fff}

  .tbl-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--card)}
  table{width:100%;border-collapse:collapse;font-size:14.5px}
  th{text-align:left;padding:11px 13px;border-bottom:2px solid var(--line);font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-2);white-space:nowrap;cursor:pointer;user-select:none;background:#fbfaf7}
  th.sortable:hover{color:var(--red)}
  th .arrow{opacity:.5;font-size:11px}
  td{padding:11px 13px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:none}
  tr.hidden{display:none}
  .cname{font-weight:700;font-size:15px}
  .cname a{text-decoration:none}
  .cmeta{font-size:12.5px;color:var(--muted);margin-top:3px}
  .tag{display:inline-block;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:11px;background:#efe7e8;color:var(--red);margin:2px 4px 2px 0;white-space:nowrap}
  .tag.free{background:var(--good-bg);color:var(--good)}
  .tag.grant{background:var(--warn-bg);color:var(--warn)}
  .dl{font-weight:700;white-space:nowrap}
  .days{display:block;font-size:12px;font-weight:400;margin-top:2px}
  .days.soon{color:var(--bad)}
  .days.ok{color:var(--good)}
  .days.past{color:var(--muted)}
  .prize{white-space:normal}
  .elig{color:var(--ink-2);font-size:13.5px;max-width:34ch}
  .empty{padding:28px;text-align:center;color:var(--muted)}
  footer{margin-top:26px;font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:16px}
  @media (max-width:640px){ .elig{display:none} }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">Become a Writer Today</div>
    <h1>Writers' Deadline Database</h1>
    <p class="lede">Every writing contest and grant worth chasing, in one searchable file you own. Search, filter, and sort to find the calls that fit your work, then click through to the organiser to enter.</p>
    <div class="howto">
      <h2>How to use this file</h2>
      <ul>
        <li>Type in the search box to match on name, genre, prize, or eligibility.</li>
        <li>Narrow the list with the genre and region menus, or the free entry and cash prize toggles.</li>
        <li>Click any column header to sort. Click again to reverse the order.</li>
        <li>Days left is calculated fresh every time you open the file, so it is always current.</li>
        <li>This is a single self-contained file. It works offline. Bookmark it or keep it on your desktop.</li>
      </ul>
      <p class="meta">Updated ${esc(builtOn)}. Deadlines and fees move. Always confirm the details on the organiser's own page before you enter.</p>
    </div>
  </header>

  <div class="controls">
    <div class="field">
      <label for="q">Search</label>
      <input type="text" id="q" placeholder="poetry, memoir, grant, worldwide...">
    </div>
    <div class="field">
      <label for="genre">Genre</label>
      <select id="genre"><option value="">All genres</option>${genreOptions}</select>
    </div>
    <div class="field">
      <label for="region">Region</label>
      <select id="region"><option value="">All regions</option>${regionOptions}</select>
    </div>
    <div class="field">
      <label>&nbsp;</label>
      <button class="reset" id="reset" type="button">Reset filters</button>
    </div>
  </div>
  <div class="checks">
    <label><input type="checkbox" id="freeOnly"> Free entry only</label>
    <label><input type="checkbox" id="cashOnly"> Has a cash prize</label>
    <label><input type="checkbox" id="hideExpired"> Hide passed deadlines</label>
  </div>
  <div class="count" id="count"></div>

  <div class="tbl-wrap">
    <table>
      <thead>
        <tr>
          <th class="sortable" data-sort="name">Name <span class="arrow"></span></th>
          <th class="sortable" data-sort="genres">Genre <span class="arrow"></span></th>
          <th class="sortable" data-sort="region">Region <span class="arrow"></span></th>
          <th class="sortable" data-sort="fee">Fee <span class="arrow"></span></th>
          <th class="sortable" data-sort="prizeValue">Prize <span class="arrow"></span></th>
          <th class="sortable" data-sort="eligibility">Eligibility <span class="arrow"></span></th>
          <th class="sortable" data-sort="deadline">Deadline <span class="arrow">&#9650;</span></th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
    <div class="empty" id="empty" style="display:none">No contests match those filters. Try widening the search.</div>
  </div>

  <footer>
    Writers' Deadline Database v${PRODUCT.version}. Compiled by Become a Writer Today. Data is provided for research. Verify every deadline, fee, and eligibility rule on the organiser's site before entering.
  </footer>
</div>

<script>
"use strict";
var DATA = ${dataJson};

var state = { sort: "deadline", dir: 1 };
var els = {
  q: document.getElementById("q"),
  genre: document.getElementById("genre"),
  region: document.getElementById("region"),
  freeOnly: document.getElementById("freeOnly"),
  cashOnly: document.getElementById("cashOnly"),
  hideExpired: document.getElementById("hideExpired"),
  rows: document.getElementById("rows"),
  count: document.getElementById("count"),
  empty: document.getElementById("empty"),
  reset: document.getElementById("reset")
};

function daysLeft(deadline){
  if(!deadline) return null;
  var d = new Date(deadline + "T23:59:59");
  if(isNaN(d)) return null;
  var now = new Date();
  return Math.ceil((d - now) / 86400000);
}
function escHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function titleCase(s){
  return String(s).split(/[-\\s]/).map(function(w){return w?w[0].toUpperCase()+w.slice(1):w;}).join(" ");
}

function matches(r){
  var q = els.q.value.trim().toLowerCase();
  if(q){
    var hay = [r.name, r.genres.join(" "), r.region, r.fee, r.prize, r.eligibility, r.type].join(" ").toLowerCase();
    if(hay.indexOf(q) === -1) return false;
  }
  if(els.genre.value && r.genres.indexOf(els.genre.value) === -1) return false;
  if(els.region.value && r.region !== els.region.value) return false;
  if(els.freeOnly.checked && !r.freeEntry) return false;
  if(els.cashOnly.checked && !r.hasCashPrize) return false;
  if(els.hideExpired.checked){
    var dl = daysLeft(r.deadline);
    if(dl !== null && dl < 0) return false;
  }
  return true;
}

function cmp(a,b){
  var k = state.sort, av, bv;
  if(k === "genres"){ av = (a.genres[0]||""); bv = (b.genres[0]||""); }
  else if(k === "prizeValue"){ av = a.prizeValue; bv = b.prizeValue; }
  else if(k === "deadline"){
    av = a.deadline || "9999-12-31"; bv = b.deadline || "9999-12-31";
  } else { av = a[k]; bv = b[k]; }
  if(av == null) av = "";
  if(bv == null) bv = "";
  if(av < bv) return -1 * state.dir;
  if(av > bv) return 1 * state.dir;
  // Stable tie-break by name so ordering is deterministic.
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function rowHtml(r){
  var tags = r.genres.map(function(g){ return '<span class="tag">'+escHtml(titleCase(g))+'</span>'; }).join("");
  if(r.type === "grant") tags = '<span class="tag grant">Grant</span>' + tags;
  var feeTag = r.freeEntry ? '<span class="tag free">Free</span>' : "";
  var dl = daysLeft(r.deadline);
  var dlText, dlClass, dlMain;
  if(r.deadline == null){ dlMain = r.recurring ? "Rolling" : "See site"; dlText = ""; dlClass = "past"; }
  else {
    dlMain = r.deadline;
    if(dl < 0){ dlText = Math.abs(dl) + " days ago"; dlClass = "past"; }
    else if(dl === 0){ dlText = "closes today"; dlClass = "soon"; }
    else if(dl <= 21){ dlText = dl + " days left"; dlClass = "soon"; }
    else { dlText = dl + " days left"; dlClass = "ok"; }
  }
  if(r.projected) dlMain += " (projected)";
  var nameCell = r.url
    ? '<a href="'+escHtml(r.url)+'" target="_blank" rel="noopener">'+escHtml(r.name)+'</a>'
    : escHtml(r.name);
  return '<tr>'
    + '<td><div class="cname">'+nameCell+'</div><div class="cmeta">'+escHtml(r.source||"")+'</div></td>'
    + '<td>'+tags+'</td>'
    + '<td>'+escHtml(r.region ? r.region.toUpperCase() : "-")+'</td>'
    + '<td>'+feeTag+' '+escHtml(r.fee||"-")+'</td>'
    + '<td class="prize">'+escHtml(r.prize||"-")+'</td>'
    + '<td class="elig">'+escHtml(r.eligibility||"-")+'</td>'
    + '<td><span class="dl">'+escHtml(dlMain)+'</span><span class="days '+dlClass+'">'+escHtml(dlText)+'</span></td>'
    + '</tr>';
}

function render(){
  var list = DATA.filter(matches).slice().sort(cmp);
  els.rows.innerHTML = list.map(rowHtml).join("");
  els.empty.style.display = list.length ? "none" : "block";
  els.count.innerHTML = "Showing <strong>" + list.length + "</strong> of " + DATA.length + " calls.";
  document.querySelectorAll("th.sortable .arrow").forEach(function(a){ a.innerHTML = ""; });
  var active = document.querySelector('th[data-sort="'+state.sort+'"] .arrow');
  if(active) active.innerHTML = state.dir === 1 ? "&#9650;" : "&#9660;";
}

document.querySelectorAll("th.sortable").forEach(function(th){
  th.addEventListener("click", function(){
    var key = th.getAttribute("data-sort");
    if(state.sort === key) state.dir *= -1;
    else { state.sort = key; state.dir = 1; }
    render();
  });
});
["q","genre","region","freeOnly","cashOnly","hideExpired"].forEach(function(id){
  var el = els[id];
  el.addEventListener(el.type === "checkbox" ? "change" : "input", render);
});
els.reset.addEventListener("click", function(){
  els.q.value = ""; els.genre.value = ""; els.region.value = "";
  els.freeOnly.checked = false; els.cashOnly.checked = false; els.hideExpired.checked = false;
  state.sort = "deadline"; state.dir = 1;
  render();
});

render();
</script>
</body>
</html>`;
}

// Pure content generator. Reads contests.json, cleans dashes, emits the HTML.
// Returns { records, html, htmlPath } so the self-test can assert on it without
// touching the zip/CLI path.
export async function build({ outDir } = {}) {
  const raw = JSON.parse(await readFile(CONTESTS_PATH, "utf8"));
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("build-deadline-database: contests.json is empty or not an array");
  }
  const rows = raw.map(cleanRecord).map(toRow);

  // Fail loud if any fancy dash survived into the payload.
  const embedded = JSON.stringify(rows);
  if (FANCY_DASH.test(embedded)) {
    throw new Error("build-deadline-database: en/em dash leaked into embedded data");
  }

  const builtOn = new Date().toISOString().slice(0, 10);
  const html = buildHtml(rows, builtOn);

  let htmlPath = null;
  if (outDir) {
    await mkdir(outDir, { recursive: true });
    htmlPath = path.join(outDir, PRODUCT.htmlName);
    await writeFile(htmlPath, html, "utf8");
  }
  return { records: rows.length, html, htmlPath, builtOn };
}

// CLI tail: build to build-output/ then package the zip for the Blobs upload.
async function main() {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);

  const outDir = path.join(REPO_ROOT, "build-output");
  const res = await build({ outDir });
  console.log(`Deadline database: ${res.records} records -> ${res.htmlPath}`);

  // zip -j puts the single HTML at the archive root (no nested dirs).
  const zipPath = path.join(outDir, PRODUCT.zip);
  await run("zip", ["-j", "-q", "-X", "-o", zipPath, res.htmlPath], { cwd: outDir }).catch(async () => {
    // -o (store-only if newer) is not universal; retry without it.
    await run("zip", ["-j", "-q", zipPath, res.htmlPath], { cwd: outDir });
  });
  console.log(`Packaged ${zipPath}`);
  console.log(`Upload with: NETLIFY_SITE_ID=... NETLIFY_AUTH_TOKEN=... node scripts/upload-products.mjs`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
