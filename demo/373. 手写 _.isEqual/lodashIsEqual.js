/**
 * _.isEqual(value, other)
 *
 * Performs a deep comparison between two values to determine if they are
 * equivalent. Supports arrays, plain objects, booleans, numbers, strings,
 * dates, regexps, Map, Set, and handles NaN === NaN (SameValueZero). Cyclic
 * references are handled by tracking compared object pairs in a stack.
 *
 * Approach:
 * - Use Object.is for the base comparison (gives SameValueZero including NaN).
 * - If both values are not objects, return Object.is(value, other).
 * - Differing tags/class types => not equal.
 * - For each container type (Array, Map, Set, Date, RegExp, plain object),
 *   compare structurally while guarding against cycles via a stack of
 *   previously-seen [value, other] pairs.
 */

function getTag(value) {
  if (value == null) {
    return value === undefined ? "[object Undefined]" : "[object Null]";
  }
  return Object.prototype.toString.call(value);
}

function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

function isEqual(value, other) {
  return baseIsEqual(value, other);
}

function baseIsEqual(value, other, stackA = [], stackB = []) {
  if (Object.is(value, other)) return true;

  // If either is not an object (or is null), they can't be equal here (since
  // Object.is already handled the primitive case including NaN).
  if (!isObjectLike(value) || !isObjectLike(other)) {
    return false;
  }

  const tag1 = getTag(value);
  const tag2 = getTag(other);
  if (tag1 !== tag2) return false;

  // Detect cyclic references: if we've already started comparing this exact
  // pair, treat them as equal to break the cycle.
  for (let i = 0; i < stackA.length; i++) {
    if (stackA[i] === value && stackB[i] === other) {
      return true;
    }
  }

  switch (tag1) {
    case "[object Boolean]":
    case "[object Date]":
      return +value === +other;
    case "[object Error]":
      return value.name === other.name && value.message === other.message;
    case "[object Number]":
      // Object wrappers handled above; this covers Number objects
      return Object.is(+value, +other);
    case "[object String]":
      return String(value) === String(other);
    case "[object RegExp]":
      return value.source === other.source && value.flags === other.flags;
    case "[object Map]": {
      if (value.size !== other.size) return false;
      stackA.push(value);
      stackB.push(other);
      let equal = true;
      for (const [k, v] of value) {
        // Map keys compared by SameValueZero already; compare values deeply.
        // other must have k (Map uses SameValueZero), get via has.
        if (!other.has(k) || !baseIsEqual(v, other.get(k), stackA, stackB)) {
          equal = false;
          break;
        }
      }
      stackA.pop();
      stackB.pop();
      return equal;
    }
    case "[object Set]": {
      if (value.size !== other.size) return false;
      stackA.push(value);
      stackB.push(other);
      // Compare as arrays of entries (order-independent by using a pairing).
      const otherArr = Array.from(other);
      const used = new Array(otherArr.length).fill(false);
      let equal = true;
      outer: for (const item of value) {
        for (let i = 0; i < otherArr.length; i++) {
          if (used[i]) continue;
          if (baseIsEqual(item, otherArr[i], stackA, stackB)) {
            used[i] = true;
            continue outer;
          }
        }
        equal = false;
        break;
      }
      stackA.pop();
      stackB.pop();
      return equal;
    }
    case "[object Array]": {
      if (value.length !== other.length) return false;
      stackA.push(value);
      stackB.push(other);
      let equal = true;
      for (let i = 0; i < value.length; i++) {
        if (!baseIsEqual(value[i], other[i], stackA, stackB)) {
          equal = false;
          break;
        }
      }
      stackA.pop();
      stackB.pop();
      return equal;
    }
    case "[object Object]": {
      const keys1 = Object.keys(value);
      const keys2 = Object.keys(other);
      if (keys1.length !== keys2.length) return false;
      stackA.push(value);
      stackB.push(other);
      let equal = true;
      for (const key of keys1) {
        if (
          !Object.prototype.hasOwnProperty.call(other, key) ||
          !baseIsEqual(value[key], other[key], stackA, stackB)
        ) {
          equal = false;
          break;
        }
      }
      stackA.pop();
      stackB.pop();
      return equal;
    }
    default:
      // For other object types, fall back to referential equality (already
      // checked by Object.is at the top) => not equal.
      return false;
  }
}

// --- Tests ---

console.log("isEqual primitives:", isEqual(1, 1)); // true
console.log("isEqual NaN:", isEqual(NaN, NaN)); // true
console.log(
  "isEqual nested objects:",
  isEqual({ a: { b: 2 } }, { a: { b: 2 } }),
); // true
console.log(
  "isEqual nested arrays:",
  isEqual([1, [2, { c: 3 }]], [1, [2, { c: 3 }]]),
); // true
console.log(
  "isEqual different order keys:",
  isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }),
); // true
console.log("isEqual date:", isEqual(new Date("2020"), new Date("2020"))); // true
console.log("isEqual regexp:", isEqual(/abc/gi, /abc/gi)); // true
console.log("isEqual map:", isEqual(new Map([["a", 1]]), new Map([["a", 1]]))); // true
console.log("isEqual set:", isEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))); // true

console.log("isEqual not equal objects:", isEqual({ a: 1 }, { a: 2 })); // false
console.log("isEqual different lengths:", isEqual([1, 2], [1, 2, 3])); // false
console.log("isEqual different types:", isEqual(1, "1")); // false
console.log("isEqual different regexp flags:", isEqual(/a/g, /a/i)); // false

// Cyclic references
const a = { x: 1 };
a.self = a;
const b = { x: 1 };
b.self = b;
console.log("isEqual cyclic:", isEqual(a, b)); // true
console.log("isEqual cyclic unequal:", isEqual(a, { x: 1, self: {} })); // false
