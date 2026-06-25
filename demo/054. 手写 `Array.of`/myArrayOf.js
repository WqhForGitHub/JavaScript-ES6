/**
 * 手写 Array.of
 *
 * 作用：把任意数量的参数转换成一个数组并返回。
 *       与 Array构造函数的区别：Array(3) 会创建长度为 3 的空数组，
 *       而 Array.of(3) 会创建包含一个元素 3 的数组 [3]。
 *
 * 实现思路：
 *   1. 创建空结果数组
 *   2. 遍历 arguments，把每个参数按顺序追加到结果数组
 *   3. 返回结果数组
 */

Array.myOf = function () {
  const result = [];
  for (let i = 0; i < arguments.length; i++) {
    result[result.length] = arguments[i];
  }
  return result;
};

// ===== 测试 =====

// --- 基本用法 ---
console.log(Array.myOf(1, 2, 3)); // [1, 2, 3]

// --- 单个数值参数（与 Array 构造函数的关键区别）---
console.log(Array.myOf(3)); // [3]
console.log(Array(3)); // [empty x 3]（对比：构造函数创建长度为 3 的空数组）

// --- 不同类型 ---
console.log(Array.myOf("a", "b", "c")); // ['a', 'b', 'c']
console.log(Array.myOf(1, "a", true, null, undefined)); // [1, 'a', true, null, undefined]

// --- 对象参数 ---
console.log(Array.myOf({ a: 1 }, [2, 3])); // [{ a: 1 }, [2, 3]]

// --- 无参数 ---
console.log(Array.myOf()); // []

// --- 与原生 Array.of 对比 ---
console.log(
  JSON.stringify(Array.myOf(1, 2, 3)) === JSON.stringify(Array.of(1, 2, 3)),
); // true
console.log(JSON.stringify(Array.myOf(7)) === JSON.stringify(Array.of(7))); // true
