/**
 * 单例模式 (Singleton Pattern)
 *
 * Approach:
 * - Ensure a class has exactly one instance and provide a global access point.
 * - Demonstrated in several idiomatic ways:
 *   1. Static getInstance() with a private static holder (closure/weakmap style).
 *   2. Module-level singleton via a frozen object export.
 *   3. Proxy-based singleton that intercepts `new` and returns the cached instance.
 * - Thread-safety is not a concern in JS (single-threaded), but we guard against
 *   re-entrancy / double-construction.
 */

// ----- 1. Classic getInstance singleton -----
class Singleton {
  constructor(value) {
    if (Singleton._instance) {
      return Singleton._instance;
    }
    this.value = value;
    this.createdAt = Date.now();
    Singleton._instance = this;
    Object.freeze(this);
  }

  static getInstance(value) {
    if (!Singleton._instance) Singleton._instance = new Singleton(value);
    return Singleton._instance;
  }

  static reset() {
    // Only for test isolation.
    Singleton._instance = null;
  }
}
Singleton._instance = null;

// ----- 2. Generic singleton factory (works for any constructor) -----
function singletonify(Constructor) {
  let instance = null;
  const ProxyCtor = new Proxy(Constructor, {
    construct(target, args, newTarget) {
      if (!instance) instance = new target(...args);
      return instance;
    },
  });
  // Make instanceof keep working.
  ProxyCtor.prototype = Constructor.prototype;
  return ProxyCtor;
}

// ----- 3. Module-level singleton -----
const Config = (() => {
  const state = { env: 'dev', version: '1.0.0' };
  return Object.freeze({
    get: (k) => state[k],
    set: (k, v) => {
      if (Object.prototype.hasOwnProperty.call(state, k)) state[k] = v;
    },
    snapshot: () => ({ ...state }),
  });
})();

// ---------------- Test cases ----------------
// getInstance returns the same object
Singleton.reset();
const a = Singleton.getInstance('first');
const b = Singleton.getInstance('second'); // ignored
console.log(a === b, a.value);
// Expected: true 'first'

// Proxy-based generic singleton
class Db {
  constructor(name) {
    this.name = name;
  }
}
const SingleDb = singletonify(Db);
const db1 = new SingleDb('prod');
const db2 = new SingleDb('dev');
console.log(db1 === db2, db1.name, db1 instanceof Db);
// Expected: true 'prod' true

// Module-level singleton is shared & frozen. `env` is internal state accessed via
// get()/set(); the returned object is frozen so new top-level keys can't be added.
Config.set('env', 'prod');
console.log(Config.snapshot(), Config.get('env'));
// Expected: { env: 'prod', version: '1.0.0' } 'prod'
try {
  // Direct property assignment on a frozen object is rejected (throws in strict
  // mode, silently ignored otherwise). It never mutates internal state.
  Config.env = 'x';
} catch (e) {
  // strict mode throws TypeError
}
console.log(Config.get('env'));
// Expected: 'prod'
