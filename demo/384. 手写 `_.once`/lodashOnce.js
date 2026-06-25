/**
 * _.once(func)
 *
 * Creates a function that is restricted to invoking `func` at most once.
 * Repeated calls to the returned function return the value from the first
 * invocation. The original function receives the arguments and `this`
 * context of the first call.
 *
 * Approach:
 * - Use a closure to hold two pieces of state: whether the function has
 *   been invoked yet, and the cached return value.
 * - On the first call, invoke `func` with `func.apply(this, args)` so that
 *   `this` binding and arguments are forwarded, then cache the result.
 * - Subsequent calls return the cached result without re-invoking `func`.
 */

function once(func) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  };
}

// --- Tests ---

// 1. Only the first call runs the body
let runCount = 0;
const initialize = once(() => {
  runCount += 1;
  return "initialized";
});
console.log(initialize()); // 'initialized'
console.log(initialize()); // 'initialized' (cached)
console.log(initialize()); // 'initialized' (cached)
console.log("runCount:", runCount); // 1 (body executed only once)

// 2. First arguments are forwarded
const firstArgs = once((...args) => args);
console.log(firstArgs(1, 2, 3)); // [1, 2, 3]
console.log(firstArgs(9, 9, 9)); // [1, 2, 3] (ignored, cached first call)

// 3. `this` context is preserved on first call
const obj = {
  value: 42,
  read() {
    return this.value;
  },
};
const onceRead = once(obj.read).bind(obj);
console.log(onceRead()); // 42
obj.value = 100;
console.log(onceRead()); // 42 (cached; body not re-run)

// 4. Works with async-ish side effects counter
let paymentAttempts = 0;
const pay = once(() => ++paymentAttempts);
pay();
pay();
pay();
console.log("paymentAttempts:", paymentAttempts); // 1
