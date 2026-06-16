/**
 * 手写判断变量是否为 NaN
 *
 * 核心难点：NaN 是 JavaScript 中唯一一个不等于自身的值
 *   - NaN === NaN  → false
 *   - NaN !== NaN  → true
 *   - typeof NaN   → "number"（NaN 属于 number 类型）
 *
 * 以下提供 4 种方法，各有优缺点
 */

// ===== 方法 1：Number.isNaN() =====
// 最推荐的方式，ES6 标准 API，准确可靠

function isNaN1(value) {
  return Number.isNaN(value);
}

// 优点：官方标准、语义清晰，只有真正为 NaN 时才返回 true
// 缺点：ES6 语法，极老环境不支持（现代开发无需考虑）

// ===== 方法 2：利用 NaN 不等于自身的特性 =====
// 最经典的手写方式，利用 NaN !== NaN

function isNaN2(value) {
  return value !== value;
}

// 优点：写法极简，不需要任何 API，兼容性完美
// 缺点：语义不够直观，初见可能不理解为什么 value !== value
//       严格来说，如果有人重写了对象的 valueOf/toString 也可能产生自不等的情况，
//       但实际场景中这几乎不会发生

// ===== 方法 3：Object.is() =====
// ES6 提供的严格相等判断方法

function isNaN3(value) {
  return Object.is(value, NaN);
}

// 优点：语义清晰，Object.is 是 ES6 推荐的精确比较方式
// 缺点：ES6 语法，极老环境不支持
// 注意：Object.is 与 === 的区别主要在两个地方：
//   1. Object.is(NaN, NaN) → true  （=== 返回 false）
//   2. Object.is(-0, +0)  → false  （=== 返回 true）

// ===== 方法 4：全局 isNaN()（不推荐，仅作对比）=====

function isNaN4(value) {
  return isNaN(value); // 全局函数 isNaN()
}

// 缺点：全局 isNaN() 会先对参数进行隐式 Number() 转换
//   - isNaN("hello")    → true  （先转 Number("hello") = NaN，再判断）
//   - isNaN(undefined)  → true  （先转 Number(undefined) = NaN，再判断）
//   - isNaN("123")      → false （先转 Number("123") = 123，再判断）
//   这些都不是真正的 NaN，但全局 isNaN() 返回了 true，容易误判

// ===== 测试 =====

const testCases = [
  { value: NaN, expected: true, desc: "NaN" },
  { value: 0 / 0, expected: true, desc: "0 / 0（运算产生 NaN）" },
  {
    value: Number("abc"),
    expected: true,
    desc: "Number('abc')（转换产生 NaN）",
  },
  { value: Infinity, expected: false, desc: "Infinity" },
  { value: -Infinity, expected: false, desc: "-Infinity" },
  { value: 0, expected: false, desc: "0" },
  { value: -0, expected: false, desc: "-0" },
  { value: 123, expected: false, desc: "正整数" },
  { value: 1.5, expected: false, desc: "小数" },
  { value: "hello", expected: false, desc: "字符串" },
  { value: "NaN", expected: false, desc: "字符串 'NaN'" },
  { value: undefined, expected: false, desc: "undefined" },
  { value: null, expected: false, desc: "null" },
  { value: true, expected: false, desc: "布尔值 true" },
  { value: {}, expected: false, desc: "空对象" },
  { value: [], expected: false, desc: "空数组" },
];

const methods = [
  { name: "Number.isNaN()", fn: isNaN1, reliable: true },
  { name: "value !== value", fn: isNaN2, reliable: true },
  { name: "Object.is(value, NaN)", fn: isNaN3, reliable: true },
  { name: "全局 isNaN()", fn: isNaN4, reliable: false },
];

console.log("========== 判断变量是否为 NaN ==========\n");

methods.forEach(({ name, fn, reliable }) => {
  console.log(`--- 方法：${name} ${reliable ? "" : "（不推荐）"}---`);
  let allPassed = true;

  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });

  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 总结 ---
console.log("========== 总结 ==========");
console.log(
  "推荐优先级：Number.isNaN() > value !== value > Object.is(value, NaN)",
);
console.log("Number.isNaN()  : 最标准、最推荐，只有真正为 NaN 时返回 true");
console.log("value !== value : 最简洁的手写方案，兼容性最好");
console.log("Object.is()     : 语义清晰，ES6 精确比较");
console.log("全局 isNaN()    : 不推荐，会隐式转换参数导致误判");
