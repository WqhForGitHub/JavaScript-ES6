/**
 * @file maybeMonad.js
 * @description 手写 Maybe 单子
 *
 * Maybe is the canonical "null-safe" monad. A Maybe value is either:
 *   - Just(a) : a present value of type a
 *   - Nothing : the absence of a value
 *
 * Mapping or chaining over `Nothing` short-circuits, so chains of operations
 * that might fail simply yield `Nothing` instead of throwing or returning null.
 *
 * Approach: Two concrete subclasses `Just` and `Nothing` sharing an abstract
 * base `Maybe`. Both implement `map`, `chain`, `ap`, `getOrElse`, and `isJust`.
 */

class Maybe {
  static of(value) {
    return value == null ? new Nothing() : new Just(value);
  }

  static fromNullable(value) {
    return Maybe.of(value);
  }

  // Default: override in subclasses.
  map() {
    return new Nothing();
  }
  chain() {
    return new Nothing();
  }
  ap() {
    return new Nothing();
  }
  getOrElse(defaultValue) {
    return defaultValue;
  }
  isJust() {
    return false;
  }
  isNothing() {
    return !this.isJust();
  }
}

class Just extends Maybe {
  constructor(value) {
    super();
    this.value = value;
  }

  map(fn) {
    return Maybe.of(fn(this.value));
  }

  chain(fn) {
    return fn(this.value);
  }

  ap(maybeArg) {
    return maybeArg.map(this.value); // this.value is a function
  }

  getOrElse() {
    return this.value;
  }

  isJust() {
    return true;
  }

  toString() {
    return `Just(${JSON.stringify(this.value)})`;
  }
}

class Nothing extends Maybe {
  toString() {
    return "Nothing";
  }
}

// ---------- Test cases ----------

const safeDiv = (a, b) => (b === 0 ? new Nothing() : new Just(a / b));

console.log(safeDiv(10, 2).toString()); // Just(5)
console.log(safeDiv(10, 0).toString()); // Nothing

// Chaining: short-circuits on first Nothing.
const result = Maybe.of(20)
  .map((x) => x + 1)
  .chain((x) => safeDiv(x, 0))
  .map((x) => x * 100);
console.log(result.toString()); // Nothing

const result2 = Maybe.of(20)
  .map((x) => x + 1)
  .chain((x) => safeDiv(x, 3))
  .map((x) => x * 100);
console.log(result2.toString()); // Just(700)

// fromNullable on null/undefined -> Nothing
console.log(Maybe.fromNullable(null).getOrElse("fallback")); // fallback
console.log(Maybe.fromNullable("hi").getOrElse("fallback")); // hi

// Applicative: apply a wrapped function.
const add = (x) => (y) => x + y;
const lifted = Maybe.of(add).ap(Maybe.of(3)).ap(Maybe.of(4));
console.log(lifted.toString()); // Just(7)

const liftedNothing = Maybe.of(add).ap(Maybe.of(null)).ap(Maybe.of(4));
console.log(liftedNothing.toString()); // Nothing
