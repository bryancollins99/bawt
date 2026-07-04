// Affiliate configuration for the Become a Writer Today send engine.
//
// Every affiliate letter routes through the branded go-domain redirector:
//   https://go.becomeawritertoday.com/e/<slug>
// The merchant sits behind that slug; we never expose the raw merchant URL in
// the letter. Affiliated letters MUST carry one FTC / ASA disclosure line in
// both the HTML and the plain-text part (render.js injects it).

export const GO_DOMAIN = "go.becomeawritertoday.com";

// Known affiliate slugs. `detail` on an affiliate calendar slot / letter is the slug.
export const AFFILIATE_SLUGS = ["grammarly", "prowritingaid", "masterclass", "teachable"];

// Build the branded affiliate link for a slug.
export function affiliateLink(slug) {
  return `https://${GO_DOMAIN}/e/${slug}`;
}

export function isKnownSlug(slug) {
  return AFFILIATE_SLUGS.includes(slug);
}

// Single FTC / ASA compliant disclosure line. Plain text, no em dashes.
export const DISCLOSURE_LINE =
  "Disclosure: this email contains an affiliate link. If you buy through it I may earn a commission, at no extra cost to you.";
