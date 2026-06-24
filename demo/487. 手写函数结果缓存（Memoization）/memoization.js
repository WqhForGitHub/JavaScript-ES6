/**
 * 手写函数结果缓存（Memoization）
 * Memoize a pure function by its arguments.
 *
 * Approach:
 * - Default cache key: serialize args via JSON.stringify.
 * - Custom `resolver` may be provided to compute the key (faster for primitives).
 * - Cache stored in a Map; supports `.clear()` and `.has()`.
 * - Also includes a single-arg fast variant `memoizeSingle` using the arg itself as key.
 *
 * @param {Function} fn - Pure function to memoize.
 * @param {Function} [resolver] - Optional key resolver.
 * @returns {Function} Memoized function.
 */
function memoize(fn, resolver) {
  const cache = new Map();
  const memoized = function (...args) {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}

// Single-arg fast version (uses the arg directly as Map key; supports objects by reference).
function memoizeSingle(fn) {
  const cache = new Map();
  const memoized = function (arg) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn.call(this, arg);
    cache.set(arg, result);
    return result;
  };
  memoized.cache = cache;
  return memoized;
}

// ---------- Test cases ----------
let calls = 0;
const slowAdd = memoize((a, b) => {
  calls++;
  return a + b;
});

console.log(slowAdd(1, 2)); // expected: 3
console.log(slowAdd(1, 2)); // expected: 3 (from cache)
console.log('call count:', calls); // expected: 1

console.log(slowAdd(3, 4)); // expected: 7
console.log('call count after new args:', calls); // expected: 2

// Custom resolver
let objCalls = 0;
const getByObj = memoize(
  (obj) => {
    objCalls++;
    return obj.a + obj.b;
  },
  (obj) => `${obj.a},${obj.b}`
);

console.log(getByObj({ a: 1, b: 2 })); // expected: 3
console.log(getByObj({ a: 1, b: 2 })); // expected: 3 (cache hit via resolver key)
console.log('obj call count:', objCalls); // expected: 1

// Fibonacci with memoization
const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
console.log('fib(40):', fib(40)); // expected: 102334155 (computed quickly)
console.log('fib(40) again from cache:', fib(40)); // expected: 102334155
