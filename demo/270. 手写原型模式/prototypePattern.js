/**
 * 原型模式 (Prototype Pattern)
 *
 * Approach:
 * - Create new objects by cloning an existing "prototype" instance instead of
 *   constructing from scratch via a class/factory.
 * - We provide a clone() mechanism that performs a deep-ish copy (own enumerable
 *   properties, recursively cloning nested prototype objects) so the clone is
 *   independent of the original.
 * - Demonstrated two ways:
 *   1. Object.create() sharing the prototype chain (shallow shared state).
 *   2. An explicit clone() method on a prototype that produces independent copies
 *      (the canonical "Prototype" pattern from GoF).
 */

// Generic deep-clone helper that respects nested clone() methods when present.
function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof obj.clone === 'function') return obj.clone();
  if (seen.has(obj)) return seen.get(obj);

  let copy;
  if (Array.isArray(obj)) {
    copy = [];
    seen.set(obj, copy);
    for (const v of obj) copy.push(deepClone(v, seen));
    return copy;
  }
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    copy = new Map();
    seen.set(obj, copy);
    for (const [k, v] of obj) copy.set(deepClone(k, seen), deepClone(v, seen));
    return copy;
  }
  if (obj instanceof Set) {
    copy = new Set();
    seen.set(obj, copy);
    for (const v of obj) copy.add(deepClone(v, seen));
    return copy;
  }

  copy = Object.create(Object.getPrototypeOf(obj));
  seen.set(obj, copy);
  for (const key of Reflect.ownKeys(obj)) {
    copy[key] = deepClone(obj[key], seen);
  }
  return copy;
}

// A concrete prototype: a Shape with position and metadata.
const ShapePrototype = {
  init(type, x, y, tags = []) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.tags = tags;
    return this;
  },
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  },
  clone() {
    // Deep clone so nested arrays/objects are independent.
    const copy = Object.create(Object.getPrototypeOf(this));
    copy.init(this.type, this.x, this.y, deepClone(this.tags));
    return copy;
  },
  describe() {
    return `${this.type} @ (${this.x},${this.y}) tags=[${this.tags.join(',')}]`;
  },
};

// ---------------- Test cases ----------------
const original = Object.create(ShapePrototype).init('Circle', 10, 20, ['red', 'big']);
const copy = original.clone();

// Mutating the clone must not affect the original (independent nested arrays).
copy.tags.push('cloned');
copy.move(5, 5);

console.log(original.describe());
// Expected: Circle @ (10,20) tags=[red,big]
console.log(copy.describe());
// Expected: Circle @ (15,25) tags=[red,big,cloned]
console.log(original !== copy, original.tags !== copy.tags);
// Expected: true true

// Deep-clone preserves own properties AND the prototype chain. We use a plain
// prototype object (with no inherited clone() method) so deepClone performs a
// structural copy instead of delegating to a prototype's clone().
const proto = { inherited: 'yes' };
const child = Object.create(proto);
child.own = 42;
const childClone = deepClone(child);
console.log(childClone.own, childClone.inherited, Object.getPrototypeOf(childClone) === proto);
// Expected: 42 'yes' true

// Deep-clone arrays/maps/dates round-trip
const complex = {
  list: [1, { nested: 2 }],
  date: new Date(0),
  map: new Map([['k', { v: 7 }]]),
};
const complexClone = deepClone(complex);
complexClone.list[1].nested = 999;
complexClone.map.get('k').v = 999;
console.log(complex.list[1].nested, complex.map.get('k').v);
// Expected: 2 7  (original unchanged)
