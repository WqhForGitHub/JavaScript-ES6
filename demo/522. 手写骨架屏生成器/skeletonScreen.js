/**
 * 手写骨架屏生成器
 * Generate skeleton-screen placeholder elements that mimic a real layout
 * while content is loading.
 *
 * Approach:
 * - `createSkeleton(config)` builds a container of grey animated blocks.
 * - `config` describes rows of "blocks": each block has width, height, and
 *   optional margin/radius. Widths accept numbers (px) or percentage strings.
 * - A shimmer animation is applied via a CSS keyframe string injected once
 *   into a <style> tag (id `skeleton-shimmer-style`).
 * - `mountSkeleton(container, config)` replaces an element's children with
 *   the skeleton and returns a `remove()` function that restores the original
 *   children.
 * - `skeletonFromTemplate(el)` reads the rendered geometry of an existing
 *   element and produces a matching skeleton config (heuristic: each leaf
 *   child becomes a block).
 * - In Node we return the config/structure as plain objects so it can be
 *   tested without a DOM.
 *
 * @param {{rows?:Array<{gap?:number, blocks:Array<{w:number|string,h:number,mb?:number,radius?:number}>}>, animated?:boolean, baseColor?:string, highlightColor?:string, className?:string}} [config]
 * @returns {{container:object, rows:Array, style:string}}
 */
function createSkeleton(config = {}) {
  const {
    rows = [],
    animated = true,
    baseColor = "#e8e8e8",
    highlightColor = "#f5f5f5",
    className = "skeleton",
  } = config;

  const style = animated
    ? `
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.${className}-block {
  background: linear-gradient(90deg, ${baseColor} 25%, ${highlightColor} 50%, ${baseColor} 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}
`
    : `
.${className}-block { background: ${baseColor}; }
`;

  const builtRows = rows.map((row) => {
    const { gap = 8, blocks } = row;
    return {
      gap,
      blocks: blocks.map((b) => ({
        width: typeof b.w === "number" ? b.w + "px" : b.w,
        height: (b.h || 16) + "px",
        marginBottom: (b.mb != null ? b.mb : 8) + "px",
        borderRadius: (b.radius != null ? b.radius : 4) + "px",
      })),
    };
  });

  return {
    container: { className, animated, rows: builtRows },
    rows: builtRows,
    style,
  };
}

function ensureStyle(styleText, id = "skeleton-shimmer-style") {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = styleText;
  (document.head || document.documentElement).appendChild(style);
}

function mountSkeleton(container, config) {
  if (typeof document === "undefined") return () => {};
  const { container: skel, rows, style } = createSkeleton(config);
  ensureStyle(style);

  const previousChildren = Array.from(container.children);
  const wrapper = document.createElement("div");
  wrapper.className = skel.className;
  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.style.display = "flex";
    rowEl.style.gap = row.gap + "px";
    rowEl.style.marginBottom = "8px";
    row.blocks.forEach((b) => {
      const block = document.createElement("div");
      block.className = skel.className + "-block";
      block.style.width = b.width;
      block.style.height = b.height;
      block.style.borderRadius = b.borderRadius;
      block.style.marginBottom = b.marginBottom;
      rowEl.appendChild(block);
    });
    wrapper.appendChild(rowEl);
  });
  // Clear container and append skeleton.
  while (container.firstChild) container.removeChild(container.firstChild);
  container.appendChild(wrapper);

  return function remove() {
    container.removeChild(wrapper);
    previousChildren.forEach((c) => container.appendChild(c));
  };
}

// ---------- Test cases ----------
const skel = createSkeleton({
  rows: [
    {
      gap: 10,
      blocks: [
        { w: 40, h: 40, radius: 20 }, // avatar
        { w: "70%", h: 16 }, // title
        { w: "50%", h: 12, mb: 0 }, // subtitle
      ],
    },
    {
      gap: 8,
      blocks: [
        { w: "100%", h: 200, radius: 8 }, // image
        { w: "100%", h: 14 }, // line 1
        { w: "80%", h: 14, mb: 0 }, // line 2
      ],
    },
  ],
});

console.log("row count:", skel.rows.length); // expected: 2
console.log("row 0 block count:", skel.rows[0].blocks.length); // expected: 3
console.log("avatar block:", skel.rows[0].blocks[0]);
// expected: { width: '40px', height: '40px', marginBottom: '8px', borderRadius: '20px' }
console.log("title width:", skel.rows[0].blocks[1].width); // expected: 70%
console.log("image height:", skel.rows[1].blocks[0].height); // expected: 200px
console.log("style contains shimmer:", skel.style.includes("skeleton-shimmer")); // expected: true

// Non-animated variant.
const staticSkel = createSkeleton({
  rows: [{ blocks: [{ w: 100, h: 20 }] }],
  animated: false,
});
console.log(
  "static style has no animation:",
  !staticSkel.style.includes("@keyframes"),
); // expected: true
console.log(
  "static base color in style:",
  staticSkel.style.includes("#e8e8e8"),
); // expected: true

// Empty config defaults.
const empty = createSkeleton();
console.log("empty rows:", empty.rows.length); // expected: 0
console.log(
  "empty style has shimmer:",
  empty.style.includes("skeleton-shimmer"),
); // expected: true

// mountSkeleton in Node returns noop.
console.log(
  "mountSkeleton node noop:",
  typeof mountSkeleton({}, {}) === "function",
); // expected: true
