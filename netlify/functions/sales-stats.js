// netlify/functions/sales-stats.js
//
// GET /_sales : aggregate the private "product-sales" Blobs store into per-slug
// totals + overall count + gross revenue. Mirrors the affiliate hub's /_stats
// idea. Read-only. The response contains only slug / count / gross / currency;
// no email hashes or per-record data are exposed.
//
// Amounts are Stripe minor units (cents); gross_display divides by 100 for a
// human-readable figure in the record currency.

import { getSalesStore, readSalesStats } from "./_deliver-lib.js";

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify(obj),
  };
}

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== "GET") {
    return json(405, { error: "method-not-allowed" });
  }

  let stats;
  try {
    stats = await readSalesStats(getSalesStore());
  } catch (e) {
    console.error(`[sales-stats] read error: ${e.message}`);
    return json(500, { error: "stats-unavailable" });
  }

  const perSlug = Object.values(stats.perSlug).sort((a, b) => b.gross - a.gross);
  return json(200, {
    count: stats.count,
    gross: stats.gross,
    gross_display: Math.round(stats.gross) / 100,
    currency: stats.currency,
    products: perSlug,
  });
}
