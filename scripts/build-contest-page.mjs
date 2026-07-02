// build-contest-page.mjs — generates public/writing-contests.html at build time.
//
// The contest finder is a client-side Vite SPA, so any JSON-LD injected at runtime
// is invisible to non-JS crawlers (GPTBot, PerplexityBot, Google raw-HTML crawl).
// This script bakes the contest list + JSON-LD into static server HTML that crawlers
// see without executing JavaScript. Interactive filtering is progressive enhancement
// layered on top of the already-present rows.
//
// Runs as a prebuild step (package.json "prebuild" script); output goes to public/
// so Vite copies it verbatim to dist/.
//
// No LLM in the data path. All content comes from contests.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const OUT  = join(repo, 'public', 'writing-contests.html');

const entries = JSON.parse(readFileSync(join(repo, 'src', 'data', 'contests.json'), 'utf8'));

// -- Deadline utilities (replicated — Node can't import Vite-native modules) --

function parseISODateUTC(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const ts = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(ts) ? null : ts;
}

function todayUTC() {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

function daysUntil(iso) {
  const d = parseISODateUTC(iso);
  return d === null ? null : Math.round((d - todayUTC()) / 86400000);
}

function formatDeadline(iso) {
  const ts = parseISODateUTC(iso);
  if (ts === null) return 'To be confirmed';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

// Mirror effectiveExpired from contestUtils.js:
// recurring entries are never "closed" — their listed date is the next known cut-off.
function effectiveExpired(entry) {
  const days = daysUntil(entry.deadline);
  return days !== null && days < 0 && !entry.recurring;
}

function deadlineLabel(entry) {
  const days = daysUntil(entry.deadline);
  if (days === null) return 'Deadline TBC';
  if (days < 0)  return entry.recurring ? 'Rolling deadline' : 'Closed';
  if (days === 0) return 'Closes today';
  if (days === 1) return '1 day left';
  if (days <= 7)  return `${days} days left`;
  if (days <= 30) return `${days} days left`;
  return formatDeadline(entry.deadline);
}

function escape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// -- Filter: only non-expired entries go into the static page and JSON-LD --
// (DoD: every ItemList endDate >= today, i.e. no expired entries in JSON-LD)

const live = entries.filter((e) => !effectiveExpired(e));
const today = new Date().toISOString().slice(0, 10);

// -- JSON-LD: Dataset + ItemList --

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Dataset',
      name: 'Writing Contests and Grants Database',
      description:
        'A curated database of writing contests, prizes, and grants with live deadlines, ' +
        'entry fees, eligibility details, and links to official pages.',
      url: 'https://becomeawritertoday.com/writing-contests-database/',
      dateModified: today,
      publisher: {
        '@type': 'Organization',
        name: 'Become a Writer Today',
        url: 'https://becomeawritertoday.com',
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    },
    {
      '@type': 'ItemList',
      name: 'Writing Contests and Grants',
      numberOfItems: live.length,
      itemListElement: live.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Event',
          name: e.name,
          url: e.url,
          endDate: e.deadline,
          description: e.eligibility || '',
          offers: e.freeEntry
            ? { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
            : undefined,
        },
      })),
    },
  ],
};

// -- HTML row per entry (server-rendered; crawler-visible before JS) --

function regionLabel(r) {
  const MAP = { worldwide: 'Worldwide', us: 'USA', uk: 'UK', ireland: 'Ireland', canada: 'Canada' };
  return r ? (MAP[r] || r) : '';
}

function genreLabel(slug) {
  return String(slug).split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function contestRow(e) {
  const label = deadlineLabel(e);
  const date = formatDeadline(e.deadline);
  const genres = (e.genres || []).map(genreLabel).join(', ');
  const region = regionLabel(e.region);
  const audience = (e.audience || []).join(', ');
  const year = e.deadline ? e.deadline.slice(0, 4) : '';
  const isExpiredRow = effectiveExpired(e);

  return `<tr class="contest-row${isExpiredRow ? ' expired' : ''}"
  data-genres="${escape((e.genres || []).join(' '))}"
  data-region="${escape(e.region || '')}"
  data-audience="${escape((e.audience || []).join(' '))}"
  data-cashprize="${e.hasCashPrize ? 'true' : 'false'}"
  data-free="${e.freeEntry ? 'true' : 'false'}"
  data-type="${escape(e.type)}"
  data-year="${escape(year)}">
  <td class="name-cell">
    <a href="${escape(e.url)}" target="_blank" rel="noopener noreferrer">${escape(e.name)}</a>
    ${e.stale ? '<span class="badge badge-warn" title="URL returned a non-200 response when last checked">verify link</span>' : ''}
  </td>
  <td>${escape(e.type === 'grant' ? 'Grant' : 'Contest')}</td>
  <td>${escape(genres)}</td>
  <td>${escape(e.fee || 'See website')}</td>
  <td>${escape(e.prize || '')}</td>
  <td>${escape(date)}${e.projected ? ' <span class="est" title="Estimated from prior annual cycle">est.</span>' : ''}</td>
  <td><span class="dl-label">${escape(label)}</span></td>
  <td>${escape(e.eligibility || '')}</td>
</tr>`;
}

const rows = live.map(contestRow).join('\n');

// -- Full page HTML --

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Writing Contests Database 2026 | Become a Writer Today</title>
<meta name="description" content="A filterable database of writing contests, grants, and prizes with live deadlines. Filter by genre, region, cash prize, or audience. Updated regularly from official sources.">
<meta property="og:title" content="Writing Contests Database">
<meta property="og:description" content="Filterable database of writing contests and grants, sorted by deadline. Genre, region, cash-prize, and audience filters.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#2B4C8C">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%232B4C8C'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='20' font-weight='bold' fill='white' text-anchor='middle'%3EW%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
<style>
  :root{
    --paper:#FCFCFB; --card:#FFFFFF; --ink:#1C2430; --ink-2:#5A6472; --muted:#8A93A0;
    --line:#E5E3DC; --brand:#2B4C8C; --brand-hover:#22407A; --data:#3E63AE;
    --good:#2E7D32; --warn:#B26A00; --bad:#B3261E;
    --good-bg:#EAF3EB; --warn-bg:#F7EFE2; --bad-bg:#F9E9E8;
    --radius:10px; --mono:'Courier Prime',ui-monospace,monospace;
    --display:'Zilla Slab',Georgia,serif;
    --body:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--paper);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1100px;margin:0 auto;padding:20px 16px 64px}
  a{color:var(--brand)}
  :focus-visible{outline:3px solid var(--brand);outline-offset:2px;border-radius:4px}

  header.site{padding:8px 0 28px}
  .eyebrow{font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-2);margin-bottom:10px}
  .eyebrow a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid var(--line)}
  h1{font-family:var(--display);font-weight:700;font-size:clamp(28px,6vw,38px);line-height:1.1;letter-spacing:-.01em}
  .lede{margin-top:10px;color:var(--ink-2);max-width:60ch}

  .filters{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 16px;padding:16px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius)}
  .filter-group{display:flex;flex-direction:column;gap:4px;min-width:130px}
  .filter-group label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-2)}
  select,input[type=text]{font-family:var(--body);font-size:14px;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink)}
  .check-row{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:12px;font-size:14px}
  .check-row label{display:flex;align-items:center;gap:6px;cursor:pointer}

  .results-meta{font-size:14px;color:var(--ink-2);margin-bottom:10px}
  .results-meta strong{color:var(--ink)}

  .tbl-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--radius)}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th{background:var(--card);font-weight:600;text-align:left;padding:10px 12px;border-bottom:2px solid var(--line);white-space:nowrap;font-size:13px;text-transform:uppercase;letter-spacing:.03em;color:var(--ink-2)}
  td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:none}
  tr.hidden-row{display:none}
  tr.expired td{opacity:.55}
  .name-cell a{font-weight:600;color:var(--brand);text-decoration:none}
  .name-cell a:hover{text-decoration:underline}

  .dl-label{font-size:12px;font-weight:600;padding:3px 8px;border-radius:12px;white-space:nowrap;background:#f0f0f0;color:#444}
  .est{font-size:11px;color:var(--muted)}
  .badge{display:inline-block;font-size:11px;padding:1px 6px;border-radius:4px;margin-left:4px}
  .badge-warn{background:var(--warn-bg);color:var(--warn)}

  .no-results{text-align:center;padding:40px;color:var(--ink-2);font-size:15px;display:none}
  .no-results.show{display:block}

  .footnote{margin-top:24px;font-size:12px;color:var(--muted);line-height:1.6}
  .cross-links{margin-top:20px;font-size:14px}
  .cross-links a{margin-right:16px}

  @media(max-width:700px){
    th:nth-child(n+4),td:nth-child(n+4){display:none}
    .filter-group{min-width:calc(50% - 8px)}
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="site">
    <p class="eyebrow"><a href="https://becomeawritertoday.com">Become a Writer Today</a></p>
    <h1>Writing Contests Database</h1>
    <p class="lede">A curated, filterable list of writing contests, grants, and prizes with live deadlines. Filter by genre, region, whether the prize is cash, and the year the contest closes. Each entry links directly to the organiser's page.</p>
  </header>

  <div class="filters" role="search" aria-label="Filter contests">
    <div class="filter-group">
      <label for="f-type">Type</label>
      <select id="f-type">
        <option value="">Contests and grants</option>
        <option value="contest">Contests only</option>
        <option value="grant">Grants only</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="f-genre">Genre</label>
      <select id="f-genre">
        <option value="">All genres</option>
        <option value="poetry">Poetry</option>
        <option value="short-story">Short Story</option>
        <option value="flash-fiction">Flash Fiction</option>
        <option value="novel">Novel</option>
        <option value="fiction">Fiction</option>
        <option value="nonfiction">Nonfiction</option>
        <option value="essay">Essay</option>
        <option value="memoir">Memoir</option>
        <option value="children">Children</option>
        <option value="speculative">Speculative</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="f-region">Region</label>
      <select id="f-region">
        <option value="">All regions</option>
        <option value="worldwide">Worldwide</option>
        <option value="us">USA</option>
        <option value="uk">UK</option>
        <option value="ireland">Ireland</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="f-year">Closing year</label>
      <select id="f-year">
        <option value="">Any year</option>
        <option value="2026">2026</option>
        <option value="2027">2027</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="f-search">Search</label>
      <input type="text" id="f-search" placeholder="Name, prize, eligibility..." style="min-width:160px">
    </div>
  </div>

  <div class="check-row">
    <label><input type="checkbox" id="f-cash"> Cash prize only</label>
    <label><input type="checkbox" id="f-free"> Free entry only</label>
    <label><input type="checkbox" id="f-hide-expired" checked> Hide closed</label>
  </div>

  <p class="results-meta"><span id="results-count"><strong>${live.length}</strong></span> contests and grants shown. Always confirm dates on the organiser's page before entering.</p>

  <div class="tbl-wrap">
    <table id="contests-table">
      <thead>
        <tr>
          <th>Contest / grant</th>
          <th>Type</th>
          <th>Genre</th>
          <th>Fee</th>
          <th>Prize</th>
          <th>Deadline</th>
          <th>Status</th>
          <th>Eligibility</th>
        </tr>
      </thead>
      <tbody id="contests-tbody">
${rows}
      </tbody>
    </table>
  </div>
  <p class="no-results" id="no-results">No contests match these filters. Try widening the genre or region.</p>

  <div class="cross-links">
    <a href="https://becomeawritertoday.com/free-writing-tools/">Free writing tools</a>
    <a href="https://becomeawritertoday.com/plan/">Book deadline planner</a>
  </div>

  <p class="footnote">
    Deadlines are hand-curated from official sources and verified by automated link checks. Entries verified on ${today}. Recurring contests show the next known cut-off; projected dates (est.) are estimated from each contest's prior annual cycle. Always confirm dates, fees, and rules on the organiser's own page before entering.
  </p>
</div>

<script>
(function () {
  var tbody = document.getElementById('contests-tbody');
  var noResults = document.getElementById('no-results');
  var countEl = document.getElementById('results-count');
  var rows = Array.from(tbody.querySelectorAll('tr.contest-row'));

  function get(id) { return document.getElementById(id); }

  function applyFilters() {
    var type    = get('f-type').value;
    var genre   = get('f-genre').value;
    var region  = get('f-region').value;
    var year    = get('f-year').value;
    var q       = get('f-search').value.trim().toLowerCase();
    var cash    = get('f-cash').checked;
    var free    = get('f-free').checked;
    var hideExp = get('f-hide-expired').checked;

    var shown = 0;
    rows.forEach(function (row) {
      var genres   = row.dataset.genres || '';
      var rowReg   = row.dataset.region || '';
      var rowType  = row.dataset.type   || '';
      var rowYear  = row.dataset.year   || '';
      var rowCash  = row.dataset.cashprize === 'true';
      var rowFree  = row.dataset.free === 'true';
      var isExp    = row.classList.contains('expired');

      var ok = true;
      if (type   && rowType !== type)               ok = false;
      if (genre  && genres.split(' ').indexOf(genre) < 0) ok = false;
      if (region && rowReg !== region)              ok = false;
      if (year   && rowYear !== year)               ok = false;
      if (cash   && !rowCash)                       ok = false;
      if (free   && !rowFree)                       ok = false;
      if (hideExp && isExp)                         ok = false;
      if (q) {
        var text = (row.textContent || '').toLowerCase();
        if (text.indexOf(q) < 0) ok = false;
      }

      row.classList.toggle('hidden-row', !ok);
      if (ok) shown++;
    });

    countEl.innerHTML = '<strong>' + shown + '</strong>';
    noResults.classList.toggle('show', shown === 0);
  }

  ['f-type','f-genre','f-region','f-year'].forEach(function(id){
    get(id).addEventListener('change', applyFilters);
  });
  get('f-search').addEventListener('input', applyFilters);
  ['f-cash','f-free','f-hide-expired'].forEach(function(id){
    get(id).addEventListener('change', applyFilters);
  });

  // Apply on load to respect the default "hide expired" checkbox
  applyFilters();
}());
</script>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`Generated ${OUT} (${live.length} non-expired entries, JSON-LD included)`);
