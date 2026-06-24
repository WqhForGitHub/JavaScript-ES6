/**
 * 手写函数 juxt（并列执行多个函数）
 *
 * 作用：
 *   - juxt([f, g, h])(x) => [f(x), g(x), h(x)]
 *   - 把同一输入并列传给多个函数，返回结果数组
 *   - 与 converge 区别：juxt 返回数组；converge 用一个函数汇总数组
 *   - 典型场景：同时获取多种视图、并行计算多个指标
 *
 * 实现思路：
 *   1. 对每个函数调用同一输入，收集到数组返回
 */

function juxt(fns) {
  return function (...args) {
    return fns.map((fn) => fn.apply(this, args));
  };
}

// ===== 测试 =====

// 基本：同一输入多函数
const f = juxt([
  (x) => x + 1,
  (x) => x * 2,
  (x) => x * x,
]);
console.log(f(3)); // [4, 6, 9]

// 字符串：取首尾、长度、大写
const inspect = juxt([
  (s) => s[0],
  (s) => s[s.length - 1],
  (s) => s.length,
  (s) => s.toUpperCase(),
]);
console.log(inspect("hello")); // ['h', 'o', 5, 'HELLO']

// 数组：同时求和、最大、最小、平均
const sum = (list) => list.reduce((a, b) => a + b, 0);
const stats = juxt([
  sum,
  (list) => Math.max(...list),
  (list) => Math.min(...list),
  (list) => sum(list) / list.length,
  (list) => list.length,
]);
console.log(stats([1, 2, 3, 4, 5]));
// [15, 5, 1, 3, 5]

// juxt 与 converge 关系：converge = juxt + 汇总函数
function converge(converger, branches) {
  return (...args) => converger.apply(null, juxt(branches)(...args));
}
const average = converge((s, n) => s / n, [sum, (l) => l.length]);
console.log(average([1, 2, 3, 4])); // 2.5

// 应用：日志同时输出多种信息
const describe = juxt([
  (x) => `value: ${x}`,
  (x) => `type: ${typeof x}`,
  (x) => `isNumber: ${typeof x === "number"}`,
]);
console.log(describe(42));
// ['value: 42', 'type: number', 'isNumber: true']

// 应用：同时验证多个条件
const validators = juxt([
  (x) => x > 0,
  (x) => x < 100,
  (x) => Number.isInteger(x),
]);
console.log(validators(50)); // [true, true, true]
console.log(validators(-1)); // [false, true, true]
console.log(validators(150)); // [true, false, true]

// 空函数列表
console.log(juxt([])("anything")); // []

// 单函数
console.log(juxt([(x) => x + 1])(10)); // [11]

// 应用：把对象转成 [key, value] 对数组
const toPairs = juxt([
  (obj) => Object.keys(obj),
  (obj) => Object.values(obj),
]);
console.log(toPairs({ a: 1, b: 2 })); // [['a','b'], [1,2]]

// 配合 transduce 风格：juxt 对每个元素
const perChar = juxt([
  (c) => c.toUpperCase(),
  (c) => c.charCodeAt(0),
]);
console.log("abc".split("").map(perChar));
// [['A',97], ['B',98], ['C',99]]
