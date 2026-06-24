/**
 * 手写判断变量是否为 async 函数
 *
 * async 函数声明方式：
 *   - async function foo() {}
 *   - const foo = async () => {}
 *   - const foo = async function () {}
 *
 * 判定方式：
 *   1. Object.prototype.toString："[object AsyncFunction]"（最可靠）
 *   2. constructor.name === "AsyncFunction"
 *   3. instanceof AsyncFunction
 *
 * 实现思路：
 *   - 必须是 function 类型
 *   - 用 Object.prototype.toString 检查内部 [Symbol.toStringTag]
 */

// 获取 AsyncFunction 构造函数（用于 instanceof 兜底）
const AsyncFunction = (function () {
  try {
    return Object.getPrototypeOf(async function () {}).constructor;
  } catch (e) {
    return null;
  }
})();

function isAsyncFunction(value) {
  // 1. 必须是函数
  if (typeof value !== "function") {
    return false;
  }

  // 2. 方式一：Object.prototype.toString（最可靠）
  const tag = Object.prototype.toString.call(value);
  if (tag === "[object AsyncFunction]") {
    return true;
  }

  // 3. 方式二：constructor.name
  if (value.constructor && value.constructor.name === "AsyncFunction") {
    return true;
  }

  // 4. 方式三：instanceof AsyncFunction（兜底）
  if (AsyncFunction && value instanceof AsyncFunction) {
    return true;
  }

  return false;
}

// ===== 测试 =====

// --- async 函数 ---
async function asyncDecl() {
  return 1;
}
const asyncExpr = async function () {
  return 2;
};
const asyncArrow = async () => 3;
console.log(isAsyncFunction(asyncDecl)); // true
console.log(isAsyncFunction(asyncExpr)); // true
console.log(isAsyncFunction(asyncArrow)); // true

// --- async 函数的返回值（是 Promise，不是函数本身）---
console.log(isAsyncFunction(asyncDecl())); // false

// --- 普通函数 ---
console.log(isAsyncFunction(function () {})); // false
console.log(isAsyncFunction(() => {})); // false

// --- Generator 函数 ---
function* gen() {
  yield 1;
}
console.log(isAsyncFunction(gen)); // false

// --- async generator 函数（async function*）---
async function* asyncGen() {
  yield 1;
}
console.log(isAsyncFunction(asyncGen)); // false（这是 AsyncGeneratorFunction）

// --- 类 ---
console.log(isAsyncFunction(class A {})); // false

// --- 非函数 ---
console.log(isAsyncFunction(null)); // false
console.log(isAsyncFunction(undefined)); // false
console.log(isAsyncFunction(123)); // false
console.log(isAsyncFunction("hello")); // false
console.log(isAsyncFunction({})); // false
console.log(isAsyncFunction(Promise.resolve())); // false
