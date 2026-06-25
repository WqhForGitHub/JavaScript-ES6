/**
 * _.merge(object, [sources])
 *
 * Recursively merges own and inherited enumerable string keyed properties of
 * source objects into the destination object. Source properties that resolve
 * to undefined are skipped. Arrays and plain objects are merged recursively;
 * other values are assigned by reference.
 *
 * Approach:
 * - For each source, iterate over its keys.
 * - If both dest[key] and src[key] are plain objects (or both arrays), recurse.
 * - Otherwise, assign src[key] (unless undefined).
 */

function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

function isPlainObject(value) {
  if (!isObjectLike(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

function merge(object, ...sources) {
  if (!isObjectLike(object)) return object;
  for (const source of sources) {
    if (!isObjectLike(source)) continue;
    for (const key of Object.keys(source)) {
      const srcVal = source[key];
      if (srcVal === undefined) continue;
      const dstVal = object[key];
      if (Array.isArray(srcVal) && Array.isArray(dstVal)) {
        object[key] = mergeArray(dstVal, srcVal);
      } else if (isPlainObject(srcVal) && isPlainObject(dstVal)) {
        object[key] = merge(dstVal, srcVal);
      } else if (isPlainObject(srcVal)) {
        object[key] = merge(isPlainObject(dstVal) ? dstVal : {}, srcVal);
      } else {
        object[key] = srcVal;
      }
    }
  }
  return object;
}

function mergeArray(dst, src) {
  const result = dst.slice();
  for (let i = 0; i < src.length; i++) {
    if (i < result.length) {
      const srcVal = src[i];
      const dstVal = result[i];
      if (Array.isArray(srcVal) && Array.isArray(dstVal)) {
        result[i] = mergeArray(dstVal, srcVal);
      } else if (isPlainObject(srcVal) && isPlainObject(dstVal)) {
        result[i] = merge(dstVal, srcVal);
      } else if (srcVal !== undefined) {
        result[i] = srcVal;
      }
    } else if (src[i] !== undefined) {
      result.push(src[i]);
    }
  }
  return result;
}

// --- Tests ---

// Test 1: nested objects merge
const a = { a: [{ b: 2 }, { d: 4 }] };
merge(a, { a: [{ c: 3 }, { e: 5 }] });
console.log("merge nested:", JSON.stringify(a)); // expected: {"a":[{"b":2,"c":3},{"d":4,"e":5}]}

// Test 2: undefined is not merged
const b = { x: 1, y: 2 };
merge(b, { x: undefined, y: 3 });
console.log("merge skips undefined:", JSON.stringify(b)); // expected: {"x":1,"y":3}

// Test 3: arrays merge index by index
const c = { arr: [1, 2, 3] };
merge(c, { arr: [undefined, 5, 6, 7] });
console.log("merge arrays:", JSON.stringify(c)); // expected: {"arr":[1,5,6,7]}

// Test 4: deep nested merge
const d = { user: { name: "a", address: { city: "X" } } };
merge(d, { user: { age: 10, address: { zip: "000" } } });
console.log("merge deep:", JSON.stringify(d)); // expected: {"user":{"name":"a","address":{"city":"X","zip":"000"},"age":10}}
