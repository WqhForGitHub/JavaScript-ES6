/**
 * @file trampoline.js
 * @description 手写 Trampoline（蹦床函数，避免栈溢出）
 *
 * A trampoline is a control-flow trick that turns a deeply-recursive (and
 * hence stack-overflow-prone) function into an iterative loop. Instead of a
 * recursive call returning a value, the function returns a *thunk* (a closure
 * `() => ...`) describing the next step; a driver loop (`trampoline`) keeps
 * invoking thunks until a non-thunk value is produced.
 *
 * Two flavors implemented:
 *   1. `Thunk` / `trampoline` for tail-recursive CPS-style recursion.
 *   2. A small `Trampoline` monad with `done`/`more`/`run` for clarity.
 *
 * Approach: every recursive call returns a thunk; the trampoline driver
 * unwraps thunks in a `while` loop, so the call stack never grows.
 */

class Thunk {
  constructor(fn) {
    this.fn = fn;
  }
}

const thunk = (fn) => new Thunk(fn);
const isThunk = (v) => v instanceof Thunk;

/**
 * Repeatedly evaluate thunks until a plain value is produced.
 * @param {Thunk|*} value a value or a Thunk describing the next step.
 * @returns {*} the final, non-thunk value.
 */
function trampoline(value) {
  let result = typeof value === "function" ? value() : value;
  while (isThunk(result)) {
    result = result.fn();
  }
  return result;
}

// A tail-recursive factorial that returns thunks instead of recursing.
const factorialTail = (n, acc = 1) => {
  if (n <= 1) return acc;
  // Return a THUNK describing the next step, not the result of the call.
  return thunk(() => factorialTail(n - 1, acc * n));
};

// A small Trampoline monad variant (done / more).
class Trampoline {
  static done(value) {
    return { __trampoline: true, done: true, value };
  }
  static more(fn) {
    return { __trampoline: true, done: false, fn };
  }
  static run(t) {
    let current = t;
    while (!current.done) {
      current = current.fn();
    }
    return current.value;
  }
}

const sumTo = (n, acc = 0) => {
  if (n === 0) return Trampoline.done(acc);
  return Trampoline.more(() => sumTo(n - 1, acc + n));
};

// ---------- Test cases ----------

// Large n would blow the stack with plain recursion; trampoline handles it.
console.log(trampoline(factorialTail(5))); // 120
console.log(trampoline(factorialTail(20000))); // Infinity (overflow of Number, not stack)
console.log(trampoline(factorialTail(20))); // 2432902008176640000

// Mutual-style sum via the Trampoline monad.
console.log(Trampoline.run(sumTo(1000000))); // 500000500000 (no stack overflow)

const even = (n) => {
  if (n === 0) return Trampoline.done(true);
  return Trampoline.more(() => odd(n - 1));
};
const odd = (n) => {
  if (n === 0) return Trampoline.done(false);
  return Trampoline.more(() => even(n - 1));
};
console.log(Trampoline.run(even(100000))); // true
console.log(Trampoline.run(odd(100001))); // true

// Sanity: factorial of small n.
console.log(trampoline(factorialTail(1))); // 1
console.log(trampoline(factorialTail(0))); // 1
