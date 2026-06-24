/**
 * _.set(object, path, value)
 *
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist
 * it is created. Arrays are created for missing numeric indices; otherwise
 * plain objects are created for missing segments.
 *
 * Approach:
 * - Cast path to an array of keys.
 * - Walk to the second-to-last key, creating objects/arrays for any missing
 *   intermediate segment (use an array when the next key is a numeric index).
 * - Assign value at the final key.
 */

function castPath(path) {
  if (Array.isArray(path)) return path.slice();
  if (typeof path === 'number') return [String(path)];
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

function isIndex(key) {
  return /^(0|[1-9]\d*)$/.test(String(key));
}

function set(object, path, value) {
  if (object == null) return object;
  const keys = castPath(path);
  let current = object;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const useArray = isIndex(nextKey);
    if (current[key] == null) {
      current[key] = useArray ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return object;
}

// --- Tests ---

const obj1 = {};
set(obj1, 'a.b.c', 1);
console.log('set creates nested:', JSON.stringify(obj1)); // expected: {"a":{"b":{"c":1}}}

const obj2 = { a: { b: [0, 0, 0] } };
set(obj2, 'a.b[1]', 9);
console.log('set array index:', JSON.stringify(obj2)); // expected: {"a":{"b":[0,9,0]}}

const obj3 = {};
set(obj3, ['arr', 0, 'name'], 'hello');
console.log('set creates array path:', JSON.stringify(obj3)); // expected: {"arr":[{"name":"hello"}]}

const obj4 = {};
set(obj4, 'a.b.c.d', 'deep');
console.log('set deep path:', JSON.stringify(obj4)); // expected: {"a":{"b":{"c":{"d":"deep"}}}}
