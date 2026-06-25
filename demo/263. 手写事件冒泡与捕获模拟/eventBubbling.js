/**
 * 事件冒泡与捕获模拟 (Event Bubbling & Capturing Simulation)
 *
 * Approach:
 * - Build a tree of "nodes", each with an id, parent and children.
 * - Each node may register listeners for a given phase ('capture' | 'bubble').
 * - dispatch(target) walks from root -> target collecting capture listeners,
 *   then walks target -> root collecting bubble listeners.
 * - stopPropagation() halts further traversal in the current phase (and beyond).
 * - Each Event object carries type, target, currentTarget, phase and a stopped flag.
 */

class Event {
  constructor(type) {
    this.type = type;
    this.target = null;
    this.currentTarget = null;
    this.phase = null; // 'capture' | 'target' | 'bubble'
    this._stopped = false;
  }
  stopPropagation() {
    this._stopped = true;
  }
  get stopped() {
    return this._stopped;
  }
}

class Node {
  constructor(id) {
    this.id = id;
    this.parent = null;
    this.children = [];
    // phase -> type -> [fn]
    this._listeners = { capture: new Map(), bubble: new Map() };
  }

  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  on(type, fn, phase = "bubble") {
    const map = this._listeners[phase];
    if (!map.has(type)) map.set(type, []);
    map.get(type).push(fn);
    return this;
  }

  // Returns the path from root down to this node (inclusive).
  getPath() {
    const path = [];
    let cur = this;
    while (cur) {
      path.unshift(cur);
      cur = cur.parent;
    }
    return path;
  }
}

function dispatchEvent(target, type) {
  const event = new Event(type);
  event.target = target;
  const path = target.getPath(); // root ... target

  // Capture phase: root -> ... -> target (exclusive of target's parent includes target? include target)
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    event.currentTarget = node;
    event.phase = i === path.length - 1 ? "target" : "capture";
    const fns = node._listeners.capture.get(type);
    if (fns) {
      for (const fn of fns) {
        fn(event);
        if (event.stopped) return event;
      }
    }
    if (event.stopped) return event;
  }

  // Bubble phase: target -> ... -> root
  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    event.currentTarget = node;
    event.phase = i === path.length - 1 ? "target" : "bubble";
    const fns = node._listeners.bubble.get(type);
    if (fns) {
      for (const fn of fns) {
        fn(event);
        if (event.stopped) return event;
      }
    }
    if (event.stopped) return event;
  }

  return event;
}

// ---------------- Test cases ----------------
// Build tree: body -> div -> button
const body = new Node("body");
const div = new Node("div");
const button = new Node("button");
body.appendChild(div);
div.appendChild(button);

const log = [];
body.on("click", (e) => log.push(`body capture [${e.phase}]`), "capture");
div.on("click", (e) => log.push(`div capture [${e.phase}]`), "capture");
body.on("click", (e) => log.push(`body bubble [${e.phase}]`), "bubble");
div.on("click", (e) => log.push(`div bubble [${e.phase}]`), "bubble");
button.on("click", (e) => log.push(`button target [${e.phase}]`), "bubble");

dispatchEvent(button, "click");
console.log(log);
// Expected order:
// [ 'body capture [capture]',
//   'div capture [capture]',
//   'button target [target]',
//   'div bubble [bubble]',
//   'body bubble [bubble]' ]

// stopPropagation test
const log2 = [];
div.on(
  "click",
  (e) => {
    log2.push("div bubble (stops)");
    e.stopPropagation();
  },
  "bubble",
);
body.on("click", () => log2.push("body bubble"), "bubble");
dispatchEvent(button, "click");
console.log(log2);
// Expected: [ 'div bubble (stops)' ]  (body bubble never reached)
