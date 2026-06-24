/**
 * 手写判断变量是否为 Generator 函数
 *
 * Generator 函数声明方式：
 *   - function* gen() {}
 *   - function * gen() {}
 *
 * 判定方式：
 *   1. 构造函数名：value.constructor.name === "GeneratorFunction"
 *   2. Object.prototype.toString："[object GeneratorFunction]"
 *   3. 函数字符串特征（不推荐，但可作兜底）
 *
 * 注意：原生环境没有全局 GeneratorFunction 构造函数（需通过 Object.getPrototypeOf(function*(){}) 获取）
 *
 * 实现思路：
 *   - 必须是 function 类型
 *   - 用 Object.prototype.toString 检查内部 [Symbol.toStringTag]
 */

// 获取 GeneratorFunction 构造函数（用于 instanceof 判断）
const GeneratorFunction = (function () {
  try {
    return Object.getPrototypeOf(function* () {}).constructor;
  } catch (e) {
    return null;
  }
})();

function isGeneratorFunction(value) {
  // 1. 必须是函数
  if (typeof value !== "function") {
    return false;
  }

  // 2. 方式一：Object.prototype.toString（最可靠，依赖引擎的 [Symbol.toStringTag]）
  const tag = Object.prototype.toString.call(value);
  if (tag === "[object GeneratorFunction]") {
    return true;
  }

  // 3. 方式二：constructor.name（部分环境可能被改写）
  if (value.constructor && value.constructor.name === "GeneratorFunction") {
    return true;
  }

  // 4. 方式三：instanceof GeneratorFunction（兜底）
  if (GeneratorFunction && value instanceof GeneratorFunction) {
    return true;
  }

  return false;
}

// ===== 测试 =====

// --- Generator 函数 ---
function* genFunc() {
  yield 1;
  yield 2;
}
const genExpr = function* () {
  yield 3;
};
console.log(isGeneratorFunction(genFunc)); // true
console.log(isGeneratorFunction(genExpr)); // true

// --- Generator 实例（不是函数本身）---
console.log(isGeneratorFunction(genFunc())); // false（这是 generator 实例，不是函数）

// --- 普通函数 ---
console.log(isGeneratorFunction(function () {})); // false
console.log(isGeneratorFunction(() => {})); // false

// --- async 函数 ---
console.log(isGeneratorFunction(async function () {})); // false

// --- async generator 函数（async function*）---
async function* asyncGenFunc() {
  yield 1;
}
console.log(isGeneratorFunction(asyncGenFunc)); // false（这是 AsyncGeneratorFunction）

// --- 类（class 是函数）---
console.log(isGeneratorFunction(class A {})); // false

// --- 非函数 ---
console.log(isGeneratorFunction(null)); // false
console.log(isGeneratorFunction(undefined)); // false
console.log(isGeneratorFunction(123)); // false
console.log(isGeneratorFunction({})); // false
console.log(isGeneratorFunction("function* () {}")); // false
