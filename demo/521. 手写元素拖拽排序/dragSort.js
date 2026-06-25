/**
 * 手写元素拖拽排序
 * Make a list of sibling elements reorderable via native HTML5 drag-and-drop.
 *
 * Approach:
 * - `enableDragSort(container, opts)` makes each direct child draggable.
 * - On `dragstart`: store the dragging element, add a `dragging` class.
 * - On `dragover`: prevent default (so drop is allowed) and, if the pointer
 *   is in the upper half of the hovered child, insert the dragged item before
 *   it; otherwise insert after. This gives live reordering feedback.
 * - On `drop` / `dragend`: cleanup classes and fire `onOrderChange` with the
 *   new order of items (by their `data-id` or index).
 * - Support both horizontal (next/prev based on x midpoint) and vertical
 *   layouts via `opts.direction`.
 * - Support a `getOrder()` accessor and `disable()` to turn it off.
 * - In Node we expose `computeInsertPosition(draggedIdx, hoverIdx, pointerRatio, direction)`
 *   as a pure helper so the reordering math can be tested without events.
 *
 * @param {HTMLElement} container
 * @param {{direction?:'vertical'|'horizontal', onOrderChange?:Function, itemSelector?:string}} [opts]
 * @returns {{getOrder:Function, disable:Function}}
 */
function enableDragSort(container, opts = {}) {
  if (typeof document === "undefined")
    return { getOrder: () => [], disable: () => {} };
  const {
    direction = "vertical",
    onOrderChange = () => {},
    itemSelector = null,
  } = opts;

  let dragging = null;

  function getItems() {
    const children = Array.from(container.children);
    return itemSelector
      ? children.filter((c) => c.matches(itemSelector))
      : children;
  }

  function getItemId(el, idx) {
    return el.dataset?.id != null ? el.dataset.id : String(idx);
  }

  function getOrder() {
    return getItems().map((el, i) => getItemId(el, i));
  }

  function onDragStart(e) {
    dragging = e.currentTarget;
    dragging.classList.add("dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // Firefox requires setData to start dragging.
      try {
        e.dataTransfer.setData("text/plain", "");
      } catch (_) {}
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    if (!dragging) return;
    const target = e.currentTarget;
    if (target === dragging) return;
    const rect = target.getBoundingClientRect();
    const ratio =
      direction === "vertical"
        ? (e.clientY - rect.top) / rect.height
        : (e.clientX - rect.left) / rect.width;
    if (ratio < 0.5) {
      container.insertBefore(dragging, target);
    } else {
      container.insertBefore(dragging, target.nextSibling);
    }
  }

  function onDragEnd() {
    if (dragging) dragging.classList.remove("dragging");
    dragging = null;
    onOrderChange(getOrder());
  }

  function bind(item) {
    item.draggable = true;
    item.addEventListener("dragstart", onDragStart);
    item.addEventListener("dragover", onDragOver);
    item.addEventListener("dragend", onDragEnd);
  }
  function unbind(item) {
    item.draggable = false;
    item.removeEventListener("dragstart", onDragStart);
    item.removeEventListener("dragover", onDragOver);
    item.removeEventListener("dragend", onDragEnd);
  }

  getItems().forEach(bind);

  return {
    getOrder,
    disable() {
      getItems().forEach(unbind);
    },
  };
}

/**
 * Pure helper for testing the insertion logic without DOM events.
 * Returns 'before' or 'after' describing where the dragged item should go
 * relative to the hovered item.
 */
function computeInsertPosition(pointerRatio) {
  return pointerRatio < 0.5 ? "before" : "after";
}

/**
 * Pure reorder helper: given the current order, the dragged item id, the
 * hovered item id, and where to insert, return the new order array.
 */
function reorder(order, draggedId, hoverId, position) {
  const without = order.filter((id) => id !== draggedId);
  const idx = without.indexOf(hoverId);
  if (idx === -1) return without.concat(draggedId);
  const insertAt = position === "before" ? idx : idx + 1;
  const result = without.slice(0, insertAt);
  result.push(draggedId);
  result.push(...without.slice(insertAt));
  return result;
}

// ---------- Test cases ----------
// Test the pure math helpers in Node.
console.log("ratio 0.2 -> before:", computeInsertPosition(0.2)); // expected: before
console.log("ratio 0.5 -> after:", computeInsertPosition(0.5)); // expected: after
console.log("ratio 0.8 -> after:", computeInsertPosition(0.8)); // expected: after

// reorder: move 'a' before 'c' in [a,b,c,d] -> [b,a,c,d]
console.log(
  "move a before c:",
  reorder(["a", "b", "c", "d"], "a", "c", "before"),
);
// expected: ['b','a','c','d']

// reorder: move 'd' after 'b' in [a,b,c,d] -> [a,b,d,c]
console.log(
  "move d after b:",
  reorder(["a", "b", "c", "d"], "d", "b", "after"),
);
// expected: ['a','b','d','c']

// reorder: move 'b' before 'a' (front) -> [b,a,c,d]
console.log(
  "move b before a:",
  reorder(["a", "b", "c", "d"], "b", "a", "before"),
);
// expected: ['b','a','c','d']

// reorder: move 'a' after 'd' (end) -> [b,c,d,a]
console.log(
  "move a after d:",
  reorder(["a", "b", "c", "d"], "a", "d", "after"),
);
// expected: ['b','c','d','a']

// reorder: dragging onto unknown target just appends.
console.log(
  "unknown target appends:",
  reorder(["a", "b"], "a", "zzz", "before"),
);
// expected: ['b','a']

// enableDragSort in Node returns a stub.
const stub = enableDragSort({});
console.log("node stub getOrder:", stub.getOrder()); // expected: []
console.log("node stub disable is fn:", typeof stub.disable === "function"); // expected: true
