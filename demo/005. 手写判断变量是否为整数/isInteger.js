/**
 * 手写判断变量是否为整数
 *
 * 核心需求：判断一个值是否为整数（Integer）
 *   - 3        → true  （整数）
 *   - 3.0      → true  （3.0 === 3，是整数）
 *   - 3.5      → false （小数）
 *   - "3"      → false （字符串，不是数字）
 *   - NaN      → false
 *   - Infinity → false
 *
 * 以下提供 4 种方法，各有优缺点
 */

// ===== 方法 1：Number.isInteger() =====
// 最推荐的方式，ES6 标准 API

function isInteger1(value) {
  return Number.isInteger(value);
}

// 优点：官方标准、语义清晰、准确可靠
// 缺点：ES6 语法，IE 不支持（现代开发无需考虑）
// 注意：Number.isInteger(3.0) → true，因为 3.0 === 3

// ===== 方法 2：取整后与原值比较 =====
// 利用 Math.floor / Math.trunc 取整后与原值比较

function isInteger2(value) {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

// 优点：兼容性好，逻辑清晰
// 缺点：需要额外判断 typeof 和 isFinite
//   - 不加 typeof：Math.floor("3") === "3" → false，但如果不比较而是其他操作可能出错
//   - 不加 isFinite：Math.floor(Infinity) === Infinity → true，误判
//   也可以用 Math.trunc 代替 Math.floor，效果相同

// ===== 方法 3：取余判断 =====
// 整数对 1 取余等于 0

function isInteger3(value) {
  return typeof value === "number" && isFinite(value) && value % 1 === 0;
}

// 优点：写法简洁，取余运算直观
// 缺点：需要额外判断 typeof 和 isFinite
//   - 不加 typeof："3" % 1 === 0 → true，字符串也会通过
//   - 不加 isFinite：Infinity % 1 === NaN !== 0，这反而不会误判
//         但 NaN % 1 === NaN !== 0 也不会误判，所以 isFinite 主要防 Infinity
//   注意：对于极大数如 1e20 以上，浮点精度可能导致 % 运算不精确
//         例如：1e20 % 1 === 0 ✅ 但 1e20 + 0.1 的 % 结果可能不精确

// ===== 方法 4：位运算判断 =====
// 利用位运算自动截断小数的特性

function isInteger4(value) {
  return typeof value === "number" && isFinite(value) && (value | 0) === value;
}

// 优点：位运算性能好
// 缺点：
//   1. 位运算只处理 32 位整数，范围 [-2^31, 2^31 - 1]
//      超出范围的整数会溢出，导致判断错误
//      例如：2^31 = 2147483648，(2147483648 | 0) = -2147483648 ≠ 2147483648
//   2. 可读性较差，不熟悉位运算的人难以理解
// 也可以用 value ^ 0 === value 或 ~~value === value，本质相同

// ===== 测试 =====

const testCases = [
  { value: 0, expected: true, desc: "0" },
  { value: -0, expected: true, desc: "-0" },
  { value: 3, expected: true, desc: "正整数 3" },
  { value: -3, expected: true, desc: "负整数 -3" },
  { value: 3.0, expected: true, desc: "3.0（等于 3，是整数）" },
  { value: 1e10, expected: true, desc: "1e10（大整数）" },
  { value: 3.5, expected: false, desc: "小数 3.5" },
  { value: -3.5, expected: false, desc: "负小数 -3.5" },
  { value: 0.1, expected: false, desc: "0.1" },
  { value: NaN, expected: false, desc: "NaN" },
  { value: Infinity, expected: false, desc: "Infinity" },
  { value: -Infinity, expected: false, desc: "-Infinity" },
  { value: "3", expected: false, desc: "字符串 '3'" },
  { value: "3.5", expected: false, desc: "字符串 '3.5'" },
  { value: null, expected: false, desc: "null" },
  { value: undefined, expected: false, desc: "undefined" },
  { value: true, expected: false, desc: "布尔值 true" },
  { value: false, expected: false, desc: "布尔值 false" },
  { value: [3], expected: false, desc: "数组 [3]" },
  { value: {}, expected: false, desc: "空对象" },
];

const methods = [
  { name: "Number.isInteger()", fn: isInteger1, reliable: true },
  { name: "Math.floor() 比较", fn: isInteger2, reliable: true },
  { name: "取余 value % 1", fn: isInteger3, reliable: true },
  { name: "位运算 value | 0", fn: isInteger4, reliable: false },
];

console.log("========== 判断变量是否为整数 ==========\n");

methods.forEach(({ name, fn, reliable }) => {
  console.log(`--- 方法：${name} ${reliable ? "" : "（有局限）"}---`);
  let allPassed = true;

  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });

  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 边界测试：位运算溢出 ---
console.log("--- 边界测试：位运算溢出 ---");
const bigInt = 2147483648; // 2^31，超出 32 位有符号整数范围
console.log(`Number.isInteger(${bigInt}):  ${Number.isInteger(bigInt)}`); // true
console.log(`Math.floor 比较:              ${isInteger2(bigInt)}`); // true
console.log(`取余 value % 1:               ${isInteger3(bigInt)}`); // true
console.log(`位运算 value | 0:             ${isInteger4(bigInt)}`); // false ✗ 溢出误判

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log(
  "推荐优先级：Number.isInteger() > Math.floor 比较 > 取余判断 > 位运算",
);
console.log("Number.isInteger() : 最标准、最推荐，准确处理所有情况");
console.log("Math.floor 比较    : 兼容性好，逻辑清晰，适合手写");
console.log("取余 value % 1     : 简洁，超大浮点数可能有精度问题");
console.log("位运算 value | 0   : 不推荐，32 位溢出问题，仅适用于小范围整数");
