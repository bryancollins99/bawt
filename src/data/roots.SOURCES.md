# Sources for `roots.json`

This dataset is **curated from authoritative references, not LLM-invented.** Every root, its
source-language classification (Latin / Greek), and its core meaning were checked against the
references below. Example words are real English words; their definitions are concise dictionary
senses. Nothing here is padded with invented roots to hit a count.

## Primary reference (root + origin + meaning backbone)

- **Wikipedia — "List of Greek and Latin roots in English"** (the canonical, cited compendium):
  - A–G: https://en.wikipedia.org/wiki/List_of_Greek_and_Latin_roots_in_English/A%E2%80%93G
  - H–O: https://en.wikipedia.org/wiki/List_of_Greek_and_Latin_roots_in_English/H%E2%80%93O
  - P–Z: https://en.wikipedia.org/wiki/List_of_Greek_and_Latin_roots_in_English/P%E2%80%93Z

  Used to fix each root's **source language (Latin vs Greek)** and core gloss. Source-language
  misclassification is the most common error when working from memory, so every `origin` field was
  reconciled against these pages.

## Corroborating references (common roots + example-word senses)

- **Reading Rockets — "Root Words, Suffixes, and Prefixes"**:
  https://www.readingrockets.org/topics/spelling-and-word-study/articles/root-words-suffixes-and-prefixes
- **Grammarly — "Root Words: Definition, Lists, and Examples"**:
  https://www.grammarly.com/blog/grammar/root-words/
- **Membean root pages** (e.g. `port` = carry): https://membean.com/roots/port-carry
- **Etymonline** (Online Etymology Dictionary) for individual affixes, e.g. `tele-`:
  https://www.etymonline.com/word/tele-
- Existing BAWT pages this tool converts: `/list-of-root-words/`, `/list-of-latin-root-words/`,
  `/list-of-greek-root-words/`, `/list-of-uncommon-words/`.

## Notes on honesty / known ambiguities

- A handful of forms are genuinely **homographic across origins or senses** — e.g. `ped-`
  (Latin *pes* "foot" vs Greek *paid-* "child"), `sol-` ("alone" vs "sun"), `mon-` ("warn/one" vs
  the *monos* "alone" behind *monastery*). The dataset stores the sense given; the "Break a word"
  tool therefore frames any algorithmic split as a **possible, unverified breakdown**, never a
  confident etymology, except for a small curated set of verified decompositions.
- Prefixes used only to *assist* decomposition (re-, con-, trans-, etc.) live in
  `src/utils/rootUtils.js` (`PREFIXES`), not in `roots.json`, so the "≥120 roots" count refers to
  genuine bound roots only. Their glosses come from the same Wikipedia list.

Last reconciled: 2026-07-01.
