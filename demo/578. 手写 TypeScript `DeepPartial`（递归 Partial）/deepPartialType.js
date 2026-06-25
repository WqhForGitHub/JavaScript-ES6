/**
 * 手写 TypeScript `DeepPartial`（递归 Partial）
 *
 * 类型作用：
 *   将类型 T 及其所有嵌套对象的属性都变为可选。
 *   是 Partial 的递归版本，适用于深层嵌套的配置/更新场景。
 *
 * 实现思路：
 *   使用 mapped type 遍历 keyof T，对值为对象的属性递归应用 DeepPartial：
 *     type DeepPartial<T> = {
 *       [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
 *     };
 *   注意：对函数、数组等也需考虑是否要继续递归（此处按对象统一递归）。
 *
 * 运行时模拟：
 *   JS 通过递归浅拷贝对象，每一层都允许缺失，模拟"全可选"语义。
 */

// ===== TypeScript 类型实现 =====
// type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
// };
//
// 示例：
//   interface Config { server: { host: string; port: number }; debug: boolean }
//   type PartialConfig = DeepPartial<Config>;
//   // 等价于 { server?: { host?: string; port?: number }; debug?: boolean }

// ===== 运行时模拟函数 =====
/**
 * 模拟 DeepPartial：递归返回深拷贝，允许任意层级缺失
 * @param {any} source 源对象
 * @returns {any} 深拷贝对象
 */
function deepPartial(source) {
  if (source === null || typeof source !== "object") {
    return source;
  }
  if (Array.isArray(source)) {
    return source.map(deepPartial);
  }
  const result = {};
  for (const key of Object.keys(source)) {
    result[key] = deepPartial(source[key]);
  }
  return result;
}

/**
 * 模拟 DeepPartial 的"合并"语义：将深层的部分更新合并到目标对象
 * @param {Object} target 目标对象
 * @param {Object} patch 深层部分更新
 * @returns {Object} 合并后的新对象
 */
function deepMergePartial(target, patch) {
  if (patch === null || typeof patch !== "object") {
    return patch;
  }
  if (Array.isArray(patch)) {
    return patch.map((v, i) =>
      i < target.length && typeof v === "object" && v !== null
        ? deepMergePartial(target[i], v)
        : v,
    );
  }
  const result = { ...target };
  for (const key of Object.keys(patch)) {
    if (
      typeof patch[key] === "object" &&
      patch[key] !== null &&
      typeof target[key] === "object" &&
      target[key] !== null
    ) {
      result[key] = deepMergePartial(target[key], patch[key]);
    } else {
      result[key] = patch[key];
    }
  }
  return result;
}

// ===== 测试 =====

const config = {
  server: { host: "localhost", port: 8080 },
  debug: true,
  options: { retries: 3, timeout: 5000 },
};

// 深层部分更新：只改 port，其余保留
const updated1 = deepMergePartial(config, { server: { port: 9090 } });
console.log(updated1);
// { server: { host: 'localhost', port: 9090 }, debug: true, options: { retries: 3, timeout: 5000 } }

// 深层部分更新：改多层
const updated2 = deepMergePartial(config, {
  server: { host: "0.0.0.0" },
  options: { timeout: 1000 },
});
console.log(updated2);
// { server: { host: '0.0.0.0', port: 8080 }, debug: true, options: { retries: 3, timeout: 1000 } }

// 深拷贝（互不影响）
const copy = deepPartial(config);
copy.server.port = 9999;
console.log(config.server.port); // 8080（原对象未受影响）
console.log(copy.server.port); // 9999

// 数组深层合并
const arrTarget = [{ a: 1 }, { b: 2 }];
const arrPatch = [{ a: 10 }];
console.log(deepMergePartial(arrTarget, arrPatch)); // [ { a: 10 }, { b: 2 } ]

// 原始值直接返回
console.log(deepPartial(42)); // 42
console.log(deepPartial("hello")); // 'hello'
console.log(deepPartial(null)); // null
