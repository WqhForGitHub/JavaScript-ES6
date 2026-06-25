/**
 * 手写 CSS 媒体查询判断
 * Evaluate whether a CSS media query string currently matches the viewport.
 *
 * Approach:
 * - Use window.matchMedia(query) when available; it returns a MediaQueryList
 *   whose `.matches` boolean is the answer.
 * - Provide `mediaQueryMatch(query)` synchronous helper.
 * - Provide `watchMediaQuery(query, cb)` that subscribes to changes and
 *   returns an unsubscribe function (uses both `addEventListener` and the
 *   legacy `addListener` for old browsers).
 * - In Node (no window.matchMedia) we provide a tiny manual evaluator that
 *   handles the most common `min-width` / `max-width` / `min-height` /
 *   `max-height` queries against a passed-in `viewport` for testability.
 *
 * @param {string} query - e.g. "(min-width: 768px)"
 * @param {{width?:number, height?:number}} [viewport] - for Node fallback
 * @returns {boolean}
 */
function mediaQueryMatch(query, viewport = { width: 1024, height: 768 }) {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    return window.matchMedia(query).matches;
  }
  return evalMediaQuery(query, viewport);
}

function watchMediaQuery(query, cb) {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    // Node: nothing to listen to.
    return () => {};
  }
  const mql = window.matchMedia(query);
  const handler = (e) => cb(e.matches, e);
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }
  // Legacy Safari < 14.
  mql.addListener(handler);
  return () => mql.removeListener(handler);
}

/**
 * Minimal manual evaluator supporting:
 *   (min-width: Npx), (max-width: Npx),
 *   (min-height: Npx), (max-height: Npx),
 *   and `and` conjunctions.
 * @param {string} query
 * @param {{width:number, height:number}} vp
 */
function evalMediaQuery(query, vp) {
  // Split on "and" (case-insensitive) and trim.
  const parts = query
    .replace(/^\s*screen\s+and\s+/i, "")
    .split(/\s+and\s+/i)
    .map((s) => s.trim());

  return parts.every((part) => {
    const m = part.match(
      /\(\s*(min-width|max-width|min-height|max-height)\s*:\s*(\d+)px\s*\)/i,
    );
    if (!m) return true; // unknown feature -> assume true
    const [, featRaw, numRaw] = m;
    const feat = featRaw.toLowerCase();
    const n = parseInt(numRaw, 10);
    if (feat === "min-width") return vp.width >= n;
    if (feat === "max-width") return vp.width <= n;
    if (feat === "min-height") return vp.height >= n;
    if (feat === "max-height") return vp.height <= n;
    return true;
  });
}

// ---------- Test cases ----------
// Use the manual evaluator by passing an explicit viewport.
console.log(
  "768w matches (min-width:768):",
  mediaQueryMatch("(min-width: 768px)", { width: 768, height: 600 }),
); // expected: true

console.log(
  "500w matches (min-width:768):",
  mediaQueryMatch("(min-width: 768px)", { width: 500, height: 600 }),
); // expected: false

console.log(
  "1024w matches (max-width:1200) and (min-width:768):",
  mediaQueryMatch("(max-width: 1200px) and (min-width: 768px)", {
    width: 1024,
    height: 768,
  }),
); // expected: true

console.log(
  "1300w matches (max-width:1200) and (min-width:768):",
  mediaQueryMatch("(max-width: 1200px) and (min-width: 768px)", {
    width: 1300,
    height: 768,
  }),
); // expected: false

console.log(
  "600h matches (min-height:800):",
  mediaQueryMatch("(min-height: 800px)", { width: 1024, height: 600 }),
); // expected: false

console.log(
  "900h matches (min-height:800):",
  mediaQueryMatch("(min-height: 800px)", { width: 1024, height: 900 }),
); // expected: true

// watchMediaQuery in Node returns a noop unsubscribe.
const unsub = watchMediaQuery("(min-width: 768px)", (matches) => {
  console.log("changed:", matches);
});
console.log("watch returns unsubscribe function:", typeof unsub === "function"); // expected: true
unsub();
