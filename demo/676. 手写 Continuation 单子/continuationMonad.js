/**
 * @file continuationMonad.js
 * @description 手写 Continuation 单子
 *
 * The Continuation monad (CPS monad) models computations in continuation-
 * passing style. A continuation is a function `k => ...` that, when given a
 * "next step" callback `k`, runs and eventually calls `k` with its result.
 *
 * Interface:
 *   - Cont.of(value)        : immediately call the continuation with value
 *   - Cont(fn)              : wrap a `k -> ...` function
 *   - map(fn)               : transform the value before passing to k
 *   - chain(fn)             : sequence, threading the continuation
 *   - run(callback)         : kick off execution with the final continuation
 *
 * This monad is the basis for async/await, generators, and call/cc style
 * control flow. It is also stack-safe-ish because it converts deep recursion
 * into trampolined callbacks.
 */

class Cont {
  constructor(fn) {
    // fn : k -> ()  (calls k with the produced value)
    this.fn = fn;
  }

  static of(value) {
    return new Cont((k) => k(value));
  }

  map(fn) {
    return new Cont((k) => this.fn((a) => k(fn(a))));
  }

  chain(nextFn) {
    return new Cont((k) => this.fn((a) => nextFn(a).fn(k)));
  }

  // Applicative apply.
  ap(contArg) {
    return this.chain((f) => contArg.map(f));
  }

  run(callback = () => {}) {
    return this.fn(callback);
  }
}

// ---------- Test cases ----------

// Pure value flows to the final continuation.
Cont.of(42).run((v) => console.log("got:", v)); // got: 42

// Chaining two continuations.
const program = Cont.of(10)
  .map((x) => x + 5)
  .chain((x) => Cont.of(x * 2));

program.run((v) => console.log("result:", v)); // result: 30

// CPS-style "async" continuation: defer calling k with setTimeout.
const delay = (ms, value) => new Cont((k) => setTimeout(() => k(value), ms));

const asyncProgram = delay(0, "A")
  .chain((a) => delay(0, "B").map((b) => `${a}${b}`))
  .map((s) => s.toLowerCase());

// Node.js won't exit until the timer fires; logs "ab".
asyncProgram.run((v) => console.log("async:", v)); // async: ab

// Call/cc style: a continuation captured and re-invoked (loop emulation omitted
// here for stack safety, but demonstrate re-invocation).
const captured = Cont.of(1)
  .chain(
    (x) =>
      new Cont((k) => {
        // re-invoke the continuation with a different value
        k(x + 100);
      }),
  )
  .map((x) => x + 1);
captured.run((v) => console.log("reinvoked:", v)); // reinvoked: 102
