/**
 * Promise 链模式 (Promise Chain Pattern)
 *
 * Approach:
 * - Implement a minimal Promise/A+ from scratch to demonstrate how chaining,
 *   then-resolution, and async propagation work under the hood.
 * - Each instance has a state (PENDING/FULFILLED/REJECTED), a value/reason, and
 *   queues of then-callbacks. Resolution uses microtasks (queueMicrotask).
 * - The resolution procedure adopt(promise, x) handles: same-promise rejection,
 *   thenables (objects/functions with a `then`), and plain values. This is what
 *   makes then() chains flatten nested promises and forward rejections.
 * - We add static resolve/reject/all/race and a deferred helper.
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this._state = PENDING;
    this._value = undefined;
    this._onFulfilled = [];
    this._onRejected = [];

    const resolve = (value) => this._resolve(value);
    const reject = (reason) => this._reject(reason);
    try {
      executor(resolve, reject);
    } catch (err) {
      this._reject(err);
    }
  }

  _resolve(value) {
    if (this._state !== PENDING) return;
    // The Promise Resolution Procedure
    if (value === this) {
      return this._reject(new TypeError("Chaining cycle detected"));
    }
    if (value instanceof MyPromise) {
      value.then(
        (v) => this._resolve(v),
        (r) => this._reject(r),
      );
      return;
    }
    if (
      value !== null &&
      (typeof value === "object" || typeof value === "function")
    ) {
      let then;
      try {
        then = value.then;
      } catch (err) {
        return this._reject(err);
      }
      if (typeof then === "function") {
        let called = false;
        try {
          then.call(
            value,
            (v) => {
              if (called) return;
              called = true;
              this._resolve(v);
            },
            (r) => {
              if (called) return;
              called = true;
              this._reject(r);
            },
          );
        } catch (err) {
          if (called) return;
          this._reject(err);
        }
        return;
      }
    }
    this._state = FULFILLED;
    this._value = value;
    this._flush();
  }

  _reject(reason) {
    if (this._state !== PENDING) return;
    this._state = REJECTED;
    this._value = reason;
    this._flush();
  }

  _flush() {
    const run = (cb, val) => {
      queueMicrotask(() => cb(val));
    };
    if (this._state === FULFILLED) {
      this._onFulfilled.forEach((cb) => run(cb, this._value));
    } else if (this._state === REJECTED) {
      this._onRejected.forEach((cb) => run(cb, this._value));
    }
  }

  then(onFulfilled, onRejected) {
    const onF = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    const onR =
      typeof onRejected === "function"
        ? onRejected
        : (r) => {
            throw r;
          };
    const promise = new MyPromise(() => {});
    const handle = (handler, value, downstream) => {
      queueMicrotask(() => {
        try {
          const x = handler(value);
          downstream._resolve(x);
        } catch (err) {
          downstream._reject(err);
        }
      });
    };
    if (this._state === PENDING) {
      this._onFulfilled.push((v) => handle(onF, v, promise));
      this._onRejected.push((r) => handle(onR, r, promise));
    } else if (this._state === FULFILLED) {
      handle(onF, this._value, promise);
    } else {
      handle(onR, this._value, promise);
    }
    return promise;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (v) =>
        MyPromise.resolve(
          typeof onFinally === "function" ? onFinally() : undefined,
        ).then(() => v),
      (r) =>
        MyPromise.resolve(
          typeof onFinally === "function" ? onFinally() : undefined,
        ).then(() => {
          throw r;
        }),
    );
  }

  static resolve(v) {
    if (v instanceof MyPromise) return v;
    return new MyPromise((resolve) => resolve(v));
  }
  static reject(r) {
    return new MyPromise((_, reject) => reject(r));
  }
  static all(iterable) {
    return new MyPromise((resolve, reject) => {
      const arr = [...iterable];
      const out = new Array(arr.length);
      let remaining = arr.length;
      if (remaining === 0) return resolve([]);
      arr.forEach((p, i) => {
        MyPromise.resolve(p).then((v) => {
          out[i] = v;
          if (--remaining === 0) resolve(out);
        }, reject);
      });
    });
  }
  static race(iterable) {
    return new MyPromise((resolve, reject) => {
      for (const p of iterable) {
        MyPromise.resolve(p).then(resolve, reject);
      }
    });
  }
}

// ---------------- Test cases ----------------
// Basic chaining: each then transforms the value
MyPromise.resolve(1)
  .then((x) => x + 1)
  .then((x) => x * 10)
  .then((x) => console.log(x));
// Expected: 20

// Chaining that returns a thenable -> flattened
MyPromise.resolve(5)
  .then((x) => new MyPromise((r) => r(x * 2)))
  .then((x) => console.log(x));
// Expected: 10

// Rejection propagation + catch
MyPromise.reject(new Error("boom"))
  .then(() => "unreached")
  .catch((e) => `recovered: ${e.message}`)
  .then((s) => console.log(s));
// Expected: recovered: boom

// all resolves with ordered results
MyPromise.all([
  MyPromise.resolve("a"),
  MyPromise.resolve("b"),
  MyPromise.resolve("c"),
]).then((arr) => console.log(arr));
// Expected: [ 'a', 'b', 'c' ]

// all rejects on first rejection
MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.reject(new Error("fail")),
]).catch((e) => console.log("all error:", e.message));
// Expected: all error: fail

// race resolves with the fastest
const slow = new MyPromise((r) => setTimeout(() => r("slow"), 30));
const fast = new MyPromise((r) => setTimeout(() => r("fast"), 5));
MyPromise.race([slow, fast]).then((v) => console.log("race:", v));
// Expected: race: fast

// Async executor with setTimeout
new MyPromise((resolve) => setTimeout(() => resolve("delayed"), 10)).then((v) =>
  console.log(v),
);
// Expected: delayed
