/**
 * _.pick(object, [paths])
 *
 * Creates an object composed of the picked `object` properties. Only
 * properties that exist on `object` (own properties) are included.
 *
 * Approach:
 * - Flatten the provided paths into a list of keys.
 * - For each key, if `object` has that own property, copy it to the result.
 */

function pick(object, ...paths) {
  if (object == null) return {};
  const keys = [];
  for (const p of paths) {
    if (Array.isArray(p)) {
      keys.push(...p);
    } else {
      keys.push(p);
    }
  }
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}

// --- Tests ---

const obj = { a: 1, b: 2, c: 3, d: 4 };

console.log('pick by keys:', JSON.stringify(pick(obj, 'a', 'c'))); // expected: {"a":1,"c":3}
console.log('pick array of keys:', JSON.stringify(pick(obj, ['a', 'b', 'z']))); // expected: {"a":1,"b":2}
console.log('pick missing only:', JSON.stringify(pick(obj, 'x', 'y'))); // expected: {}
console.log('pick null:', JSON.stringify(pick(null, 'a'))); // expected: {}

// pick does not include inherited
const proto = Object.create({ inherited: 5 });
proto.own = 9;
console.log('pick own only:', JSON.stringify(pick(proto, 'own', 'inherited'))); // expected: {"own":9}
