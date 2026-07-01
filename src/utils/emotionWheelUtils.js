import wheel from '../data/emotionWheel.json';

// --- Data access ---------------------------------------------------------

export const CORES = wheel.cores;
export const WHEEL_SOURCE = wheel.source;

export function getCore(name) {
  return CORES.find((c) => c.name === name) || null;
}

// Every tertiary word beneath a core, flattened + de-duplicated (order kept).
export function coreWords(core) {
  if (!core) return [];
  const seen = new Set();
  const out = [];
  for (const s of core.secondary) {
    for (const t of s.tertiary) {
      if (!seen.has(t)) { seen.add(t); out.push(t); }
    }
  }
  return out;
}

// Rich related-word list for a branch: the secondary itself + its tertiary words,
// or (when no secondary is selected) the core-wide flattened list.
export function branchWords(core, secondaryName) {
  if (!core) return [];
  if (!secondaryName) return coreWords(core);
  const sec = core.secondary.find((s) => s.name === secondaryName);
  if (!sec) return coreWords(core);
  const seen = new Set();
  const out = [];
  for (const w of [sec.name, ...sec.tertiary]) {
    if (!seen.has(w)) { seen.add(w); out.push(w); }
  }
  return out;
}

export function totalWordCount() {
  let n = 0;
  for (const c of CORES) {
    n += 1;
    for (const s of c.secondary) n += 1 + s.tertiary.length;
  }
  return n;
}

// --- SVG geometry --------------------------------------------------------

// Angles measured clockwise from 12 o'clock (top).
export function polarToXY(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Path for an annular segment (ring wedge) between two radii and two angles.
export function ringSegmentPath(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  const p1 = polarToXY(cx, cy, rOuter, startAngle);
  const p2 = polarToXY(cx, cy, rOuter, endAngle);
  const p3 = polarToXY(cx, cy, rInner, endAngle);
  const p4 = polarToXY(cx, cy, rInner, startAngle);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

// Solid pie wedge from the centre.
export function wedgePath(cx, cy, r, startAngle, endAngle) {
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  const p1 = polarToXY(cx, cy, r, startAngle);
  const p2 = polarToXY(cx, cy, r, endAngle);
  return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
}

// A hex colour lightened toward white by t (0..1) — used for outer rings.
export function lighten(hex, t) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * t);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
