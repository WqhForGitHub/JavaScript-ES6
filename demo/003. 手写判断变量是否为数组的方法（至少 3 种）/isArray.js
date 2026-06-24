/**
 * 手写判断变量是否为数组的方法（至少 3 种）
 *
 * 核心需求：区分数组 [] 和普通对象 {}
 *   - typeof [] 和 typeof {} 都返回 "object"，无法区分
 *   - 需要更精确的方法来判断一个值是否为数组
 *
 * 以下提供 5 种方法，各有优缺点
 */

// ===== 方法 1：Array.isArray() =====
// 最推荐的方式，ES5+ 标准 API，准确可靠

function isArray1(value) {
  return Array.isArray(value);
}

// 优点：官方标准、语义清晰、能正确处理跨 iframe 的问题
// 缺点：IE8 及以下不支持（现代开发无需考虑）

// ===== 方法 2：Object.prototype.toString.call() =====
// 最通用的类型判断方式，被称为"类型判断终极方案"

function isArray2(value) {
  return Object.prototype.toString.call(value) === "[object Array]";
}

// 优点：最可靠，能正确处理跨 iframe、Object.create(null) 等边界情况
// 缺点：写法稍长，调用方式不够直观

// ===== 方法 3：instanceof 操作符 =====

function isArray3(value) {
  return value instanceof Array;
}

// 优点：写法简洁，容易理解
// 缺点：跨 iframe / 跨 realm 时会失效（不同窗口的 Array 构造函数不同）
//       例如：iframe 中的数组 instanceof 主窗口 Array → false

// ===== 方法 4：检查构造函数 =====

function isArray4(value) {
  return value !== null && value !== undefined && value.constructor === Array;
}

// 优点：思路直观
// 缺点：
//   1. 和 instanceof 一样存在跨 iframe 问题
//   2. 如果对象的 constructor 被修改，判断会出错
//   3. Object.create(null) 创建的对象没有 constructor 属性

// ===== 方法 5：检查原型链（手写 instanceof 思路）=====

function isArray5(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  let proto = Object.getPrototypeOf(value);
  while (proto !== null) {
    if (proto === Array.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// 优点：理解原型链机制，面试加分
// 缺点：和 instanceof 本质相同，也存在跨 iframe 问题

// ===== 测试 =====

const testCases = [
  { value: [1, 2, 3], expected: true, desc: "普通数组" },
  { value: [], expected: true, desc: "空数组" },
  { value: new Array(), expected: true, desc: "new Array()" },
  { value: Array.of(1, 2), expected: true, desc: "Array.of()" },
  { value: {}, expected: false, desc: "普通对象" },
  { value: { length: 3 }, expected: false, desc: "类数组对象" },
  { value: "hello", expected: false, desc: "字符串" },
  { value: 123, expected: false, desc: "数字" },
  { value: true, expected: false, desc: "布尔值" },
  { value: null, expected: false, desc: "null" },
  { value: undefined, expected: false, desc: "undefined" },
  { value: function () {}, expected: false, desc: "函数" },
  { value: new Date(), expected: false, desc: "Date 对象" },
  { value: /regex/, expected: false, desc: "RegExp 对象" },
  { value: new Map(), expected: false, desc: "Map 对象" },
  { value: new Set(), expected: false, desc: "Set 对象" },
  { value: arguments, expected: false, desc: "arguments 对象" }, // eslint-disable-line no-undef
];

const methods = [
  { name: "Array.isArray()", fn: isArray1 },
  { name: "Object.prototype.toString", fn: isArray2 },
  { name: "instanceof", fn: isArray3 },
  { name: "constructor", fn: isArray4 },
  { name: "原型链查找", fn: isArray5 },
];

console.log("========== 判断变量是否为数组 ==========\n");

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;

  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });

  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- constructor 被篡改的边界测试 ---
console.log("--- 边界测试：constructor 被篡改 ---");
const arr = [1, 2, 3];
arr.constructor = Object; // 篡改 constructor

console.log(`isArray1 (Array.isArray):       ${isArray1(arr)}`); // true  ✅ 不受影响
console.log(`isArray2 (toString):            ${isArray2(arr)}`); // true  ✅ 不受影响
console.log(`isArray3 (instanceof):          ${isArray3(arr)}`); // true  ✅ 不受影响
console.log(`isArray4 (constructor):         ${isArray4(arr)}`); // false ✗ 被欺骗
console.log(`isArray5 (原型链查找):          ${isArray5(arr)}`); // true  ✅ 不受影响

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log(
  "推荐优先级：Array.isArray() > Object.prototype.toString > instanceof",
);
console.log("Array.isArray()  : 最简洁、最可靠，现代项目首选");
console.log("toString 方案     : 最通用，可作为 polyfill 实现");
console.log("instanceof 方案   : 简洁但有跨 iframe 陷阱");
console.log("constructor 方案  : 不推荐，constructor 可被篡改");
console.log("原型链查找方案    : 理解原理用，本质上就是 instanceof");
