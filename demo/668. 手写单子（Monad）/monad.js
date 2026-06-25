/**
 * @file monad.js
 * @description 手写单子（Monad）
 *
 * A Monad is an abstraction describing "programmable semicolons": it lets you
 * chain computations that each produce a wrapped result, where the wrapper
 * encodes extra behaviour (context, effects, branching, etc.).
 *
 * Core interface (minimally):
 *   - of(value)        : lift a value into the monad (pure / return / unit)
 *   - chain(fn)        : bind (>>=). `fn` takes the unwrapped value and
 *                        returns a new monad of the same type. `chain`
 *                        flattens nested monads automatically.
 *   - map(fn)          : derivable from of + chain
 *   - join()           : flatten one layer of nesting (M(M(a)) -> M(a))
 *
 * Monad laws:
 *   1. Left identity:   M.of(a).chain(f) === f(a)
 *   2. Right identity:  m.chain(M.of) === m
 *   3. Associativity:   m.chain(f).chain(g) === m.chain(x => f(x).chain(g))
 *
 * Approach: Implement an Identity monad as a thin wrapper so we can observe
 * the chaining and flattening behaviour explicitly.
 */

class Identity {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Identity(value);
  }

  map(fn) {
    return this.chain((x) => Identity.of(fn(x)));
  }

  // Flatten one level: Identity(Identity(a)) -> Identity(a)
  static join(m) {
    return m.value;
  }

  join() {
    return this.value;
  }

  // Bind: apply f to the inner value; f returns a new Identity.
  chain(fn) {
    return fn(this.value);
  }

  // Alias commonly used in FP libraries.
  flatMap(fn) {
    return this.chain(fn);
  }

  toString() {
    return `Identity(${JSON.stringify(this.value)})`;
  }
}

// ---------- Test cases ----------

const m = Identity.of(5);
console.log(m.map((x) => x + 1).toString()); // Identity(6)
console.log(m.chain((x) => Identity.of(x * 2)).toString()); // Identity(10)

// chain with a function returning a nested monad -- it gets flattened.
const nested = m.chain((x) => Identity.of(Identity.of(x)));
console.log(Identity.join(nested).toString()); // Identity(5)

// Left identity: M.of(a).chain(f) === f(a)
const f = (x) => Identity.of(x + 100);
console.log(Identity.of(7).chain(f).value === f(7).value); // true

// Right identity: m.chain(M.of) === m
console.log(m.chain(Identity.of).value === m.value); // true

// Associativity:
const g = (x) => Identity.of(x * 3);
const left = m.chain(f).chain(g);
const right = m.chain((x) => f(x).chain(g));
console.log(left.value === right.value); // true
