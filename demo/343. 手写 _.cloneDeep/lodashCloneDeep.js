/**
 * _.cloneDeep(value)
 *
 * Recursively performs a deep clone of `value`. Supports arrays, plain
 * objects, Map, Set, Date, RegExp, and primitives. Cyclic references are
 * preserved via a cache keyed by the source object.
 *
 * Approach:
 * - Handle primitives, null, and undefined directly.
 * - Use a WeakMap cache to handle circular references.
 * - For each reference type, create a new instance of the same class and
 *   recursively clone each property / entry.
 */

function cloneDeep(value, cache = new WeakMap()) {
  // Primitives, null, undefined, functions
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Return cached clone to handle cycles
  if (cache.has(value)) {
    return cache.get(value);
  }

  // Date
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // RegExp
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  // Map
  if (value instanceof Map) {
    const cloned = new Map();
    cache.set(value, cloned);
    value.forEach((v, k) => {
      cloned.set(cloneDeep(k, cache), cloneDeep(v, cache));
    });
    return cloned;
  }

  // Set
  if (value instanceof Set) {
    const cloned = new Set();
    cache.set(value, cloned);
    value.forEach((v) => {
      cloned.add(cloneDeep(v, cache));
    });
    return cloned;
  }

  // Array or plain object
  const isArr = Array.isArray(value);
  const cloned = isArr ? new Array(value.length) : Object.create(Object.getPrototypeOf(value));
  cache.set(value, cloned);

  // Clone own enumerable properties (including array indices)
  for (const key of Reflect.ownKeys(value)) {
    if (key === 'constructor') continue;
    cloned[key] = cloneDeep(value[key], cache);
  }

  return cloned;
}

// --- Tests ---

// Test 1: deep object with nested arrays
const obj1 = { a: 1, b: { c: [1, 2, { d: 3 }] }, e: new Date(0) };
const clone1 = cloneDeep(obj1);
console.log('cloneDeep equal structure:', JSON.stringify(clone1) === JSON.stringify(obj1)); // true
console.log('cloneDeep different refs:', clone1.b !== obj1.b); // true
console.log('cloneDeep date is clone:', clone1.e !== obj1.e && clone1.e.getTime() === 0); // true

// Test 2: circular reference
const obj2 = { name: 'root' };
obj2.self = obj2;
const clone2 = cloneDeep(obj2);
console.log('cloneDeep cycle preserved:', clone2.self === clone2); // true
console.log('cloneDeep cycle not original:', clone2.self !== obj2); // true

// Test 3: Map and Set
const obj3 = { m: new Map([['k', { v: 1 }]]), s: new Set([1, 2, 3]) };
const clone3 = cloneDeep(obj3);
console.log('cloneDeep map clone:', clone3.m.get('k').v === 1 && clone3.m !== obj3.m); // true
console.log('cloneDeep set clone:', clone3.s.size === 3 && clone3.s !== obj3.s); // true

// Test 4: primitives are returned as-is
console.log('cloneDeep primitive:', cloneDeep(42) === 42 && cloneDeep('hi') === 'hi' && cloneDeep(null) === null); // true
