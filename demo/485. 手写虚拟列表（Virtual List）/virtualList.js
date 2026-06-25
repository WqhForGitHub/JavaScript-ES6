/**
 * 手写虚拟列表（Virtual List）
 * Virtual list (vertical) that only renders the visible slice of a large dataset.
 *
 * Approach:
 * - Given total item count, fixed item height, container height, and scrollTop:
 *   compute the start index = floor(scrollTop / itemHeight) minus buffer,
 *   and the end index = startIndex + visibleCount + buffer.
 * - Clamp indices to [0, total).
 * - The visible items are absolutely positioned using `transform: translateY(i * itemHeight)`.
 * - The inner spacer has height = total * itemHeight so the scrollbar reflects the full list.
 * - `render(items)` produces an array of render descriptors { index, data, offset }.
 *
 * Browser-specific; we expose a pure computation core plus a DOM render helper.
 */
function createVirtualList(options) {
  const { count, itemHeight, viewportHeight, bufferSize = 5 } = options;

  function computeRange(scrollTop) {
    const total = count;
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    let start = Math.floor(scrollTop / itemHeight) - bufferSize;
    if (start < 0) start = 0;
    let end = start + visibleCount + bufferSize * 2;
    if (end > total) end = total;
    return { start, end, visibleCount, totalHeight: total * itemHeight };
  }

  function render(scrollTop, getItemData) {
    const { start, end, totalHeight } = computeRange(scrollTop);
    const items = [];
    for (let i = start; i < end; i++) {
      items.push({
        index: i,
        data: getItemData ? getItemData(i) : i,
        offset: i * itemHeight,
      });
    }
    return { items, totalHeight, start, end };
  }

  // Attach to a real DOM container (browser only).
  function attach(container, getItemData, renderItemEl) {
    const inner = document.createElement("div");
    inner.style.position = "relative";
    inner.style.width = "100%";
    container.style.overflow = "auto";
    container.style.position = "relative";
    container.appendChild(inner);

    const draw = () => {
      const { items, totalHeight } = render(container.scrollTop, getItemData);
      inner.style.height = totalHeight + "px";
      // Rebuild children for simplicity (production would diff).
      inner.innerHTML = "";
      items.forEach((it) => {
        const el = renderItemEl(it);
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.transform = `translateY(${it.offset}px)`;
        el.style.height = itemHeight + "px";
        el.style.width = "100%";
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
const vl = createVirtualList({
  count: 1000,
  itemHeight: 30,
  viewportHeight: 300,
  bufferSize: 2,
});

const r0 = vl.render(0, (i) => `Item ${i}`);
console.log(
  "scrollTop=0 start:",
  r0.start,
  "end:",
  r0.end,
  "totalHeight:",
  r0.totalHeight,
);
// expected: scrollTop=0 start: 0 end: 14 totalHeight: 30000
console.log("first rendered item:", r0.items[0]);
// expected: first rendered item: { index: 0, data: 'Item 0', offset: 0 }

const rMid = vl.render(1500, (i) => `Item ${i}`);
console.log("scrollTop=1500 start:", rMid.start, "end:", rMid.end);
// expected: scrollTop=1500 start: 48 end: 64 (visibleCount=10 + buffer*2=4 => 14 items)

console.log(
  "virtual list attach helper exists:",
  typeof vl.attach === "function",
);
// expected: virtual list attach helper exists: true
