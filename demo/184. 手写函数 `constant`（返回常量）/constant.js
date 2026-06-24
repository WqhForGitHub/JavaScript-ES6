/**
 * 手写函数 constant（返回常量）
 *
 * 作用：
 *   - constant(value)(...) => value
 *   - 返回一个无论传入什么都恒定返回 value 的函数
 *   - 典型场景：作为 map / filter 的常量映射、默认值函数、
 *     Promise.catch 中返回固定兜底值
 *
 * 实现思路：
 *   - 闭包捕获 value，返回忽略参数的函数
 */

function constant(value) {
  return function () {
    return value;
  };
}

// ===== 测试 =====

// 基本用法
const alwaysTrue = constant(true);
console.log(alwaysTrue()); // true
console.log(alwaysTrue(1, 2, 3)); // true（忽略参数）
console.log(alwaysTrue("anything")); // true

const alwaysHello = constant("hello");
console.log(alwaysHello()); // 'hello'
console.log(alwaysHello(42)); // 'hello'

// 引用类型常量：返回同一引用
const obj = { a: 1 };
const alwaysObj = constant(obj);
console.log(alwaysObj() === obj); // true
console.log(alwaysObj() === alwaysObj()); // true

// 应用：map 成常量
console.log([1, 2, 3].map(constant(0))); // [0, 0, 0]
console.log(["a", "b", "c"].map(constant("x"))); // ['x', 'x', 'x']

// 应用：filter 用 constant(true) 全保留
console.log([1, 2, 3].filter(constant(true))); // [1, 2, 3]
// filter 用 constant(false) 全过滤
console.log([1, 2, 3].filter(constant(false))); // []

// 应用：Promise 兜底值
Promise.resolve("ok")
  .then(() => {
    throw new Error("fail");
  })
  .catch(constant("fallback"))
  .then((v) => console.log("兜底:", v)); // 'fallback'

// 应用：作为默认值函数
function getConfig(key, defaultValue) {
  // 模拟配置读取
  const config = { host: "localhost" };
  return config[key] !== undefined ? config[key] : defaultValue();
}
console.log(getConfig("host", constant("0.0.0.0"))); // 'localhost'
console.log(getConfig("port", constant(3000))); // 3000

// 应用：函数式编程中的真 / 假常量
const T = constant(true);
const F = constant(false);
console.log(T(), F()); // true false

// 应用：作为 stub / mock 返回值
const mockFetch = constant(Promise.resolve({ status: 200 }));
mockFetch().then((r) => console.log("mock:", r.status)); // 200

// 与 identity 对比
function identity(x) {
  return x;
}
console.log([1, 2, 3].map(identity)); // [1, 2, 3]（返回元素本身）
console.log([1, 2, 3].map(constant(0))); // [0, 0, 0]（返回常量）

// 应用：converge 中固定某分支
function converge(c, branches) {
  return (...args) => c.apply(null, branches.map((b) => b(...args)));
}
const alwaysGreet = converge(
  (name) => `Hi, ${name}`,
  [constant("Guest")]
);
console.log(alwaysGreet("anything")); // 'Hi, Guest'

// 应用：缓存命中时返回固定占位
const placeholder = constant("---");
console.log(["", "", ""].map(placeholder)); // ['---','---','---']
