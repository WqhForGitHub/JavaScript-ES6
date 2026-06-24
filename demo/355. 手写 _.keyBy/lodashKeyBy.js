/**
 * _.keyBy(collection, [iteratee=_.identity])
 *
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` through `iteratee`. Unlike groupBy, each
 * value is a single element (the last one wins for duplicate keys) rather
 * than an array. Iteratee may be a function or a property-name shorthand.
 *
 * Approach:
 * - For each element compute its key and assign result[key] = element.
 */

function keyBy(collection, iteratee = (v) => v) {
  const get = typeof iteratee === 'function' ? iteratee : (v) => (v == null ? undefined : v[iteratee]);
  const result = Object.create(null);
  if (collection == null) return result;

  if (Array.isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      const key = get(collection[i], i, collection);
      result[String(key)] = collection[i];
    }
  } else {
    for (const k of Object.keys(collection)) {
      const key = get(collection[k], k, collection);
      result[String(key)] = collection[k];
    }
  }
  return result;
}

// --- Tests ---

const array = [
  { dir: 'left', code: 97 },
  { dir: 'right', code: 100 },
];

console.log('keyBy property:', JSON.stringify(keyBy(array, 'dir'))); // expected: {"left":{"dir":"left","code":97},"right":{"dir":"right","code":100}}
console.log('keyBy function:', JSON.stringify(keyBy(array, (o) => String.fromCharCode(o.code)))); // expected: {"a":{"dir":"left","code":97},"d":{"dir":"right","code":100}}

// Duplicate keys: last element wins
const dup = [{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' }];
console.log('keyBy duplicate wins:', JSON.stringify(keyBy(dup, 'id'))); // expected: {"1":{"id":1,"v":"b"},"2":{"id":2,"v":"c"}}

console.log('keyBy default:', JSON.stringify(keyBy(['x', 'y']))); // expected: {"x":"x","y":"y"}
console.log('keyBy numbers:', JSON.stringify(keyBy([{ n: 10 }, { n: 20 }], 'n'))); // expected: {"10":{"n":10},"20":{"n":20}}
