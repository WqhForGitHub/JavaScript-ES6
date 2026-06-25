/**
 * 手写 Object.is（ES5 实现）
 *
 * Object.is(value1, value2) 判断两个值是否"相同"。
 * 与 === 的区别：
 * - Object.is(NaN, NaN) === true（=== 为 false）
 * - Object.is(+0, -0) === false（=== 为 true）
 * 其余行为与 === 相同。
 */

// 手写 Object.is
function objectIs(x, y) {
  // 处理 NaN：NaN 是唯一不等于自身的值
  if (x !== x) {
    return y !== y;
  }
  // 此时 x 不是 NaN
  // 处理 +0 和 -0：1/+0 = Infinity, 1/-0 = -Infinity
  if (x === 0 && y === 0) {
    return 1 / x === 1 / y;
  }
  // 普通情况用 ===
  return x === y;
}

// 另一种实现方式（使用更明确的判断）
function objectIsAlt(x, y) {
  // 如果 x 和 y 严格相等，再检查是否为 +0/-0 的情况
  if (x === y) {
    // 排除 +0 === -0 的情况
    return x !== 0 || 1 / x === 1 / y;
  }
  // 处理 NaN
  return x !== x && y !== y;
}

// 测试 1：与 === 相同的情况
console.log("--- Same as === ---");
console.log(objectIs(1, 1)); // true
console.log(objectIs("a", "a")); // true
console.log(objectIs(true, true)); // true
console.log(objectIs(null, null)); // true
console.log(objectIs(undefined, undefined)); // true
console.log(objectIs(1, "1")); // false
console.log(objectIs(1, 2)); // false
console.log(objectIs(null, undefined)); // false

// 测试 2：NaN（与 === 的关键区别）
console.log("--- NaN ---");
console.log(objectIs(NaN, NaN)); // true
console.log(NaN === NaN); // false
console.log(objectIs(NaN, 0)); // false
console.log(objectIs(NaN, undefined)); // false

// 测试 3：+0 和 -0（与 === 的关键区别）
console.log("--- +0 vs -0 ---");
console.log(objectIs(0, -0)); // false
console.log(0 === -0); // true
console.log(objectIs(-0, -0)); // true
console.log(objectIs(0, 0)); // true
console.log(objectIs(+0, 0)); // true

// 测试 4：对象引用
console.log("--- Object reference ---");
var obj = {};
console.log(objectIs(obj, obj)); // true（同一引用）
console.log(objectIs({}, {})); // false（不同引用）
console.log(objectIs([], [])); // false

// 测试 5：特殊值
console.log("--- Special values ---");
console.log(objectIs(Infinity, Infinity)); // true
console.log(objectIs(-Infinity, -Infinity)); // true
console.log(objectIs(Infinity, -Infinity)); // false
console.log(objectIs("", "")); // true

// 测试 6：两种实现对比
console.log("--- Compare two implementations ---");
var testCases = [
  [NaN, NaN],
  [0, -0],
  [1, 1],
  ["a", "a"],
  [null, undefined],
  [Infinity, -Infinity],
  [obj, obj],
  [{}, {}],
];
testCases.forEach(function (tc) {
  var r1 = objectIs(tc[0], tc[1]);
  var r2 = objectIsAlt(tc[0], tc[1]);
  console.log(objectIs(tc[0], tc[1]) === objectIsAlt(tc[0], tc[1])); // true（全部一致）
});

// 测试 7：与原生对比
console.log("--- Compare with native ---");
testCases.forEach(function (tc) {
  console.log(objectIs(tc[0], tc[1]) === Object.is(tc[0], tc[1])); // true
});

// 测试 8：实用场景 - 安全比较
console.log("--- Use case: safe comparison ---");
function safeEquals(a, b) {
  return objectIs(a, b);
}
console.log(safeEquals(NaN, NaN)); // true（比 === 更符合直觉）
console.log(safeEquals(0, -0)); // false（区分 +0 和 -0）
