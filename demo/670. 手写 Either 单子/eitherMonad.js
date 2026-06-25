/**
 * @file eitherMonad.js
 * @description 手写 Either 单子
 *
 * Either represents a value with two possibilities: a `Left` (usually an
 * error/failure) or a `Right` (a successful value). Unlike Maybe, Either
 * carries information about *why* something failed in the Left channel.
 *
 * Convention: chain/map only continue on `Right`; `Left` propagates untouched.
 *
 * Approach: Abstract `Either` base with `Left` and `Right` subclasses that
 * share an interface (`map`, `chain`, `ap`, `fold`, `isRight`, `getOrElse`).
 */

class Either {
  static of(value) {
    return new Right(value);
  }

  static left(value) {
    return new Left(value);
  }

  // Common API (defaults overridden by Right).
  map() {
    return this;
  }
  chain() {
    return this;
  }
  ap() {
    return this;
  }
  isRight() {
    return false;
  }
  isLeft() {
    return !this.isRight();
  }
  getOrElse(defaultValue) {
    return defaultValue;
  }
  fold(onLeft, onRight) {
    return onLeft(this.value);
  }
}

class Right extends Either {
  constructor(value) {
    super();
    this.value = value;
  }

  map(fn) {
    return new Right(fn(this.value));
  }

  chain(fn) {
    return fn(this.value);
  }

  ap(eitherArg) {
    return eitherArg.map(this.value);
  }

  isRight() {
    return true;
  }

  getOrElse() {
    return this.value;
  }

  fold(_onLeft, onRight) {
    return onRight(this.value);
  }

  toString() {
    return `Right(${JSON.stringify(this.value)})`;
  }
}

class Left extends Either {
  constructor(value) {
    super();
    this.value = value;
  }

  toString() {
    return `Left(${JSON.stringify(this.value)})`;
  }
}

// ---------- Test cases ----------

const parseNum = (str) => {
  const n = Number(str);
  return Number.isNaN(n) ? Either.left(`Not a number: ${str}`) : Either.of(n);
};

console.log(parseNum("42").toString()); // Right(42)
console.log(parseNum("abc").toString()); // Left("Not a number: abc")

// Chain: short-circuits through Left, preserving the error.
const pipeline = parseNum("10")
  .map((x) => x + 5)
  .chain((x) => (x > 100 ? Either.left("too big") : Either.of(x * 2)));
console.log(pipeline.toString()); // Right(30)

const pipelineErr = parseNum("xyz")
  .map((x) => x + 5)
  .chain((x) => Either.of(x * 2));
console.log(pipelineErr.toString()); // Left("Not a number: xyz")

// fold: collapse to a plain value, handling both branches.
const message = parseNum("hello").fold(
  (err) => `Failure: ${err}`,
  (val) => `Success: ${val}`,
);
console.log(message); // Failure: Not a number: hello

// Applicative: collect multiple errors via ap is possible; here simple apply.
const add = (x) => (y) => x + y;
const applied = Either.of(add).ap(parseNum("3")).ap(parseNum("4"));
console.log(applied.toString()); // Right(7)
