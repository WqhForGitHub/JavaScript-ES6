/**
 * _.find(collection, [predicate=_.identity], [fromIndex=0])
 *
 * Iterates over elements of `collection`, returning the first element that
 * `predicate` returns truthy for. `predicate` may be a function, an object
 * (matches via partial deep equality), a string (shorthand for a property
 * name to pluck), or an array `[key, value]` shorthand.
 *
 * Approach:
 * - Iterate the collection (array or object) starting at `fromIndex`.
 * - Resolve the predicate shorthand types into a comparison function.
 * - Return the first matching element, or undefined.
 */

function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

function baseMatches(source) {
  return function (obj) {
    return obj != null && deepMatch(obj, source);
  };
}

function deepMatch(actual, expected) {
  if (actual === expected) return true;
  if (typeof actual !== typeof expected) return false;
  if (!isObjectLike(actual) || !isObjectLike(expected))
    return actual === expected;
  for (const key of Object.keys(expected)) {
    if (!Object.prototype.hasOwnProperty.call(actual, key)) return false;
    if (!deepMatch(actual[key], expected[key])) return false;
  }
  return true;
}

function baseMatchesProperty(path, srcValue) {
  return function (obj) {
    return obj != null && obj[path] === srcValue;
  };
}

function property(key) {
  return function (obj) {
    return obj == null ? undefined : obj[key];
  };
}

function getIteratee(predicate) {
  if (typeof predicate === "function") return predicate;
  if (Array.isArray(predicate)) {
    return baseMatchesProperty(predicate[0], predicate[1]);
  }
  if (isObjectLike(predicate)) {
    return baseMatches(predicate);
  }
  if (typeof predicate === "string" || typeof predicate === "number") {
    return (obj) => obj != null && obj[predicate];
  }
  return (obj) => obj;
}

function find(collection, predicate, fromIndex = 0) {
  if (collection == null) return undefined;
  const iteratee = getIteratee(predicate);
  if (Array.isArray(collection)) {
    for (let i = Math.max(fromIndex, 0); i < collection.length; i++) {
      if (iteratee(collection[i], i, collection)) return collection[i];
    }
  } else {
    const keys = Object.keys(collection);
    for (let i = Math.max(fromIndex, 0); i < keys.length; i++) {
      const k = keys[i];
      if (iteratee(collection[k], k, collection)) return collection[k];
    }
  }
  return undefined;
}

// --- Tests ---

const users = [
  { user: "barney", age: 36, active: true },
  { user: "fred", age: 40, active: false },
  { user: "pebbles", age: 1, active: true },
];

console.log(
  "find with predicate:",
  JSON.stringify(find(users, (o) => o.age < 40)),
); // expected: {"user":"barney","age":36,"active":true}
console.log(
  "find object shorthand:",
  JSON.stringify(find(users, { age: 1, active: true })),
); // expected: {"user":"pebbles","age":1,"active":true}
console.log(
  "find array shorthand:",
  JSON.stringify(find(users, ["active", false])),
); // expected: {"user":"fred","age":40,"active":false}
console.log("find string shorthand:", JSON.stringify(find(users, "active"))); // expected: {"user":"barney",...}
console.log("find fromIndex:", JSON.stringify(find(users, "active", 1))); // expected: {"user":"pebbles",...}
console.log("find none:", find(users, { user: "nope" })); // undefined
