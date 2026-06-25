/**
 * @file functor.js
 * @description 手写函子（Functor）
 *
 * A Functor is a type that wraps a value and exposes a `map` method for
 * transforming the wrapped value with a pure function. The key property of a
 * functor is "structure preservation": mapping a function returns a new
 * functor of the same shape, never unwrapping the value.
 *
 * Laws every Functor must satisfy:
 *   1. Identity:       F.of(x).map(id) === F.of(x)
 *   2. Composition:    F.of(x).map(f).map(g) === F.of(x).map(x => g(f(x)))
 *
 * Approach: Implement an Identity functor as a simple wrapper class with a
 * static `of` constructor and an instance `map` method.
 */

class Functor {
  constructor(value) {
    this.value = value;
  }

  // Lift a plain value into the Functor context (pure / return).
  static of(value) {
    return new Functor(value);
  }

  // Apply a pure function to the wrapped value, returning a new Functor.
  map(fn) {
    return Functor.of(fn(this.value));
  }

  toString() {
    return `Functor(${JSON.stringify(this.value)})`;
  }
}

// ---------- Test cases ----------

const f = Functor.of(10);

console.log(f.map((x) => x + 1).toString()); // Functor(11)
console.log(f.map((x) => x * 2).toString()); // Functor(20)
console.log(f.map((x) => `value:${x}`).toString()); // Functor("value:10")

// Identity law: mapping identity leaves the value unchanged.
const id = (x) => x;
console.log(Functor.of(42).map(id).value === 42); // true

// Composition law: mapping f then g equals mapping the composition.
const composed = Functor.of(5)
  .map((x) => x + 1)
  .map((x) => x * 2);
const direct = Functor.of(5).map((x) => (x + 1) * 2);
console.log(composed.value === direct.value); // true

// Nesting functors works too.
const nested = Functor.of(Functor.of(3)).map((inner) =>
  inner.map((x) => x + 100),
);
console.log(nested.value.value); // 103
