/**
 * _.defaults(object, [sources])
 *
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to undefined. Source objects are applied left to right. Once a
 * property is set, subsequent sources that define the same property are
 * ignored (the first non-undefined value wins).
 *
 * Approach:
 * - Iterate over each source's keys.
 * - For each key, if `object[key]` is undefined, assign the source value.
 */

function defaults(object, ...sources) {
  if (object == null) return object;
  for (const source of sources) {
    if (source == null) continue;
    // Include inherited enumerable properties too (lodash uses ForIn)
    for (const key in source) {
      const value = object[key];
      if (value === undefined) {
        object[key] = source[key];
      }
    }
  }
  return object;
}

// --- Tests ---

console.log('defaults fills undefined:', JSON.stringify(defaults({ a: 1 }, { a: 2, b: 2 }))); // expected: {"a":1,"b":2}
console.log('defaults fills null too:', JSON.stringify(defaults({ a: null }, { a: 2, b: 3 }))); // expected: {"a":null,"b":3}  (null is not undefined)
console.log('defaults fills missing:', JSON.stringify(defaults({}, { x: 1, y: 2 }))); // expected: {"x":1,"y":2}
console.log('defaults multiple sources:', JSON.stringify(defaults({ a: 1 }, { a: 9, b: 2 }, { b: 9, c: 3 }))); // expected: {"a":1,"b":2,"c":3}
console.log('defaults chained:', JSON.stringify(defaults({ a: undefined }, { a: 5 }, { a: 9 }))); // expected: {"a":5} (first wins)
