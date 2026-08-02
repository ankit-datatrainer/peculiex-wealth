/**
 * Stock symbol formats, in one place.
 *
 * Three representations exist, and mixing them up is what leaked ".NS" into
 * the UI:
 *
 *   API / storage   "BHARTIARTL.NS"    Yahoo's exchange suffix. Required by
 *                                      the quote API and already written into
 *                                      every saved watchlist row, so this is
 *                                      the canonical form and must not change.
 *   URL             "BHARTIARTL-NSE"   What a visitor sees in the address bar.
 *   Display         "BHARTIARTL" + NSE Ticker on its own, exchange as a badge.
 *
 * Indices ("^NSEI") carry no suffix and pass through all three untouched.
 */

/**
 * Which exchange a stored symbol resolves to.
 *
 * The platform is BSE-only: the backend resolves every bare Indian ticker to
 * a ".BO" (BSE) Yahoo symbol, so a bare "RELIANCE" is a BSE line, not an NSE
 * one. Only an explicit ".NS" suffix means NSE, and those are rejected on the
 * way in — this branch exists purely so legacy rows can't be mislabelled.
 */
export function exchangeOf(symbol: string): "NSE" | "BSE" {
  return /\.NS$/i.test(symbol || "") ? "NSE" : "BSE";
}

/** "BHARTIARTL.NS" -> "BHARTIARTL". Safe to call on an already-clean symbol. */
export function displaySymbol(symbol: string): string {
  return (symbol || "").replace(/\.(NS|BO)$/i, "");
}

/**
 * API form -> URL form. "BHARTIARTL.NS" -> "BHARTIARTL-NSE".
 * Indices and unsuffixed tickers are returned unchanged.
 */
export function toUrlSymbol(symbol: string): string {
  const s = symbol || "";
  if (/\.NS$/i.test(s)) return `${s.replace(/\.NS$/i, "")}-NSE`;
  if (/\.BO$/i.test(s)) return `${s.replace(/\.BO$/i, "")}-BSE`;
  return s;
}

/**
 * URL form -> API form. Accepts the new "-NSE"/"-BSE" style and the legacy
 * ".NS"/".BO" style, so old links and bookmarks keep working.
 *
 * The suffix match is anchored to the end, so hyphenated tickers survive:
 * "BAJAJ-AUTO-NSE" -> "BAJAJ-AUTO.NS".
 */
export function toApiSymbol(urlSymbol: string): string {
  const s = decodeURIComponent(urlSymbol || "").trim();
  if (/-NSE$/i.test(s)) return `${s.replace(/-NSE$/i, "")}.NS`;
  if (/-BSE$/i.test(s)) return `${s.replace(/-BSE$/i, "")}.BO`;
  return s; // already ".NS"/".BO", an index, or a bare ticker
}

/** Ready-to-use href for a symbol page, from any of the three forms. */
export function marketHref(symbol: string): string {
  return `/markets/${encodeURIComponent(toUrlSymbol(symbol))}`;
}
