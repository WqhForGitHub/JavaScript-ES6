/**
 * _.memoize(func, [resolver])
 *
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first
 * argument provided to the memoized function is used as the cache key.
 *
 * Approach:
 * - Keep a `Map` as the cache, exposed on `memoized.cache` (like lodash).
 * - On each call, compute the key: `resolver ? resolver(...args) : args[0]`.
 * - Cache hit -> return cached value. Cache miss -> call `func` (preserving
 *   `this`), store and return the result.
 * - The cache is stored on the function so callers can inspect/clear it.
 */

function memoize(func, resolver) {
  function memoized(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    const cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  }
  memoized.cache = new Map();
  return memoized;
}

// --- Tests ---

// 1. Basic memoization: expensive call only happens once per key
let computeCalls = 0;
const square = memoize((n) => {
  computeCalls += 1;
  return n * n;
});
console.log(square(4)); // 16
console.log(square(4)); // 16 (cached)
console.log(square(5)); // 25
console.log(square(5)); // 25 (cached)
console.log("computeCalls:", computeCalls); // 2 (once for 4, once for 5)

// 2. Custom resolver for multi-argument functions
let addCalls = 0;
const add = memoize(
  (a, b) => {
    addCalls += 1;
    return a + b;
  },
  (a, b) => `${a}+${b}`, // resolver builds the cache key
);
console.log(add(1, 2)); // 3
console.log(add(1, 2)); // 3 (cached)
console.log(add(2, 1)); // 3 (different key -> recomputes)
console.log("addCalls:", addCalls); // 2

// 3. Inspecting / clearing the cache
const double = memoize((n) => n * 2);
double(10);
console.log("cache has 10:", double.cache.has(10)); // true
double.cache.clear();
console.log("cache size after clear:", double.cache.size); // 0

// 4. Object property access memoized by name
const data = { alice: 90, bob: 85, carol: 95 };
let accessCount = 0;
const getScore = memoize((name) => {
  accessCount += 1;
  return data[name];
});
console.log(getScore("alice")); // 90
console.log(getScore("alice")); // 90 (cached)
console.log(getScore("bob")); // 85
console.log("accessCount:", accessCount); // 2
