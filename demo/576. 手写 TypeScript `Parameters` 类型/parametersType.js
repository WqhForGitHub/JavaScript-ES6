/**
 * 手写 TypeScript `Parameters` 类型
 *
 * 类型作用：
 *   获取函数类型 T 的参数类型，以元组形式返回。
 *   常用于包装器、装饰器需要透传原函数参数的场景。
 *
 * 实现思路：
 *   使用条件类型 + infer 推断参数元组 P：
 *     type Parameters<T extends (...args: any) => any> =
 *       T extends (...args: infer P) => any ? P : never;
 *
 * 运行时模拟：
 *   JS 通过 Function.prototype.toString 解析形参名，
 *   或通过 Function.length 获取必选形参个数。
 */

// ===== TypeScript 类型实现 =====
// type Parameters<T extends (...args: any) => any> =
//   T extends (...args: infer P) => any ? P : never;
//
// 示例：
//   const fn = (a: number, b: string) => true;
//   type P = Parameters<typeof fn>; // [number, string]

// ===== JSDoc 等价类型表示 =====
/**
 * @template {Function} T
 * @typedef {Parameters<T>} ParamsT 等价于 TS 的 Parameters<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Parameters：解析函数形参名列表
 * 注意：JS 无法在运行时拿到形参的静态类型，只能拿到形参名。
 * @param {Function} fn
 * @returns {Array<string>} 形参名数组
 */
function parameters(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }
  const src = fn.toString();
  // 去除注释，避免注释中的括号干扰
  const cleaned = src.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
  const match = cleaned.match(
    /(?:async\s+)?function\s*[\w$]*\s*\(([^)]*)\)|(?:async\s+)?\(([^)]*)\)\s*=>|(\w+)\s*=>/,
  );
  let paramsStr = "";
  if (match) {
    paramsStr = match[1] ?? match[2] ?? (match[3] ? match[3] : "");
  }
  if (!paramsStr.trim()) return [];
  // 拆分形参，并去除默认值、类型注解（TS 残留）、解构等
  return paramsStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      p
        .split("=")[0]
        .trim()
        .replace(/^\.\.\./, "")
        .replace(/[{}[\]]/g, "")
        .trim(),
    )
    .filter(Boolean);
}

/**
 * 获取函数必选形参个数（与 Function.length 一致）
 * @param {Function} fn
 * @returns {number}
 */
function paramLength(fn) {
  return typeof fn === "function" ? fn.length : 0;
}

// ===== 测试 =====

const fn1 = function (a, b, c) {
  return a;
};
const fn2 = (a, b) => a + b;
const fn3 = (a = 1, b = 2) => a + b;
const fn4 = () => 42;
const fn5 = function (...rest) {
  return rest;
};
const fn6 = (a, b = 2, ...rest) => a;

console.log(parameters(fn1)); // [ 'a', 'b', 'c' ]
console.log(parameters(fn2)); // [ 'a', 'b' ]
console.log(parameters(fn3)); // [ 'a', 'b' ]
console.log(parameters(fn4)); // []
console.log(parameters(fn5)); // [ 'rest' ]
console.log(parameters(fn6)); // [ 'a', 'b', 'rest' ]

console.log(paramLength(fn1)); // 3
console.log(paramLength(fn3)); // 1（有默认值的不计入 length）
console.log(paramLength(fn4)); // 0
console.log(paramLength(fn5)); // 0（剩余参数不计入 length）

// 非函数抛错
try {
  parameters(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a function
}
