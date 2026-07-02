/**
 * Single source of truth for the tool registry.
 *
 * Kept as plain JS (no JSX) so node-based tests can import it directly.
 * App.jsx renders from `tools`; `resolveTool` maps the ?tool= URL parameter
 * to a tool id. Unknown ids resolve to NOT_FOUND instead of silently falling
 * back to a default tool — a typo'd embed used to render the spelling quiz
 * on pages about something else entirely.
 */

export const tools = [
  { id: 'palindrome', name: 'Palindrome Checker', icon: '🔄' },
  { id: 'tone', name: 'Tone Checker', icon: '📝' },
  { id: 'rhyming', name: 'Rhyming Assistant', icon: '🎵' },
  { id: 'essay-hook', name: 'Essay Hook Generator', icon: '🪝' },
  { id: 'action-generator', name: 'Action Generator', icon: '⚡' },
  { id: 'descriptive-generator', name: 'Descriptive Generator', icon: '🎨' },
  { id: 'filler-words', name: 'Filler Words Processor', icon: '🧹' },
  { id: 'conjunction-tool', name: 'Conjunction Tool', icon: '🔗' },
  { id: 'female-authors', name: 'Female Authors Timeline', icon: '👩‍💼' },
  { id: 'hard-words-quiz', name: 'Hard Words Spelling Quiz', icon: '📝' },
  { id: 'writing-software-quiz', name: 'Writing Software Quiz', icon: '🧠' },
  { id: 'crime-thriller-quiz', name: 'Crime Thriller Book Finder', icon: '🔍' },
  { id: 'stephen-king-timeline', name: 'Stephen King Complete Timeline', icon: '📚' },
  { id: 'famous-poems-timeline', name: 'Most Famous Poems Timeline', icon: '📜' },
  { id: 'strong-female-character', name: 'Strong Female Characters', icon: '💪' },
  { id: 'grammarly-roi-calculator', name: 'Grammarly ROI Calculator', icon: '🧮' },
  { id: 'grammarly-plan-quiz', name: 'Grammarly Plan Finder', icon: '🎯' },
  { id: 'grammarly-comparison', name: 'Writing Tools Comparison', icon: '🔄' },
  { id: 'report-topics', name: 'Report Topics Generator', icon: '📋' },
  { id: 'grammar-examples', name: 'Grammar Examples Generator', icon: '📝' },
  { id: 'poetry-words', name: 'Poetry Words Generator', icon: '🌟' },
  { id: 'disney-hero-journey', name: "Disney Hero's Journey Explorer", icon: '🎬' },
  { id: 'writing-quality-scorer', name: 'Writing Quality Scorer', icon: '📊' },
  { id: 'random-words', name: 'Random Words Generator', icon: '🎲' },
  { id: 'romantic-words', name: 'Romantic Words Generator', icon: '💕' },
  { id: 'sad-words', name: 'Sad Words Generator', icon: '😢' },
  { id: 'contest-finder', name: 'Contest & Grant Finder', icon: '🏆' },
  { id: 'themed-words', name: 'Themed Word Generator', icon: '🎨' },
  { id: 'literary-devices', name: 'Literary Device Detector', icon: '🔎' },
  { id: 'root-explorer', name: 'Root Word Explorer', icon: '🌱' },
  { id: 'writing-app-finder', name: 'Writing App Finder', icon: '🧭' },
  { id: 'writer-pulse', name: 'Writer Pulse', icon: '📡' },
  { id: 'weekly-writing', name: 'This Week in Writing & AI', icon: '🗞️' },
  { id: 'concrete-poem-maker', name: 'Concrete Poem Maker', icon: '🔷' },
  { id: 'emotion-wheel', name: 'Emotion & Feelings Wheel', icon: '🎡' },
  { id: 'dead-word-checker', name: 'Dead / Weak-Word Checker', icon: '🩹' },
];

export const DEFAULT_TOOL = 'hard-words-quiz';

/** Sentinel state rendered as a visible "Tool not found" message. */
export const NOT_FOUND = 'not-found';

const KNOWN_TOOL_IDS = new Set(tools.map((t) => t.id));

/**
 * Map the ?tool= URL parameter to a tool id.
 * - no param → the default tool (landing page behaviour, unchanged)
 * - known id → that tool
 * - anything else → NOT_FOUND (visible message, never a silent wrong tool)
 */
export function resolveTool(toolParam) {
  if (!toolParam) return DEFAULT_TOOL;
  return KNOWN_TOOL_IDS.has(toolParam) ? toolParam : NOT_FOUND;
}
