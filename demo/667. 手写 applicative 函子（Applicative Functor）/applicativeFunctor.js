/**
 * @file applicativeFunctor.js
 * @description 手写 applicative 函子（Applicative Functor）
 *
 * An Applicative Functor sits between a Functor and a Monad. While a plain
 * Functor can map a *plain* function over a wrapped value, an Applicative can
 * apply a *wrapped* function to a wrapped value. This unlocks multi-argument
 * lifting: instead of currying and chaining `map`, you can apply N arguments
 * one by one via `ap`.
 *
 * Interface:
 *   - of(value)  : lift a value into the applicative context (pure)
 *   - map(fn)    : functor map (derivable from of + ap)
 *   - ap(A)      : this holds a function f, apply it to value held in A
 *
 * Laws:
 *   1. Identity:       A.of(id).ap(v) === v
 *   2. Homomorphism:   A.of(f).ap(A.of(x)) === A.of(f(x))
 *   3. Interchange:    u.ap(A.of(y)) === A.of(f => f(y)).ap(u)
 *   4. Composition:    A.of(compose).ap(u).ap(v).ap(w) === u.ap(v.ap(w))
 *
 * Approach: Implement as a wrapper class. `ap` takes a value-applicative and
 * returns a new applicative holding the result of applying the wrapped fn.
 */

class Applicative {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Applicative(value);
  }

  map(fn) {
    return Applicative.of(fn(this.value));
  }

  // `this` wraps a function; apply it to the value wrapped in `argApp`.
  ap(argApp) {
    return Applicative.of(this.value(argApp.value));
  }

  toString() {
    return `App(${JSON.stringify(this.value)})`;
  }
}

// ---------- Test cases ----------

// Lift a curried binary function and apply two wrapped arguments.
const add = (x) => (y) => x + y;
const lifted = Applicative.of(add).ap(Applicative.of(3)).ap(Applicative.of(4));
console.log(lifted.value); // 7

// Lifting a three-argument function.
const f3 = (a) => (b) => (c) => (a + b) * c;
const r3 = Applicative.of(f3)
  .ap(Applicative.of(2))
  .ap(Applicative.of(3))
  .ap(Applicative.of(4));
console.log(r3.value); // 20

// Identity law.
const id = (x) => x;
const v = Applicative.of("hello");
console.log(Applicative.of(id).ap(v).value === v.value); // true

// Homomorphism law.
const g = (x) => x + 1;
console.log(
  Applicative.of(g).ap(Applicative.of(9)).value === Applicative.of(g(9)).value,
); // true

// Interchange law.
const u = Applicative.of((x) => x * 10);
const y = 5;
console.log(
  u.ap(Applicative.of(y)).value === Applicative.of((fn) => fn(y)).ap(u).value,
); // true
