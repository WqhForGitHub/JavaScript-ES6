/**
 * 手写动态修改 CSS 类名
 * A small toolkit for manipulating an element's class list beyond what the
 * native classList API offers: batch add/remove, conditional toggle with a
 * predicate, swap two classes, toggle from a map, and bulk operations on
 * multiple elements.
 *
 * Approach:
 * - All helpers accept either a real HTMLElement (uses classList) or a plain
 *   object with a `classList` array / `className` string (for Node testing).
 * - `addClass`, `removeClass`, `toggleClass`, `hasClass` wrap classList with
 *   input validation (split on whitespace, dedupe).
 * - `toggleClassIf(el, cls, predicate)` adds when predicate true, removes
 *   when false -- more explicit than the native 2-arg toggle.
 * - `swapClass(el, addCls, removeCls)` is a common React pattern.
 * - `setClassesFromMap(el, { active: true, disabled: false, ... })` applies a
 *   batch in one pass.
 * - `applyToAll(elements, fn)` runs a class-manipulating function over a list.
 * - Return values where useful (e.g. hasClass returns boolean, toggleClass
 *   returns the new state).
 *
 * @param {HTMLElement|{classList:{add:Function,remove:Function,toggle:Function,contains:Function}}} el
 */
function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (el.classList && typeof el.classList.contains === "function") {
    return el.classList.contains(cls);
  }
  return parseClassName(el.className).includes(cls);
}

function addClass(el, ...classes) {
  if (!el) return;
  const list = flattenClasses(classes);
  list.forEach((c) => {
    if (el.classList && typeof el.classList.add === "function")
      el.classList.add(c);
    else if (!hasClass(el, c))
      el.className = (el.className ? el.className + " " : "") + c;
  });
}

function removeClass(el, ...classes) {
  if (!el) return;
  const list = flattenClasses(classes);
  list.forEach((c) => {
    if (el.classList && typeof el.classList.remove === "function")
      el.classList.remove(c);
    else
      el.className = parseClassName(el.className)
        .filter((x) => x !== c)
        .join(" ");
  });
}

function toggleClass(el, cls, force) {
  if (!el || !cls) return false;
  if (typeof force === "boolean") {
    if (force) addClass(el, cls);
    else removeClass(el, cls);
    return force;
  }
  if (el.classList && typeof el.classList.toggle === "function") {
    return el.classList.toggle(cls);
  }
  const has = hasClass(el, cls);
  if (has) removeClass(el, cls);
  else addClass(el, cls);
  return !has;
}

function toggleClassIf(el, cls, predicate) {
  return toggleClass(el, cls, !!predicate);
}

function swapClass(el, addCls, removeCls) {
  if (removeCls) removeClass(el, removeCls);
  if (addCls) addClass(el, addCls);
}

function setClassesFromMap(el, map) {
  if (!el || !map) return;
  Object.entries(map).forEach(([cls, on]) => toggleClass(el, cls, !!on));
}

function applyToAll(elements, fn) {
  if (!elements) return;
  Array.from(elements).forEach((el) => fn && fn(el));
}

function flattenClasses(classes) {
  const out = [];
  classes.forEach((c) => {
    if (c == null) return;
    if (Array.isArray(c)) out.push(...flattenClasses(c));
    else if (typeof c === "string") {
      c.split(/\s+/).forEach((p) => {
        if (p) out.push(p);
      });
    }
  });
  return Array.from(new Set(out));
}

function parseClassName(cn) {
  if (!cn) return [];
  return String(cn).split(/\s+/).filter(Boolean);
}

// ---------- Test cases ----------
// Use a fake element with a real-ish classList backed by a Set.
function fakeEl(initial = "") {
  const set = new Set(parseClassName(initial));
  return {
    _set: set,
    get className() {
      return Array.from(set).join(" ");
    },
    set className(v) {
      set.clear();
      parseClassName(v).forEach((c) => set.add(c));
    },
    classList: {
      add(c) {
        set.add(c);
      },
      remove(c) {
        set.delete(c);
      },
      toggle(c, force) {
        if (typeof force === "boolean") {
          if (force) set.add(c);
          else set.delete(c);
          return force;
        }
        if (set.has(c)) {
          set.delete(c);
          return false;
        }
        set.add(c);
        return true;
      },
      contains(c) {
        return set.has(c);
      },
    },
  };
}

const el = fakeEl("box");
console.log("initial has box:", hasClass(el, "box")); // expected: true
console.log("initial has card:", hasClass(el, "card")); // expected: false

addClass(el, "card", "active");
console.log("after add:", el.className); // expected: box card active

addClass(el, "card"); // dedupe, no-op
console.log("after re-add same:", el.className); // expected: box card active

// Variadic + array + space-separated string.
addClass(el, ["a b"], "c");
console.log("after array+string add:", el.className); // expected: contains box card active a b c

removeClass(el, "a", "b");
console.log("after remove a,b:", el.className); // expected: box card active c

console.log("toggle c off:", toggleClass(el, "c")); // expected: false
console.log("toggle c on:", toggleClass(el, "c")); // expected: true

console.log("toggleClassIf true:", toggleClassIf(el, "open", 1 > 0)); // expected: true
console.log("hasClass open:", hasClass(el, "open")); // expected: true
console.log("toggleClassIf false:", toggleClassIf(el, "open", 1 < 0)); // expected: false
console.log("hasClass open after:", hasClass(el, "open")); // expected: false

swapClass(el, "large", "box");
console.log("after swap:", el.className); // expected: card active c large (box removed, large added)

setClassesFromMap(el, { large: false, small: true, rounded: true });
console.log("after map:", el.className); // expected: card active c small rounded

applyToAll([fakeEl("x"), fakeEl("y")], (e) => addClass(e, "bulk"));
const arr = [fakeEl("x")];
applyToAll(arr, (e) => addClass(e, "bulk"));
console.log("applyToAll added bulk:", hasClass(arr[0], "bulk")); // expected: true

// Edge cases.
console.log("null el hasClass:", hasClass(null, "x")); // expected: false
console.log("empty cls hasClass:", hasClass(el, "")); // expected: false
addClass(null, "x"); // no throw
console.log("null addClass no throw: true");
