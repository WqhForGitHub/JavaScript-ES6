/**
 * _.omit(object, [paths])
 *
 * The opposite of _.pick; creates an object with all own properties of
 * `object` except those listed in `paths`.
 *
 * Approach:
 * - Build a Set of keys to omit (flattening array arguments).
 * - Iterate over the object's own keys, copying any key not in the omit set.
 */

function omit(object, ...paths) {
  if (object == null) return {};
  const omitSet = new Set();
  for (const p of paths) {
    if (Array.isArray(p)) {
      for (const k of p) omitSet.add(k);
    } else {
      omitSet.add(p);
    }
  }
  const result = {};
  for (const key of Object.keys(object)) {
    if (!omitSet.has(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

// --- Tests ---

const obj = { a: 1, b: 2, c: 3, d: 4 };

console.log("omit by keys:", JSON.stringify(omit(obj, "a", "c"))); // expected: {"b":2,"d":4}
console.log("omit array:", JSON.stringify(omit(obj, ["a", "b", "z"]))); // expected: {"c":3,"d":4}
console.log("omit nothing:", JSON.stringify(omit(obj))); // expected: {"a":1,"b":2,"c":3,"d":4}
console.log("omit null:", JSON.stringify(omit(null, "a"))); // expected: {}

// omit does not include inherited
const proto = Object.create({ inherited: 5 });
proto.own = 9;
console.log("omit own only:", JSON.stringify(omit(proto, "own"))); // expected: {} (inherited never copied)
