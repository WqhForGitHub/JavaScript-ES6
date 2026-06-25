/**
 * 事件驱动模式 (Event-Driven Pattern)
 *
 * Approach:
 * - The core of Node.js-style and browser-style architectures: components emit and
 *   listen to named events instead of calling each other directly, producing a
 *   loosely-coupled, reactive system.
 * - We build an enhanced EventEmitter supporting:
 *     on/once/off/emit, removeListener/removeAllListeners, listenerCount,
 *     prependListener (high-priority), newListener/removeListener hooks, max
 *     listeners warning, wildcard events ('*'), and error events that throw when
 *     unhandled (matching Node semantics).
 * - We then compose a tiny event-driven app: a "Downloader" emits progress/done/
 *   error events consumed by independent UI and Logger listeners.
 */

class EventEmitter {
  constructor() {
    this._events = new Map();
    this._maxListeners = 10;
    // Internal hooks for observing listener registration.
    this._hooks = { newListener: [], removeListener: [] };
  }

  _list(event) {
    if (!this._events.has(event)) this._events.set(event, []);
    return this._events.get(event);
  }

  on(event, fn) {
    this._hooks.newListener.forEach((h) => h(event, fn));
    const list = this._list(event);
    list.push(fn);
    if (list.length > this._maxListeners) {
      console.warn(
        `Possible memory leak: ${event} has ${list.length} listeners (max ${this._maxListeners})`,
      );
    }
    return this;
  }

  prependListener(event, fn) {
    this._hooks.newListener.forEach((h) => h(event, fn));
    this._list(event).unshift(fn);
    return this;
  }

  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn(...args);
    };
    wrapper._original = fn;
    return this.on(event, wrapper);
  }

  off(event, fn) {
    const list = this._events.get(event);
    if (!list) return this;
    if (!fn) {
      // remove all for this event
      list.forEach((f) =>
        this._hooks.removeListener.forEach((h) => h(event, f)),
      );
      this._events.delete(event);
      return this;
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === fn || list[i]._original === fn) {
        this._hooks.removeListener.forEach((h) => h(event, list[i]));
        list.splice(i, 1);
      }
    }
    return this;
  }
  removeListener(event, fn) {
    return this.off(event, fn);
  }
  removeAllListeners(event) {
    if (event) this._events.delete(event);
    else this._events.clear();
    return this;
  }

  emit(event, ...args) {
    let delivered = 0;
    const list = this._events.get(event);
    if (list) {
      for (const fn of [...list]) {
        fn(...args);
        delivered++;
      }
    }
    // Wildcard listeners receive every event.
    const wild = this._events.get("*");
    if (wild) {
      for (const fn of [...wild]) {
        fn(event, ...args);
        delivered++;
      }
    }
    // Node semantics: unhandled 'error' throws.
    if (delivered === 0 && event === "error") {
      throw args[0] instanceof Error ? args[0] : new Error(String(args[0]));
    }
    return delivered > 0;
  }

  listenerCount(event) {
    return this._events.get(event)?.length || 0;
  }
  setMaxListeners(n) {
    this._maxListeners = n;
    return this;
  }
  onNewListener(fn) {
    this._hooks.newListener.push(fn);
    return this;
  }
  onRemoveListener(fn) {
    this._hooks.removeListener.push(fn);
    return this;
  }
}

// ---- Example component: a chunked Downloader ----
class Downloader extends EventEmitter {
  constructor(url, totalChunks = 3) {
    super();
    this.url = url;
    this.totalChunks = totalChunks;
  }
  async start() {
    for (let i = 1; i <= this.totalChunks; i++) {
      await new Promise((r) => setTimeout(r, 5));
      if (i === 2 && this.url.includes("fail")) {
        return this.emit("error", new Error(`Failed at chunk ${i}`));
      }
      this.emit("progress", { chunk: i, total: this.totalChunks });
    }
    this.emit("done", { url: this.url });
  }
}

// ---------------- Test cases ----------------
const uiLog = [];
const loggerLog = [];

const dl = new Downloader("https://example.com/file", 3);
dl.on("progress", (p) => uiLog.push(`${p.chunk}/${p.total}`));
dl.on("done", (info) => uiLog.push(`complete ${info.url}`));
dl.prependListener("progress", (p) =>
  loggerLog.push(`[start] chunk ${p.chunk}`),
);
// Wildcard: log every event type
const allEvents = [];
dl.on("*", (name) => allEvents.push(name));

dl.start().then(() => {
  console.log(uiLog);
  // Expected: [ '1/3', '2/3', '3/3', 'complete https://example.com/file' ]
  console.log(loggerLog);
  // Expected: [ '[start] chunk 1', '[start] chunk 2', '[start] chunk 3' ]
  console.log(allEvents);
  // Expected: [ 'progress', 'progress', 'progress', 'done' ]
});

// once listener fires a single time
let onceCount = 0;
const ee = new EventEmitter();
ee.once("ping", () => onceCount++);
ee.emit("ping");
ee.emit("ping");
console.log(onceCount);
// Expected: 1

// Unhandled 'error' throws (Node semantics)
try {
  new EventEmitter().emit("error", new Error("unhandled"));
} catch (e) {
  console.log("Uncaught error:", e.message);
  // Expected: Uncaught error: unhandled
}

// newListener hook fires when a listener is added
const hookLog = [];
const h = new EventEmitter().onNewListener((ev) => hookLog.push(ev));
h.on("a", () => {});
h.on("b", () => {});
console.log(hookLog);
// Expected: [ 'a', 'b' ]
