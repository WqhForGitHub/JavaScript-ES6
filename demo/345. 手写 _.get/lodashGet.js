/**
 * _.get(object, path, [defaultValue])
 *
 * Gets the value at `path` of `object`. `path` may be an array of property
 * names or a dot/bracket notation string (e.g. "a[0].b.c"). If the resolved
 * value is undefined, `defaultValue` is returned in its place.
 *
 * Approach:
 * - Cast `path` to an array of keys (splitting "a.b['c']" style strings).
 * - Walk the object following each key; return undefined as soon as a step
 *   can't be resolved.
 * - Return defaultValue when the final value is undefined.
 */

function castPath(path) {
  if (Array.isArray(path)) return path.slice();
  if (typeof path === "number") return [String(path)];
  // Match dot notation and bracket notation (with single/double quotes)
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

function get(object, path, defaultValue) {
  if (object == null) return defaultValue;
  const keys = castPath(path);
  let current = object;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}

// --- Tests ---

const obj = {
  a: { b: { c: 1 } },
  arr: [{ x: 10 }, { x: 20 }],
  "d.e": "literal",
};

console.log("get nested string:", get(obj, "a.b.c")); // 1
console.log("get array index:", get(obj, "arr[0].x")); // 10
console.log("get array path:", get(obj, ["arr", 1, "x"])); // 20
console.log("get missing -> default:", get(obj, "a.b.z", "fallback")); // 'fallback'
console.log("get null object:", get(null, "a.b", "none")); // 'none'
console.log("get deep missing:", get(obj, "x.y.z", undefined)); // undefined
