/**
 * _.has(object, path)
 *
 * Checks if `path` is a direct property of `object`. The path can be either
 * a string (dot/bracket notation) or an array of property names.
 *
 * Approach:
 * - Cast path to keys.
 * - Walk down the object; if at any point the current value is null/undefined
 *   but there are more keys to traverse, return false.
 * - Otherwise check whether the final key exists via Object.prototype.hasOwnProperty.
 */

function castPath(path) {
  if (Array.isArray(path)) return path.slice();
  if (typeof path === "number") return [String(path)];
  const result = [];
  const re = /[^.[\]]+|\[(?:(['"])(.*?)\1|(\d+))\]/g;
  let match;
  while ((match = re.exec(path)) !== null) {
    const [, quote, strKey, numKey] = match;
    if (quote) {
      result.push(strKey);
    } else if (numKey !== undefined) {
      result.push(numKey);
    } else {
      result.push(match[0]);
    }
  }
  return result;
}

function has(object, path) {
  if (object == null) return false;
  const keys = castPath(path);
  let current = object;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (
      current == null ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return false;
    }
    current = current[key];
  }
  return true;
}

// --- Tests ---

const obj = { a: { b: { c: 1 } }, arr: [10, 20], "d.e": "literal" };

console.log("has nested:", has(obj, "a.b.c")); // true
console.log("has missing:", has(obj, "a.b.z")); // false
console.log("has array index:", has(obj, "arr[0]")); // true
console.log("has array out-of-range:", has(obj, "arr[5]")); // false
console.log("has array path:", has(obj, ["a", "b", "c"])); // true
console.log(
  "has inherited false:",
  has(Object.create({ inherited: 1 }), "inherited"),
); // false
console.log("has null object:", has(null, "a")); // false
