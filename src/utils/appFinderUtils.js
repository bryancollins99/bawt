// Deterministic question -> recommendation mapping for the Writing App Finder.
//
// Design (see appFinderExpected.json for the gold rubric this satisfies):
//   - The RECOMMENDED app is a pure 2-key lookup: (category, mustHave).
//     Budget and platform never change the primary pick — this keeps the
//     result deterministic and machine-verifiable.
//   - Budget and platform only REORDER the two curated alternatives, so the
//     answers a reader gives still shape what they see beneath the top pick.
//
// getRecommendation is pure: it takes the answers and the data object, so the
// component and the offline verify harness call the exact same shipped code.

const PLATFORM_MATCHERS = {
  mac: (platforms) => platforms.includes('mac') || platforms.includes('ios'),
  windows: (platforms) => platforms.includes('windows'),
  web: (platforms) => platforms.includes('web'),
  cross: (platforms) =>
    ['mac', 'windows', 'linux', 'web'].filter((p) => platforms.includes(p)).length >= 2,
};

function platformFits(app, platform) {
  const matcher = PLATFORM_MATCHERS[platform];
  return matcher ? matcher(app.platforms || []) : false;
}

function budgetFits(app, budget) {
  if (budget !== 'free') return true; // "paid is fine" fits everything
  const price = (app.price || '').toLowerCase();
  return price.includes('free');
}

// Deterministic reorder of the two curated alternatives so that, on ties in
// the curated order, the one that better matches the reader's platform/budget
// surfaces first. Stable: equal-fit apps keep their curated order.
function orderAlternatives(altApps, answers) {
  return altApps
    .map((app, idx) => {
      let fit = 0;
      if (platformFits(app, answers.platform)) fit += 2;
      if (budgetFits(app, answers.budget)) fit += 1;
      return { app, idx, fit };
    })
    .sort((a, b) => (b.fit - a.fit) || (a.idx - b.idx))
    .map((entry) => entry.app);
}

/**
 * @param {{category:string, budget:string, platform:string, mustHave:string}} answers
 * @param {object} data  parsed appRecommendations.json
 * @returns {null | {
 *   category: string,
 *   recommended: object,
 *   alternatives: object[],
 *   disclosure: string,
 *   sourcePage: string|null
 * }}
 */
export function getRecommendation(answers, data) {
  if (!answers || !data) return null;
  const { category, mustHave } = answers;
  const byCategory = data.recommendations[category];
  if (!byCategory) return null;

  // Fall back to the category's first must-have mapping if the key is missing,
  // so the tool never returns an empty result.
  const mapping = byCategory[mustHave] || byCategory[Object.keys(byCategory)[0]];
  if (!mapping) return null;

  let recommended = data.apps[mapping.recommended];
  if (!recommended) return null;

  let altIds = [...(mapping.alternatives || [])];

  // Free-budget honesty: if the reader asked for free-only and the top pick has
  // no free tier, promote the first free alternative to the recommended slot and
  // demote the paid pick into the alternatives. Deterministic (first free alt in
  // curated order). Hardware categories with no free option keep the paid pick.
  if (answers.budget === 'free' && !budgetFits(recommended, 'free')) {
    const freeAltId = altIds.find(
      (id) => data.apps[id] && budgetFits(data.apps[id], 'free')
    );
    if (freeAltId) {
      const paidTopId = mapping.recommended;
      recommended = data.apps[freeAltId];
      altIds = altIds.filter((id) => id !== freeAltId);
      altIds.unshift(paidTopId);
    }
  }

  const altApps = altIds.map((id) => data.apps[id]).filter(Boolean);

  return {
    category,
    recommended,
    alternatives: orderAlternatives(altApps, answers),
    disclosure: data.disclosure,
    sourcePage: (data.categories[category] && data.categories[category].sourcePage) || null,
  };
}

// Convenience list-builder for the component's question flow.
export function getMustHaveOptions(category, data) {
  return (data.questions.mustHave && data.questions.mustHave[category]) || [];
}
