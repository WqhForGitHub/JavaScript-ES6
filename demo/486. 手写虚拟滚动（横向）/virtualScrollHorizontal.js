/**
 * 手写虚拟滚动（横向）
 * Horizontal virtual scroll that only renders columns in the visible horizontal range.
 *
 * Approach:
 * - Items are laid out left-to-right with fixed `itemWidth`.
 * - Given scrollLeft and viewportWidth, compute the visible [start, end) slice,
 *   adding a buffer on both sides.
 * - Rendered items are absolutely positioned using `translateX(i * itemWidth)`.
 * - The inner spacer has width = total * itemWidth to give an accurate scrollbar.
 *
 * Browser-specific; exposes a pure compute core plus a DOM attach helper.
 */
function createVirtualScrollHorizontal(options) {
  const { count, itemWidth, viewportWidth, bufferSize = 3 } = options;

  function computeRange(scrollLeft) {
    const visibleCount = Math.ceil(viewportWidth / itemWidth);
    let start = Math.floor(scrollLeft / itemWidth) - bufferSize;
    if (start < 0) start = 0;
    let end = start + visibleCount + bufferSize * 2;
    if (end > count) end = count;
    return { start, end, visibleCount, totalWidth: count * itemWidth };
  }

  function render(scrollLeft, getItemData) {
    const { start, end, totalWidth } = computeRange(scrollLeft);
    const items = [];
    for (let i = start; i < end; i++) {
      items.push({
        index: i,
        data: getItemData ? getItemData(i) : i,
        offset: i * itemWidth,
      });
    }
    return { items, totalWidth, start, end };
  }

  function attach(container, getItemData, renderItemEl) {
    const inner = document.createElement("div");
    inner.style.position = "relative";
    inner.style.height = "100%";
    container.style.overflowX = "auto";
    container.style.overflowY = "hidden";
    container.style.whiteSpace = "nowrap";
    container.appendChild(inner);

    const draw = () => {
      const { items, totalWidth } = render(container.scrollLeft, getItemData);
      inner.style.width = totalWidth + "px";
      inner.innerHTML = "";
      items.forEach((it) => {
        const el = renderItemEl(it);
        el.style.position = "absolute";
        el.style.left = "0";
        el.style.top = "0";
        el.style.transform = `translateX(${it.offset}px)`;
        el.style.width = itemWidth + "px";
        el.style.height = "100%";
        inner.appendChild(el);
      });
    };

    container.addEventListener("scroll", draw);
    draw();
    return { redraw: draw };
  }

  return { computeRange, render, attach };
}

// ---------- Test cases ----------
const hs = createVirtualScrollHorizontal({
  count: 500,
  itemWidth: 120,
  viewportWidth: 600,
  bufferSize: 2,
});

const r0 = hs.render(0, (i) => `Col ${i}`);
console.log(
  "scrollLeft=0 start:",
  r0.start,
  "end:",
  r0.end,
  "totalWidth:",
  r0.totalWidth,
);
// expected: scrollLeft=0 start: 0 end: 9 totalWidth: 60000 (visibleCount=5 + buffer*2=4 => 9)
console.log("first item offset:", r0.items[0].offset); // expected: 0

const rMid = hs.render(2400, (i) => `Col ${i}`);
console.log("scrollLeft=2400 start:", rMid.start, "end:", rMid.end);
// expected: scrollLeft=2400 start: 18 end: 27

console.log("attach helper exists:", typeof hs.attach === "function"); // expected: true
