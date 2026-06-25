/**
 * 手写 TypeScript `ReturnType` 类型
 *
 * 类型作用：
 *   获取函数类型 T 的返回值类型。
 *   常用于根据已有函数推断返回值类型而无需手动声明。
 *
 * 实现思路：
 *   使用条件类型 + infer 推断返回值类型 R：
 *     type ReturnType<T extends (...args: any) => any> =
 *       T extends (...args: any) => infer R ? R : never;
 *   infer R 在条件类型的 extends 子句中"占位"待推断的类型。
 *
 * 运行时模拟：
 *   JS 通过执行函数（或不执行）拿到返回值的运行时构造函数名，
 *   模拟 TS 编译期对返回类型的推断。
 */

// ===== TypeScript 类型实现 =====
// type ReturnType<T extends (...args: any) => any> =
//   T extends (...args: any) => infer R ? R : never;
//
// 示例：
//   const fn = () => 1;
//   type R = ReturnType<typeof fn>; // number

// ===== JSDoc 等价类型表示 =====
/**
 * @template {Function} T
 * @typedef {ReturnType<T>} ReturnT 等价于 TS 的 ReturnType<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 ReturnType：返回函数返回值在运行时的类型名（小写）
 * @param {Function} fn 目标函数
 * @param {Array<any>} [args] 调用参数（可选，默认空数组）
 * @returns {string} 返回值的类型字符串
 */
function returnType(fn, args = []) {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }
  const value = fn(...args);
  if (value === null) return "null";
  if (typeof value === "function") return "function";
  const match = Object.prototype.toString
    .call(value)
    .match(/^\[object (\w+)\]$/);
  return match ? match[1].toLowerCase() : "object";
}

/**
 * 静态分析：通过正则解析函数体里第一个 return 表达式，做粗略推断
 * 注意：仅用于演示，无法覆盖所有场景
 * @param {Function} fn
 * @returns {string} 粗略返回类型
 */
function inferReturnTypeStatically(fn) {
  const src = fn.toString();
  const m = src.match(/return\s+([^;]+);/);
  if (!m) return "void";
  const expr = m[1].trim();
  if (expr === "null") return "null";
  if (expr === "undefined") return "undefined";
  if (/^(true|false)$/.test(expr)) return "boolean";
  if (/^-?\d+(\.\d+)?$/.test(expr)) return "number";
  if (/^['"`]/.test(expr)) return "string";
  if (/^\[/.test(expr)) return "array";
  if (/^\{/.test(expr)) return "object";
  return "unknown";
}

// ===== 测试 =====

const numFn = () => 1;
const strFn = () => "hello";
const objFn = () => ({ a: 1 });
const arrFn = () => [1, 2, 3];
const nullFn = () => null;
const dateFn = () => new Date();

console.log(returnType(numFn)); // number
console.log(returnType(strFn)); // string
console.log(returnType(objFn)); // object
console.log(returnType(arrFn)); // array
console.log(returnType(nullFn)); // null
console.log(returnType(dateFn)); // date

// 带参函数
const addFn = (a, b) => a + b;
console.log(returnType(addFn, [1, 2])); // number

// 静态推断
console.log(inferReturnTypeStatically(() => 42)); // number
console.log(inferReturnTypeStatically(() => "ok")); // string
console.log(inferReturnTypeStatically(() => true)); // boolean
console.log(inferReturnTypeStatically(() => null)); // null
console.log(inferReturnTypeStatically(() => [1, 2])); // array

// 非函数抛错
try {
  returnType(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a function
}
