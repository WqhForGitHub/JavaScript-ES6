/**
 * 手写 Array.isArray
 *
 * 作用：判断给定值是否为数组，返回 boolean。
 *       这是最可靠的判断数组方式，能区分不同 realm（如 iframe）中的数组。
 *
 * 实现思路：
 *   方式一（推荐）：利用 Object.prototype.toString.call，
 *             数组的内部 [[Class]] 为 '[object Array]'，跨 iframe 也可靠。
 *   方式二：instanceof Array（在同 realm 下可用，但跨 iframe 会失效，这里仅作对比展示）。
 *
 * 本实现采用方式一。
 */

Array.myIsArray = function (value) {
  return Object.prototype.toString.call(value) === "[object Array]";
};

// ===== 测试 =====

// --- 数组返回 true ---
console.log(Array.myIsArray([1, 2, 3])); // true
console.log(Array.myIsArray([])); // true
console.log(Array.myIsArray(new Array(3))); // true

// --- 非数组返回 false ---
console.log(Array.myIsArray("abc")); // false
console.log(Array.myIsArray(123)); // false
console.log(Array.myIsArray({})); // false
console.log(Array.myIsArray({ length: 3 })); // false（类数组不是数组）
console.log(Array.myIsArray(null)); // false
console.log(Array.myIsArray(undefined)); // false
console.log(Array.myIsArray(true)); // false

// --- 函数返回 false ---
console.log(Array.myIsArray(function () {})); // false

// --- 跨 realm（模拟：用 Object.prototype.toString 同样可靠）---
// 在真实浏览器中，iframe 内的数组 instanceof Array 为 false，
// 但 Object.prototype.toString.call 仍返回 '[object Array]'，所以 myIsArray 依然正确。

// --- 与原生 Array.isArray 对比 ---
console.log(Array.myIsArray([1, 2]) === Array.isArray([1, 2])); // true
console.log(Array.myIsArray("str") === Array.isArray("str")); // true
console.log(Array.myIsArray({}) === Array.isArray({})); // true
