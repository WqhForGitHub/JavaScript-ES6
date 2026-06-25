/**
 * 手写获取元素的实际宽高（含 padding/border/margin）
 * Measure the full rendered size of an element, optionally including padding,
 * border, and margin -- going beyond offsetWidth/offsetHeight which only
 * include content + padding + border.
 *
 * Approach:
 * - `getActualSize(el, opts)` returns:
 *     {
 *       content:  { w, h },   // content box (clientWidth - padding)
 *       client:   { w, h },   // content + padding
 *       offset:   { w, h },   // content + padding + border (incl. scrollbar)
 *       outer:    { w, h },   // offset + margin
 *       parts:    { pt, pr, pb, pl, bt, br, bb, bl, mt, mr, mb, ml }
 *     }
 * - Reads padding/border/margin from getComputedStyle, converting 'px'
 *   strings to numbers (non-px values fall back to 0 with a note).
 * - `opts.box` selects which measurement to return as the "primary": one of
 *   'content' | 'client' | 'offset' | 'outer' (default 'outer').
 * - `getOuterWidth(el)` / `getOuterHeight(el)` are convenience shortcuts.
 * - Provide Node-testable pure helpers operating on a fake element so the
 *   arithmetic can be verified.
 *
 * @param {HTMLElement} el
 * @param {{box?:'content'|'client'|'offset'|'outer'}} [opts]
 * @returns {{content:{w:number,h:number}, client:{w:number,h:number}, offset:{w:number,h:number}, outer:{w:number,h:number}, parts:object, primary:{w:number,h:number}}}
 */
function getActualSize(el, opts = {}) {
  const { box = "outer" } = opts;
  if (!el || typeof el.offsetWidth !== "number") {
    return null;
  }

  const parts = readParts(el);
  const scrollbarW = el.offsetWidth - el.clientWidth - (parts.bl + parts.br);
  const scrollbarH = el.offsetHeight - el.clientHeight - (parts.bt + parts.bb);

  // content box = client - padding (scrollbar is inside content area on most browsers).
  const contentW = Math.max(
    0,
    el.clientWidth - parts.pl - parts.pr - Math.max(0, scrollbarW),
  );
  const contentH = Math.max(
    0,
    el.clientHeight - parts.pt - parts.pb - Math.max(0, scrollbarH),
  );

  const sizes = {
    content: { w: contentW, h: contentH },
    client: { w: el.clientWidth, h: el.clientHeight },
    offset: { w: el.offsetWidth, h: el.offsetHeight },
    outer: {
      w: el.offsetWidth + parts.ml + parts.mr,
      h: el.offsetHeight + parts.mt + parts.mb,
    },
  };

  return {
    ...sizes,
    parts,
    primary: sizes[box] || sizes.outer,
  };
}

function getOuterWidth(el) {
  const s = getActualSize(el);
  return s ? s.outer.w : 0;
}
function getOuterHeight(el) {
  const s = getActualSize(el);
  return s ? s.outer.h : 0;
}

function readParts(el) {
  let style;
  if (
    typeof window !== "undefined" &&
    typeof window.getComputedStyle === "function"
  ) {
    style = window.getComputedStyle(el);
  } else if (el._computedStyle) {
    style = el._computedStyle;
  } else {
    style = {};
  }
  return {
    pt: px(style.paddingTop),
    pr: px(style.paddingRight),
    pb: px(style.paddingBottom),
    pl: px(style.paddingLeft),
    bt: px(style.borderTopWidth),
    br: px(style.borderRightWidth),
    bb: px(style.borderBottomWidth),
    bl: px(style.borderLeftWidth),
    mt: px(style.marginTop),
    mr: px(style.marginRight),
    mb: px(style.marginBottom),
    ml: px(style.marginLeft),
  };
}

function px(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const m = String(value).match(/^(-?\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : 0;
}

// ---------- Test cases ----------
// Build a fake element with explicit geometry + computed style.
function fakeEl(geom, style) {
  return {
    offsetWidth: geom.offsetWidth,
    offsetHeight: geom.offsetHeight,
    clientWidth: geom.clientWidth,
    clientHeight: geom.clientHeight,
    _computedStyle: style,
  };
}

// Scenario: content 100x50, padding 10 each side, border 2 each side, margin 5 each side.
// clientWidth = content + padding = 100 + 20 = 120
// offsetWidth = client + border = 120 + 4 = 124
// outer width = offset + margin = 124 + 10 = 134
const el = fakeEl(
  { offsetWidth: 124, offsetHeight: 74, clientWidth: 120, clientHeight: 70 },
  {
    paddingTop: "10px",
    paddingRight: "10px",
    paddingBottom: "10px",
    paddingLeft: "10px",
    borderTopWidth: "2px",
    borderRightWidth: "2px",
    borderBottomWidth: "2px",
    borderLeftWidth: "2px",
    marginTop: "5px",
    marginRight: "5px",
    marginBottom: "5px",
    marginLeft: "5px",
  },
);

const size = getActualSize(el);
console.log("content w/h:", size.content.w, size.content.h); // expected: 100 50
console.log("client w/h:", size.client.w, size.client.h); // expected: 120 70
console.log("offset w/h:", size.offset.w, size.offset.h); // expected: 124 74
console.log("outer w/h:", size.outer.w, size.outer.h); // expected: 134 84
console.log("parts pt:", size.parts.pt); // expected: 10
console.log("parts mr:", size.parts.mr); // expected: 5

console.log("default primary is outer:", size.primary.w); // expected: 134

const contentOnly = getActualSize(el, { box: "content" });
console.log("content primary:", contentOnly.primary.w, contentOnly.primary.h); // expected: 100 50

const offsetOnly = getActualSize(el, { box: "offset" });
console.log("offset primary:", offsetOnly.primary.w); // expected: 124

console.log("getOuterWidth:", getOuterWidth(el)); // expected: 134
console.log("getOuterHeight:", getOuterHeight(el)); // expected: 84

// Non-px margin / missing values default to 0.
const el2 = fakeEl(
  { offsetWidth: 50, offsetHeight: 50, clientWidth: 50, clientHeight: 50 },
  { marginTop: "1em", marginRight: "0px" },
);
const s2 = getActualSize(el2);
console.log("em margin -> 0:", s2.parts.mt); // expected: 0
console.log("outer with no border/padding:", s2.outer.w); // expected: 50 (offset 50 + margin 0)

// Null element returns null.
console.log("null el returns null:", getActualSize(null)); // expected: null

// px() helper.
console.log('px("12px"):', px("12px")); // expected: 12
console.log('px("0px"):', px("0px")); // expected: 0
console.log('px("1em"):', px("1em")); // expected: 0
console.log("px(null):", px(null)); // expected: 0
console.log("px(7):", px(7)); // expected: 7
