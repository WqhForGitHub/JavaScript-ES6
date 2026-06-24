/**
 * _.countBy(collection, [iteratee=_.identity])
 *
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` through `iteratee`. The value for each key
 * is the number of times the key was returned by iteratee.
 *
 * Approach:
 * - Compute the key for each element.
 * - Increment result[key] (initializing to 0 on first encounter).
 */

function countBy(collection, iteratee = (v) => v) {
  const get = typeof iteratee === 'function' ? iteratee : (v) => (v == null ? undefined : v[iteratee]);
  const result = Object.create(null);
  if (collection == null) return result;

  if (Array.isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      const k = String(get(collection[i], i, collection));
      result[k] = (result[k] || 0) + 1;
    }
  } else {
    for (const key of Object.keys(collection)) {
      const k = String(get(collection[key], key, collection));
      result[k] = (result[k] || 0) + 1;
    }
  }
  return result;
}

// --- Tests ---

console.log('countBy floor:', JSON.stringify(countBy([6.1, 4.2, 6.3], Math.floor))); // expected: {"4":1,"6":2}
console.log('countBy length:', JSON.stringify(countBy(['one', 'two', 'three'], 'length'))); // expected: {"3":2,"5":1}
console.log('countBy default:', JSON.stringify(countBy([1, 2, 1, 3, 2, 1]))); // expected: {"1":3,"2":2,"3":1}
console.log('countBy property:', JSON.stringify(countBy([{ x: 'a' }, { x: 'b' }, { x: 'a' }], 'x'))); // expected: {"a":2,"b":1}
console.log('countBy object coll:', JSON.stringify(countBy({ a: 'yes', b: 'no', c: 'yes' }))); // expected: {"yes":2,"no":1}
console.log('countBy empty:', JSON.stringify(countBy([]))); // expected: {}
