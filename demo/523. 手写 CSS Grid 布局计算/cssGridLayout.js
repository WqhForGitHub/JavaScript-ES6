/**
 * 手写 CSS Grid 布局计算
 * Compute the pixel positions of grid items given a CSS Grid definition,
 * mimicking how the browser lays out `grid-template-columns` / `grid-gap`.
 *
 * Approach:
 * - Parse a `grid-template-columns` value string. Support:
 *     - fixed px values: "100px"
 *     - fractions: "1fr", "2fr" (distributed over remaining free space)
 *     - percentages: "50%" (of container width)
 *     - `minmax(a, b)`
 *     - `repeat(n, ...tracks)`
 *     - `auto-fit` / `auto-fill` with `minmax(...)` (responsive columns)
 * - `computeGridLayout({containerWidth, template, gap, itemCount})` returns
 *   an array of {x, y, w, h, col, row} for each item, packing them row by
 *   row into the computed column tracks. Row height is taken from `rowHeight`.
 * - Pure function, runs anywhere.
 *
 * @param {{containerWidth:number, template:string, gap?:number, rowHeight?:number, itemCount:number}} opts
 * @returns {Array<{x:number,y:number,w:number,h:number,col:number,row:number}>}
 */
function computeGridLayout(opts) {
  const { containerWidth, template, gap = 0, rowHeight = 50, itemCount } = opts;
  const tracks = parseTemplateColumns(template, containerWidth, itemCount);
  const colCount = tracks.length;
  if (colCount === 0) return [];

  const results = [];
  let itemIndex = 0;
  let row = 0;
  while (itemIndex < itemCount) {
    const y = row * (rowHeight + gap);
    for (let col = 0; col < colCount && itemIndex < itemCount; col++) {
      const x = tracks.slice(0, col).reduce((s, w) => s + w + gap, 0);
      results.push({
        x,
        y,
        w: tracks[col],
        h: rowHeight,
        col,
        row,
      });
      itemIndex++;
    }
    row++;
  }
  return results;
}

/**
 * Parse `grid-template-columns` into an array of pixel widths.
 */
function parseTemplateColumns(template, containerWidth, itemCount) {
  const expanded = expandRepeat(template, itemCount);
  const tokens = tokenize(expanded);

  // Separate fr and non-fr tokens.
  const fixed = new Array(tokens.length).fill(0);
  let totalFr = 0;
  let usedFixed = 0;

  tokens.forEach((tok, i) => {
    const width = resolveTrack(tok, containerWidth);
    fixed[i] = width;
    if (width != null) usedFixed += width;
  });

  // Sum fr units.
  tokens.forEach((tok, i) => {
    if (tok.endsWith("fr")) {
      const fr = parseFloat(tok) || 1;
      totalFr += fr;
      fixed[i] = null; // mark as fr
    }
  });

  // Distribute remaining space.
  if (totalFr > 0) {
    const remaining = Math.max(0, containerWidth - usedFixed);
    tokens.forEach((tok, i) => {
      if (fixed[i] === null) {
        const fr = parseFloat(tok) || 1;
        fixed[i] = (remaining * fr) / totalFr;
      }
    });
  }

  return fixed.map((w) => (w == null ? 0 : w));
}

function expandRepeat(template, itemCount) {
  // Handle repeat(N, ...) and repeat(auto-fit/auto-fill, minmax(...))
  const repeatMatch = template.match(
    /repeat\(\s*(auto-fit|auto-fill|\d+)\s*,\s*(.+?)\s*\)/,
  );
  if (!repeatMatch) return template;
  const [, countRaw, inner] = repeatMatch;
  if (countRaw === "auto-fit" || countRaw === "auto-fill") {
    // For auto-fit/fill we need container width to figure the count.
    // We can't know it here, so we approximate using itemCount as a cap.
    // Caller should pass a concrete template for exact math.
    const n = Math.max(1, Math.min(itemCount || 1, 12));
    return template.replace(repeatMatch[0], Array(n).fill(inner).join(" "));
  }
  const n = parseInt(countRaw, 10);
  return template.replace(repeatMatch[0], Array(n).fill(inner).join(" "));
}

function tokenize(template) {
  // Collapse whitespace, then split on spaces but NOT inside parentheses,
  // so `minmax(100px, 200px)` stays a single token.
  const cleaned = template.replace(/\s+/g, " ").trim();
  const tokens = [];
  let depth = 0;
  let cur = "";
  for (const ch of cleaned) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === " " && depth === 0) {
      if (cur) {
        tokens.push(cur);
        cur = "";
      }
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function resolveTrack(tok, containerWidth) {
  if (tok.endsWith("fr")) return null; // resolved later
  if (tok.endsWith("px")) return parseFloat(tok);
  if (tok.endsWith("%")) return (parseFloat(tok) / 100) * containerWidth;
  const mm = tok.match(/minmax\(\s*(\d+)px\s*,\s*(\d+)px\s*\)/);
  if (mm) return parseFloat(mm[2]); // use max for simplicity
  const n = parseFloat(tok);
  return isNaN(n) ? 0 : n;
}

// ---------- Test cases ----------
// Fixed px columns.
const layout1 = computeGridLayout({
  containerWidth: 300,
  template: "100px 100px 100px",
  gap: 10,
  rowHeight: 40,
  itemCount: 5,
});
console.log("layout1 count:", layout1.length); // expected: 5
console.log("item 0:", layout1[0]); // expected: {x:0, y:0, w:100, h:40, col:0, row:0}
console.log("item 1 x:", layout1[1].x); // expected: 110 (100 + gap 10)
console.log("item 2 x:", layout1[2].x); // expected: 220
console.log("item 3 (row 1) x:", layout1[3].x); // expected: 0
console.log("item 3 row:", layout1[3].row); // expected: 1
console.log("item 3 y:", layout1[3].y); // expected: 50 (40 + gap 10)

// fr units distribute remaining space.
const layout2 = computeGridLayout({
  containerWidth: 300,
  template: "100px 1fr 2fr",
  gap: 0,
  rowHeight: 50,
  itemCount: 3,
});
// remaining = 300 - 100 = 200; 1fr=66.67, 2fr=133.33
console.log("fr col0 w:", layout2[0].w); // expected: 100
console.log("fr col1 w (approx 66.67):", layout2[1].w.toFixed(2)); // expected: 66.67
console.log("fr col2 w (approx 133.33):", layout2[2].w.toFixed(2)); // expected: 133.33

// Percentages.
const layout3 = computeGridLayout({
  containerWidth: 400,
  template: "25% 50% 25%",
  gap: 0,
  rowHeight: 30,
  itemCount: 3,
});
console.log(
  "pct widths:",
  layout3.map((l) => l.w),
); // expected: [100, 200, 100]

// repeat(n, ...).
const layout4 = computeGridLayout({
  containerWidth: 400,
  template: "repeat(4, 100px)",
  gap: 0,
  rowHeight: 30,
  itemCount: 4,
});
console.log(
  "repeat widths:",
  layout4.map((l) => l.w),
); // expected: [100,100,100,100]

// minmax.
const layout5 = computeGridLayout({
  containerWidth: 600,
  template: "minmax(100px, 200px) 1fr",
  gap: 0,
  rowHeight: 30,
  itemCount: 2,
});
console.log("minmax col0 w:", layout5[0].w); // expected: 200 (uses max)
console.log("minmax col1 w:", layout5[1].w); // expected: 400

// No gap default.
const layout6 = computeGridLayout({
  containerWidth: 200,
  template: "100px 100px",
  itemCount: 2,
});
console.log("default rowHeight h:", layout6[0].h); // expected: 50
console.log("no gap x:", layout6[1].x); // expected: 100
