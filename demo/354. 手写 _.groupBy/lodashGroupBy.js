/**
 * _.groupBy(collection, [iteratee=_.identity])
 *
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` through `iteratee`. The values of the object
 * are arrays of elements responsible for generating the same key. Iteratee
 * may be a function or a property name (string/number) shorthand.
 *
 * Approach:
 * - For arrays and objects, compute the key for each element.
 * - Push the element into result[key] (creating an array if needed).
 */

function groupBy(collection, iteratee = (v) => v) {
  const get = typeof iteratee === 'function' ? iteratee : (v) => (v == null ? undefined : v[iteratee]);
  const result = Object.create(null);
  if (collection == null) return result;

  if (Array.isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      const key = get(collection[i], i, collection);
      const groupKey = String(key);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(collection[i]);
    }
  } else {
    for (const key of Object.keys(collection)) {
      const k = get(collection[key], key, collection);
      const groupKey = String(k);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(collection[key]);
    }
  }
  return result;
}

// --- Tests ---

console.log('groupBy floor:', JSON.stringify(groupBy([6.1, 4.2, 6.3], Math.floor))); // expected: {"4":[4.2],"6":[6.1,6.3]}
console.log('groupBy length:', JSON.stringify(groupBy(['one', 'two', 'three'], 'length'))); // expected: {"3":["one","two"],"5":["three"]}
console.log('groupBy property:', JSON.stringify(groupBy([{ x: 1 }, { x: 2 }, { x: 1 }], 'x'))); // expected: {"1":[{"x":1},{"x":1}],"2":[{"x":2}]}
console.log('groupBy object:', JSON.stringify(groupBy({ a: 1.1, b: 2.4, c: 1.9 }, Math.floor))); // expected: {"1":[1.1,1.9],"2":[2.4]}
console.log('groupBy default identity:', JSON.stringify(groupBy([1, 2, 1, 3, 2]))); // expected: {"1":[1,1],"2":[2,2],"3":[3]}
