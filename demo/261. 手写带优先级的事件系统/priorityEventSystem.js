/**
 * 带优先级的事件系统 (Priority Event System)
 *
 * Approach:
 * - Maintain a map of event name -> array of listeners.
 * - Each listener is wrapped with a priority number (higher = earlier execution).
 * - When emitting, listeners are sorted by priority (descending) before invocation.
 * - Supports on / off / once / emit. on() accepts an options object { priority }.
 * - Listeners with equal priority keep their insertion order (stable sort).
 */

class PriorityEventSystem {
  constructor() {
    // eventName -> [{ fn, priority, seq }]
    this._events = new Map();
    this._seq = 0;
  }

  on(event, fn, options = {}) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    const priority =
      typeof options.priority === "number" ? options.priority : 0;
    this._events.get(event).push({ fn, priority, seq: this._seq++ });
    return this;
  }

  once(event, fn, options = {}) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      return fn(...args);
    };
    wrapper._original = fn;
    return this.on(event, wrapper, options);
  }

  off(event, fn) {
    const list = this._events.get(event);
    if (!list) return this;
    if (!fn) {
      this._events.delete(event);
      return this;
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].fn === fn || list[i].fn._original === fn) {
        list.splice(i, 1);
      }
    }
    return this;
  }

  emit(event, ...args) {
    const list = this._events.get(event);
    if (!list || list.length === 0) return [];
    // Stable sort by priority descending, then by sequence ascending.
    const sorted = [...list].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.seq - b.seq;
    });
    const results = [];
    for (const item of sorted) {
      results.push(item.fn(...args));
    }
    return results;
  }

  listeners(event) {
    const list = this._events.get(event);
    if (!list) return [];
    return [...list]
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.seq - b.seq;
      })
      .map((item) => item.fn);
  }
}

// ---------------- Test cases ----------------
const bus = new PriorityEventSystem();

const calls = [];
bus.on("tick", () => calls.push("low-default"));
bus.on("tick", () => calls.push("high"), { priority: 10 });
bus.on("tick", () => calls.push("medium"), { priority: 5 });
bus.on("tick", () => calls.push("high-2"), { priority: 10 });

bus.emit("tick");
console.log(calls);
// Expected: [ 'high', 'high-2', 'medium', 'low-default' ]

// once listener removed after emit
const onceCalls = [];
bus.once("boom", () => onceCalls.push("once"));
bus.emit("boom");
bus.emit("boom");
console.log(onceCalls);
// Expected: [ 'once' ]

// off removes a specific listener
const removed = [];
const handler = () => removed.push("a");
bus.on("x", handler, { priority: 3 });
bus.off("x", handler);
bus.emit("x");
console.log(removed);
// Expected: []
