/**
 * 手写判断变量是否为可迭代对象
 *
 * 可迭代对象（Iterable）定义：
 *   - 实现了 [Symbol.iterator] 协议
 *   - 即对象上存在 Symbol.iterator 属性且为函数
 *
 * 内置可迭代对象：
 *   - Array、String、Map、Set、TypedArray、arguments
 *   - NodeList（DOM 环境）
 *   - 生成器对象（generator 实例）
 *
 * 不可迭代：
 *   - 普通对象 {}
 *   - null、undefined
 *   - number、boolean 等基本类型
 *
 * 实现思路：
 *   1. 排除 null/undefined
 *   2. 检查 value[Symbol.iterator] 是否为函数
 */

function isIterable(value) {
  // 1. null / undefined 不可迭代
  if (value === null || value === undefined) {
    return false;
  }

  // 2. 检查是否存在 Symbol.iterator 且为函数
  //    注意：基本类型字符串/数字也可通过包装对象访问，但只有字符串实现了迭代协议
  //    用 Object(value)[Symbol.iterator] 兼容基本类型字符串的判断
  const iteratorFn = value[Symbol.iterator];
  return typeof iteratorFn === "function";
}

// ===== 测试 =====

// --- 可迭代对象 ---
console.log(isIterable([1, 2, 3])); // true
console.log(isIterable("hello")); // true（字符串可迭代）
console.log(isIterable(new Map())); // true
console.log(isIterable(new Set())); // true
console.log(isIterable(new Int8Array(4))); // true

// --- arguments ---
function fn() {
  return arguments;
}
console.log(isIterable(fn(1, 2, 3))); // true

// --- 生成器对象 ---
function* gen() {
  yield 1;
}
console.log(isIterable(gen())); // true（generator 实例可迭代）

// --- 自定义可迭代对象 ---
const customIterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return i < 3 ? { value: i++, done: false } : { done: true };
      },
    };
  },
};
console.log(isIterable(customIterable)); // true

// --- 不可迭代 ---
console.log(isIterable({})); // false（普通对象不可迭代）
console.log(isIterable({ length: 2, 0: "a", 1: "b" })); // false（类数组对象不可迭代）
console.log(isIterable(null)); // false
console.log(isIterable(undefined)); // false
console.log(isIterable(123)); // false
console.log(isIterable(true)); // false
console.log(isIterable(Symbol("s"))); // false
console.log(isIterable(new Date())); // false
console.log(isIterable(/regex/)); // false
console.log(isIterable(new WeakMap())); // false（WeakMap 不可迭代）
console.log(isIterable(new WeakSet())); // false（WeakSet 不可迭代）
