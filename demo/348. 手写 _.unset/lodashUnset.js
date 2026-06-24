/**
 * _.unset(object, path)
 *
 * Removes the property at `path` of `object`. Returns true if the property
 * is removed, false otherwise. Path may be a string (dot/bracket notation)
 * or an array of property names.
 *
 * Approach:
 * - Cast path to keys.
 * - Walk to the parent of the last key; if at any point current becomes
 *   null/undefined before reaching the parent, return false.
 * - If the parent doesn't own the final key, return false.
 * - Otherwise delete the key and return true.
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

function unset(object, path) {
  if (object == null) return false;
  const keys = castPath(path);
  if (keys.length === 0) return false;

  let current = object;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null) {
      // Path does not fully exist
      return false;
    }
    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  if (!Object.prototype.hasOwnProperty.call(current, lastKey)) {
    return false;
  }
  delete current[lastKey];
  return true;
}

// --- Tests ---

const obj1 = { a: { b: { c: 1 } } };
console.log('unset nested:', unset(obj1, 'a.b.c')); // true
console.log('unset result:', JSON.stringify(obj1)); // expected: {"a":{"b":{}}}

const obj2 = { arr: [10, 20, 30] };
console.log('unset array index:', unset(obj2, 'arr[1]')); // true
console.log('unset array result:', JSON.stringify(obj2)); // expected: {"arr":[null,30]} (delete leaves a hole)

const obj3 = { a: 1 };
console.log('unset missing:', unset(obj3, 'x.y.z')); // false
console.log('unset missing keeps obj:', JSON.stringify(obj3)); // expected: {"a":1}

const obj4 = { a: { b: 2 } };
console.log('unset via array path:', unset(obj4, ['a', 'b'])); // true
console.log('unset via array result:', JSON.stringify(obj4)); // expected: {"a":{}}
