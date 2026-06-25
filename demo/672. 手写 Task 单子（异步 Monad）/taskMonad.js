/**
 * @file taskMonad.js
 * @description 手写 Task 单子（异步 Monad）
 *
 * Task is a lazy, cancellable abstraction over asynchronous computations --
 * think of it as a Promise you can map and chain over without immediately
 * executing it. Unlike a Promise, a Task doesn't start until `run` is called,
 * and it never swallow exceptions into an unhandled-rejection black hole.
 *
 * Interface (simplified):
 *   - Task.of(value)            : lift a pure value
 *   - Task.fromPromise(p)       : wrap a promise-producing function
 *   - Task((rej, res) => ...)   : constructor with rejection/resolution cps
 *   - map(fn)                   : transform the success value
 *   - chain(fn)                 : sequence another Task-returning computation
 *   - run(onRejected, onResolved): actually execute
 *
 * Laws: monad laws on the success channel; rejections short-circuit like Left.
 */

class Task {
  // `computation` receives (reject, resolve) like a Promise executor.
  constructor(computation) {
    this.computation = computation;
  }

  static of(value) {
    return new Task((_, resolve) => resolve(value));
  }

  static rejected(err) {
    return new Task((reject) => reject(err));
  }

  static fromPromise(promiseFactory) {
    return new Task((reject, resolve) => {
      promiseFactory().then(resolve, reject);
    });
  }

  map(fn) {
    return new Task((reject, resolve) =>
      this.computation(reject, (value) => resolve(fn(value))),
    );
  }

  // Map over the rejection channel (recover).
  mapRejected(fn) {
    return new Task((reject, resolve) =>
      this.computation((err) => reject(fn(err)), resolve),
    );
  }

  chain(fn) {
    return new Task((reject, resolve) =>
      this.computation(reject, (value) => fn(value).run(reject, resolve)),
    );
  }

  run(onRejected = () => {}, onResolved = () => {}) {
    return this.computation(onRejected, onResolved);
  }

  // Promise interop for convenience.
  toPromise() {
    return new Promise((resolve, reject) => this.run(reject, resolve));
  }
}

// ---------- Test cases (run with node) ----------

const fetchNum = () => Task.of(21);

const program = fetchNum()
  .map((x) => x * 2)
  .chain((x) => (x > 10 ? Task.of(x + 1) : Task.rejected("too small")));

program.run(
  (err) => console.log("rejected:", err),
  (val) => console.log("resolved:", val), // resolved: 43
);

// Rejection short-circuits chain.
const failing = Task.rejected("boom")
  .map((x) => x + 1)
  .chain((x) => Task.of(x));

failing.run(
  (err) => console.log("caught:", err), // caught: boom
  (val) => console.log("should not run:", val),
);

// Async via fromPromise.
Task.fromPromise(() => Promise.resolve(7))
  .map((x) => x + 3)
  .toPromise()
  .then((v) => console.log("promise result:", v)); // promise result: 10

// Recover with mapRejected.
Task.rejected("err")
  .mapRejected((e) => `recovered:${e}`)
  .run(
    (err) => console.log("recovered channel:", err), // recovered channel: recovered:err
    (val) => console.log(val),
  );
