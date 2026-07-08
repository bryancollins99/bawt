// merge-contests.mjs — integrate staged discoveries into the canonical contests.json.
// Dedupes by normalized name + host. Dry-run by default; pass --write to apply.
// Strips helper fields; adds firstSeen. Human/PR ratifies the resulting diff.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const CONTESTS = join(repo, 'src', 'data', 'contests.json');
const STAGE = join(here, '.contest-discovered.json');
const write = process.argv.includes('--write');

const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
const host = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return ''; } };

const existing = JSON.parse(readFileSync(CONTESTS, 'utf8'));
const staged = JSON.parse(readFileSync(STAGE, 'utf8'));
const known = new Set(existing.flatMap(e => [norm(e.name), host(e.url)]).filter(Boolean));
const today = new Date().toISOString().slice(0, 10);

const toAdd = [];
for (const c of staged) {
  if (known.has(norm(c.name)) || (host(c.url) && known.has(host(c.url)))) continue;
  known.add(norm(c.name));
  const { _reason, _confirm, discoveredGenre, ...rec } = c;
  toAdd.push({ ...rec, firstSeen: today });
}

console.error(`existing: ${existing.length} | staged: ${staged.length} | new to add: ${toAdd.length}`);
const conf = toAdd.filter(c => !c.projected).length;
console.error(`  of new: ${conf} confirmed-deadline, ${toAdd.length - conf} projected`);
for (const c of toAdd) console.error(`  + ${c.projected ? '⏳' : '✅'} ${c.name} (${c.deadline || 'TBC'})`);

if (write && toAdd.length) {
  writeFileSync(CONTESTS, JSON.stringify([...existing, ...toAdd], null, 2));
  console.error(`\nWROTE ${existing.length + toAdd.length} contests to contests.json`);
} else {
  console.error(`\n(dry run — pass --write to apply; ${toAdd.length} would be added)`);
}
