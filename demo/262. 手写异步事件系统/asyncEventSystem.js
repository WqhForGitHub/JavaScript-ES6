/**
 * 异步事件系统 (Async Event System)
 *
 * Approach:
 * - Listeners may be sync or async (return Promises).
 * - emit() returns a Promise that resolves with an array of results.
 * - emitSeries() runs listeners sequentially: each waits for the previous to finish.
 * - emitParallel() runs all listeners concurrently and awaits them all (Promise.all).
 * - Supports on / off / once / waitOn (returns a Promise resolved the first time the
 *   event fires, handy for awaiting async triggers).
 */

class AsyncEventSystem {
  constructor() {
    this._events = new Map();
  }

  on(event, fn) {
    if (!this._events.has(event)) this._events.set(event, []);
    this._events.get(event).push(fn);
    return this;
  }

  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      return fn(...args);
    };
    wrapper._original = fn;
    return this.on(event, wrapper);
  }

  off(event, fn) {
    const list = this._events.get(event);
    if (!list) return this;
    if (!fn) {
      this._events.delete(event);
      return this;
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === fn || list[i]._original === fn) list.splice(i, 1);
    }
    return this;
  }

  listeners(event) {
    return this._events.get(event) ? [...this._events.get(event)] : [];
  }

  // Run sequentially, awaiting each listener.
  async emitSeries(event, ...args) {
    const list = this.listeners(event);
    const results = [];
    for (const fn of list) {
      results.push(await fn(...args));
    }
    return results;
  }

  // Run all concurrently.
  async emitParallel(event, ...args) {
    const list = this.listeners(event);
    return Promise.all(list.map((fn) => Promise.resolve(fn(...args))));
  }

  // Alias: parallel by default.
  emit(event, ...args) {
    return this.emitParallel(event, ...args);
  }

  // Returns a promise that resolves the first time `event` fires.
  waitOn(event) {
    return new Promise((resolve) => {
      const handler = (...args) => {
        this.off(event, handler);
        resolve(args);
      };
      this.on(event, handler);
    });
  }
}

// ---------------- Test cases ----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const bus = new AsyncEventSystem();

  bus.on("data", async (x) => {
    await sleep(20);
    return x * 2;
  });
  bus.on("data", async (x) => {
    await sleep(10);
    return x + 1;
  });

  const parallel = await bus.emitParallel("data", 5);
  console.log(parallel);
  // Expected: [ 10, 6 ]

  const series = await bus.emitSeries("data", 5);
  console.log(series);
  // Expected: [ 10, 6 ]

  // waitOn resolves with the args of the first emit
  bus.waitOn("ready").then((args) => console.log("waitOn got:", args));
  // Expected: waitOn got: [ 'go' ]
  setTimeout(() => bus.emit("ready", "go"), 30);

  // once fires only one time
  const onceResults = [];
  bus.once("ping", async () => onceResults.push("pong"));
  await bus.emit("ping");
  await bus.emit("ping");
  console.log(onceResults);
  // Expected: [ 'pong' ]
})();
