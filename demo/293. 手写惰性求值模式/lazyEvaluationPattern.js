/**
 * 惰性求值模式 (Lazy Evaluation Pattern)
 *
 * Approach:
 * - Defer computation until its result is actually needed, and memoize the result
 *   so the computation runs at most once. Benefits: avoid wasted work, support
 *   infinite structures, short-circuit pipelines.
 * - Demonstrated several ways:
 *   1. Lazy<T> thunk: factory + cached result. force() triggers evaluation once.
 *   2. ES Proxy lazy property: a property is computed on first access, then cached.
 *   3. Lazy sequence (like LINQ/Ix): map/filter operations build a deferred
 *      pipeline; iteration (or take(n)) pulls values one at a time, stopping early.
 *   4. Lazy conditional: &&  / || style short-circuit helpers.
 */

// ---- 1. Lazy thunk with memoization ----
class Lazy {
  constructor(factory) {
    this._factory = factory;
    this._computed = false;
    this._value = undefined;
  }
  force() {
    if (!this._computed) {
      this._value = this._factory();
      this._computed = true;
      this._factory = null; // release closure
    }
    return this._value;
  }
  get isForced() {
    return this._computed;
  }
  map(fn) {
    return new Lazy(() => fn(this.force()));
  }
}

// ---- 2. Lazy sequence (deferred map/filter, pull-based) ----
class LazySequence {
  constructor(sourceFactory) {
    this._sourceFactory = sourceFactory; // () => iterator
  }
  [Symbol.iterator]() {
    return this._sourceFactory()[Symbol.iterator]();
  }
  map(fn) {
    const self = this;
    return new LazySequence(function* () {
      for (const v of self) yield fn(v);
    });
  }
  filter(pred) {
    const self = this;
    return new LazySequence(function* () {
      for (const v of self) if (pred(v)) yield v;
    });
  }
  take(n) {
    const self = this;
    return new LazySequence(function* () {
      let i = 0;
      for (const v of self) {
        if (i++ >= n) break;
        yield v;
      }
    });
  }
  toArray() {
    return [...this];
  }
  forEach(fn) {
    for (const v of this) fn(v);
  }
}

// Infinite source via generator.
LazySequence.iterate = function (init, next) {
  return new LazySequence(function* () {
    let v = init;
    while (true) {
      yield v;
      v = next(v);
    }
  });
};
LazySequence.range = function (from, to) {
  return new LazySequence(function* () {
    for (let i = from; i < to; i++) yield i;
  });
};

// ---- 3. Lazy proxy property ----
function lazyProps(target, defs) {
  const cache = {};
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in defs) {
        if (!(prop in cache)) cache[prop] = defs[prop].call(obj);
        return cache[prop];
      }
      return obj[prop];
    },
  });
}

// ---------------- Test cases ----------------
// 1. Lazy thunk runs at most once
let evalCount = 0;
const lazyVal = new Lazy(() => {
  evalCount++;
  return 42;
});
console.log(evalCount);
// Expected: 0  (not evaluated yet)
console.log(lazyVal.force(), lazyVal.force());
// Expected: 42 42
console.log(evalCount);
// Expected: 1  (computed only once)
console.log(lazyVal.map((x) => x + 1).force());
// Expected: 43

// 2. Lazy sequence: only pulls what's consumed. Infinite source + take(5).
const first5SquaresOfEvens = LazySequence.iterate(1, (n) => n + 1)
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .take(5)
  .toArray();
console.log(first5SquaresOfEvens);
// Expected: [ 4, 16, 36, 64, 100 ]

// Short-circuit: take(3) on an infinite range stops early.
let pulled = 0;
const seq = LazySequence.iterate(0, (n) => n + 1)
  .map((n) => {
    pulled++;
    return n;
  })
  .take(3);
console.log(seq.toArray(), pulled);
// Expected: [ 0, 1, 2 ] 3  (only 3 values pulled, not infinite)

// 3. Lazy proxy properties computed on first access
const calls = { x: 0, y: 0 };
const obj = lazyProps({}, {
  x: () => {
    calls.x++;
    return 10;
  },
  y: () => {
    calls.y++;
    return 20;
  },
});
console.log(calls);
// Expected: { x: 0, y: 0 }
obj.x;
obj.x;
console.log(obj.x + obj.y, calls);
// Expected: 30 { x: 1, y: 1 }  (each computed once)
