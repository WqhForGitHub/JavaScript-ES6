/**
 * 手写函数 identity（返回自身）
 *
 * 作用：
 *   - identity(x) => x
 *   - 最简单的函数，原样返回参数
 *   - 用途：作为默认函数、map 的透传、函数式编程中的占位、过滤假值等
 *
 * 实现思路：
 *   - 直接返回第一个参数
 */

function identity(x) {
  return x;
}

// 接收多参数，返回第一个（与 Ramda R.identity 一致返回首参）
function identityFirst(...args) {
  return args[0];
}

// ===== 测试 =====

// 基本用法
console.log(identity(42)); // 42
console.log(identity("hello")); // 'hello'
console.log(identity(null)); // null
console.log(identity(undefined)); // undefined
console.log(identity({ a: 1 })); // { a: 1 }
console.log(identity([1, 2, 3])); // [1, 2, 3]

// 用作 map 的默认透传：拷贝数组
const arr = [1, 2, 3];
const copy = arr.map(identity);
console.log(copy); // [1, 2, 3]
console.log(copy === arr); // false（新数组）

// 用作 filter 默认：过滤假值
const mixed = [0, 1, false, 2, "", 3, null, "a", undefined];
console.log(mixed.filter(identity)); // [1, 2, 3, 'a']

// 用作 reduce 初始值的默认函数
function reduceDefault(fn, list) {
  return list.reduce((acc, x) => fn(acc, x), list[0] !== undefined ? list[0] : identity(undefined));
}

// 作为默认参数占位
function process(data, transform = identity) {
  return transform(data);
}
console.log(process(10)); // 10（无 transform 透传）
console.log(process(10, (x) => x * 2)); // 20

// 函数式编程：作为恒等 morphism
console.log([1, 2, 3].map(identity).reduce((a, b) => a + b, 0)); // 6

// 用在 sort 比较中保持原序（稳定排序占位）
const stable = [3, 1, 2].sort((a, b) => (a === b ? 0 : a - b));
console.log(stable); // [1, 2, 3]

// 多参数版本返回第一个
console.log(identityFirst(1, 2, 3)); // 1

// 应用：调试 - 打印并返回
const tapLog = (x) => {
  console.log("  debug:", x);
  return identity(x);
};
const r = tapLog(99);
console.log(r); // 99

// 应用：Promise 链中透传
Promise.resolve("data")
  .then(identity)
  .then((v) => console.log("透传:", v)); // 'data'

// 应用：作为组合的恒等元（compose(identity, f) === f）
function compose(...fns) {
  return (x) => fns.reduceRight((acc, f) => f(acc), x);
}
const f = compose((x) => x + 1, identity, (x) => x * 2);
console.log(f(5)); // 11 = (5*2)+1
