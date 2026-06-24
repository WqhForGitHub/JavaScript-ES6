/**
 * 链式调用模式 (Chain / Fluent Interface Pattern)
 *
 * Approach:
 * - Methods return `this` (or a new instance) so calls can be chained together in
 *   a single expression, producing a readable, declarative API (fluent interface).
 * - Demonstrated in several idioms:
 *   1. Mutable builder: methods mutate state and return `this`.
 *   2. Immutable pipeline: each method returns a NEW instance, leaving the previous
 *      unchanged (like an immutable List / Lodash chain).
 *   3. Promise-like async chain with then() composition.
 */

// ---- 1. Mutable fluent builder ----
class QueryBuilder {
  constructor() {
    this._select = '*';
    this._from = '';
    this._wheres = [];
    this._limit = null;
  }
  select(cols) {
    this._select = cols;
    return this;
  }
  from(table) {
    this._from = table;
    return this;
  }
  where(condition) {
    this._wheres.push(condition);
    return this;
  }
  limit(n) {
    this._limit = n;
    return this;
  }
  build() {
    const parts = [`SELECT ${this._select} FROM ${this._from}`];
    if (this._wheres.length) parts.push('WHERE ' + this._wheres.join(' AND '));
    if (this._limit != null) parts.push(`LIMIT ${this._limit}`);
    return parts.join(' ');
  }
}

// ---- 2. Immutable fluent collection (returns new instance each step) ----
class FluentList {
  constructor(items = []) {
    this.items = items;
  }
  map(fn) {
    return new FluentList(this.items.map(fn));
  }
  filter(predicate) {
    return new FluentList(this.items.filter(predicate));
  }
  sort(compare) {
    return new FluentList([...this.items].sort(compare));
  }
  take(n) {
    return new FluentList(this.items.slice(0, n));
  }
  forEach(fn) {
    this.items.forEach(fn);
    return this;
  }
  value() {
    return [...this.items];
  }
  get length() {
    return this.items.length;
  }
}

// ---- 3. Promise-like async chain ----
class SimplePromise {
  constructor(executor) {
    this._callbacks = [];
    const resolve = (value) => {
      // ensure async
      queueMicrotask(() => this._run(value));
    };
    if (executor) executor(resolve);
  }
  then(fn) {
    const next = new SimplePromise();
    this._callbacks.push({ fn, next });
    return next;
  }
  _run(value) {
    const cb = this._callbacks.shift();
    if (!cb) return;
    try {
      const result = cb.fn(value);
      if (result instanceof SimplePromise) {
        result.then((v) => next_run());
        // bridge: when inner promise resolves, forward to next
        result._callbacks.push({ fn: (v) => v, next: cb.next });
      } else {
        cb.next._run(result);
      }
    } catch (err) {
      // simple impl: swallow for brevity
    }
  }
}

// Simpler hand-rolled async chain (easier to reason about than the above).
function runAsyncChain() {
  class Thenable {
    constructor(value) {
      this.value = value;
    }
    then(fn) {
      const out = new Thenable();
      queueMicrotask(() => {
        out.value = fn(this.value);
      });
      return out;
    }
  }
  return new Thenable(1)
    .then((x) => x + 1)
    .then((x) => x * 10);
}

// ---------------- Test cases ----------------
// 1. SQL builder chain
const sql = new QueryBuilder()
  .select('id, name')
  .from('users')
  .where('age > 18')
  .where('active = 1')
  .limit(10)
  .build();
console.log(sql);
// Expected: SELECT id, name FROM users WHERE age > 18 AND active = 1 LIMIT 10

// 2. Immutable pipeline (original not mutated)
const nums = new FluentList([5, 3, 8, 1, 9, 2]);
const top3 = nums
  .filter((n) => n > 2)
  .sort((a, b) => b - a)
  .take(3)
  .value();
console.log(top3, nums.value());
// Expected: [ 9, 8, 5 ] [ 5, 3, 8, 1, 9, 2 ]

// 3. Async chain resolves to expected value
setTimeout(() => {
  const chain = runAsyncChain();
  setTimeout(() => console.log(chain.value), 0);
  // Expected: 20  (1 -> 2 -> 20)
}, 0);
