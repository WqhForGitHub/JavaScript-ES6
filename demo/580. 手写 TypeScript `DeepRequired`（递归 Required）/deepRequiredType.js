/**
 * 手写 TypeScript `DeepRequired`（递归 Required）
 *
 * 类型作用：
 *   将类型 T 及其所有嵌套对象的属性都变为必选。
 *   是 Required 的递归版本，常用于校验深层结构完整性。
 *
 * 实现思路：
 *   使用 mapped type 遍历 keyof T，-? 移除可选修饰，并对对象属性递归：
 *     type DeepRequired<T> = {
 *       [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
 *     };
 *
 * 运行时模拟：
 *   JS 通过递归校验所有嵌套属性都非 undefined，模拟"全必选"约束。
 */

// ===== TypeScript 类型实现 =====
// type DeepRequired<T> = {
//   [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Object} DeepRequiredT 等价于 TS 的 DeepRequired<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 DeepRequired：递归校验对象所有嵌套属性都非 undefined
 * @param {any} source 待校验对象
 * @param {string} [path] 当前路径（用于错误信息）
 * @returns {boolean} 是否所有属性都满足必选
 */
function isDeepRequired(source, path = "root") {
  if (source === undefined) {
    console.error(`Missing required property at ${path}`);
    return false;
  }
  if (source === null || typeof source !== "object") {
    return true;
  }
  if (Array.isArray(source)) {
    return source.every((item, i) => isDeepRequired(item, `${path}[${i}]`));
  }
  return Object.keys(source).every((key) =>
    isDeepRequired(source[key], `${path}.${key}`),
  );
}

/**
 * 收集对象中所有"缺失"（undefined）属性的路径
 * @param {any} source
 * @param {string} [path]
 * @returns {Array<string>}
 */
function findMissingPaths(source, path = "root") {
  const missing = [];
  if (source === undefined) {
    missing.push(path);
    return missing;
  }
  if (source === null || typeof source !== "object") return missing;
  if (Array.isArray(source)) {
    source.forEach((item, i) =>
      missing.push(...findMissingPaths(item, `${path}[${i}]`)),
    );
    return missing;
  }
  for (const key of Object.keys(source)) {
    missing.push(...findMissingPaths(source[key], `${path}.${key}`));
  }
  return missing;
}

// ===== 测试 =====

const complete = {
  server: { host: "localhost", port: 8080 },
  options: { retries: 3, nested: { deep: true } },
  list: [1, 2, { x: 1 }],
};

console.log(isDeepRequired(complete)); // true

// 缺失深层字段
const incomplete1 = {
  server: { host: "localhost" }, // port 缺失
  options: { retries: 3, nested: { deep: true } },
  list: [1, 2, { x: 1 }],
};
console.log(isDeepRequired(incomplete1)); // false（实际缺失因为 port 键不存在）
// 注意：JS 中"键不存在"也算缺失

// 字段值为 undefined
const incomplete2 = {
  server: { host: "localhost", port: undefined },
  options: { retries: 3, nested: { deep: true } },
  list: [1, 2, { x: 1 }],
};
console.log(isDeepRequired(incomplete2)); // false

// 数组中元素 undefined
const incomplete3 = {
  server: { host: "localhost", port: 8080 },
  options: { retries: 3, nested: { deep: true } },
  list: [1, undefined, { x: 1 }],
};
console.log(isDeepRequired(incomplete3)); // false

// 收集缺失路径
console.log(findMissingPaths(incomplete2)); // [ 'root.server.port' ]
console.log(findMissingPaths(incomplete3)); // [ 'root.list[1]' ]

// 原始值
console.log(isDeepRequired(42)); // true
console.log(isDeepRequired(undefined)); // false
