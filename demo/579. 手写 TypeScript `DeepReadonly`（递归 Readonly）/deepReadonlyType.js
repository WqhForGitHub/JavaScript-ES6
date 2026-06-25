/**
 * 手写 TypeScript `DeepReadonly`（递归 Readonly）
 *
 * 类型作用：
 *   将类型 T 及其所有嵌套对象的属性都变为只读。
 *   是 Readonly 的递归版本，常用于不可变配置、状态冻结。
 *
 * 实现思路：
 *   使用 mapped type 遍历 keyof T，对值为对象的属性递归应用 DeepReadonly：
 *     type DeepReadonly<T> = {
 *       readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
 *     };
 *
 * 运行时模拟：
 *   JS 通过递归 Object.freeze 实现真正的运行时深只读。
 */

// ===== TypeScript 类型实现 =====
// type DeepReadonly<T> = {
//   readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Object} DeepReadonlyT 等价于 TS 的 DeepReadonly<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 DeepReadonly：递归冻结对象的所有层
 * @param {any} source 源对象
 * @returns {any} 深冻结后的只读对象
 */
function deepReadonly(source) {
  if (source === null || typeof source !== "object") {
    return source;
  }
  // 先递归冻结子对象
  if (Array.isArray(source)) {
    source.forEach(deepReadonly);
  } else {
    Object.keys(source).forEach((key) => deepReadonly(source[key]));
  }
  return Object.freeze(source);
}

/**
 * 判断对象是否被深冻结
 * @param {any} obj
 * @returns {boolean}
 */
function isDeepFrozen(obj) {
  if (obj === null || typeof obj !== "object") return true;
  if (!Object.isFrozen(obj)) return false;
  const keys = Array.isArray(obj) ? obj.map((_, i) => i) : Object.keys(obj);
  return keys.every((k) => isDeepFrozen(obj[k]));
}

// ===== 测试 =====

const config = {
  server: { host: "localhost", port: 8080 },
  options: { retries: 3, nested: { deep: true } },
  list: [1, 2, { x: 1 }],
};

const frozen = deepReadonly(config);
console.log(frozen);
// { server: { host: 'localhost', port: 8080 }, options: { retries: 3, nested: { deep: true } }, list: [ 1, 2, { x: 1 } ] }

// 深冻结检查
console.log(isDeepFrozen(frozen)); // true
console.log(isDeepFrozen(config)); // true（原对象被就地冻结）
console.log(Object.isFrozen(frozen.server)); // true
console.log(Object.isFrozen(frozen.options.nested)); // true
console.log(Object.isFrozen(frozen.list)); // true
console.log(Object.isFrozen(frozen.list[2])); // true

// 尝试修改深层属性会抛错（严格模式）
("use strict");
try {
  frozen.server.port = 9090;
} catch (e) {
  console.log("catch:", e.message); // Cannot assign to read only property 'port'
}
try {
  frozen.list.push(3);
} catch (e) {
  console.log("catch:", e.message); // object is not extensible
}
console.log(frozen.server.port); // 8080
console.log(frozen.list.length); // 3

// 原始值直接返回
console.log(deepReadonly(42)); // 42
console.log(deepReadonly(null)); // null
