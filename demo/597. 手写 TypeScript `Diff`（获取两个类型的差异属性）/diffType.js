/**
 * 手写 TypeScript `Diff`（获取两个类型的差异属性）
 *
 * 类型作用：
 *   获取两个对象类型 T 和 U 的差异属性组成的新类型——
 *   即"只属于 T 的属性"与"只属于 U 的属性"的交叉（并集）。
 *   属性同名时不属于差异。
 *
 * 实现思路：
 *   用 Omit 分别剔除对方的键，再交叉：
 *     type Diff<T, U> = Omit<T, keyof U> & Omit<U, keyof T>;
 *   - Omit<T, keyof U> 取 T 中 U 没有的键；
 *   - Omit<U, keyof T> 取 U 中 T 没有的键；
 *   - 两者交叉得到全部差异属性。
 *
 * 运行时模拟：
 *   JS 取两对象键集合的对称差（symmetric difference），
 *   据此构造一个新对象。
 */

// ===== TypeScript 类型实现 =====
// type Diff<T, U> = Omit<T, keyof U> & Omit<U, keyof T>;
//
// 示例：
//   interface A { a: 1; b: 2; c: 3 }
//   interface B { b: 2; c: 3; d: 4 }
//   type D = Diff<A, B>; // { a: 1 } & { d: 4 } => { a: 1; d: 4 }

// ===== 运行时模拟函数 =====
/**
 * 模拟 Diff：取两对象的差异属性（对称差）组成新对象
 * @param {Object} t 对象 T
 * @param {Object} u 对象 U
 * @returns {Object} 仅包含差异属性的新对象
 */
function diff(t, u) {
  if (t === null || typeof t !== "object") t = {};
  if (u === null || typeof u !== "object") u = {};
  const keysT = new Set(Object.keys(t));
  const keysU = new Set(Object.keys(u));
  const result = {};
  // 只属于 T 的键
  for (const k of keysT) {
    if (!keysU.has(k)) result[k] = t[k];
  }
  // 只属于 U 的键
  for (const k of keysU) {
    if (!keysT.has(k)) result[k] = u[k];
  }
  return result;
}

/**
 * 返回差异键的对称差集合
 * @param {Object} t
 * @param {Object} u
 * @returns {Array<string>}
 */
function diffKeys(t, u) {
  if (t === null || typeof t !== "object") t = {};
  if (u === null || typeof u !== "object") u = {};
  const keysT = new Set(Object.keys(t));
  const keysU = new Set(Object.keys(u));
  const result = [];
  for (const k of keysT) if (!keysU.has(k)) result.push(k);
  for (const k of keysU) if (!keysT.has(k)) result.push(k);
  return result;
}

/**
 * 带值来源标记的版本
 * @param {Object} t
 * @param {Object} u
 * @returns {Object}
 */
function diffWithSource(t, u) {
  if (t === null || typeof t !== "object") t = {};
  if (u === null || typeof u !== "object") u = {};
  const keysT = new Set(Object.keys(t));
  const keysU = new Set(Object.keys(u));
  const result = {};
  for (const k of keysT) {
    if (!keysU.has(k)) result[k] = { value: t[k], from: "T" };
  }
  for (const k of keysU) {
    if (!keysT.has(k)) result[k] = { value: u[k], from: "U" };
  }
  return result;
}

// ===== 测试 =====

const a = { a: 1, b: 2, c: 3 };
const b = { b: 2, c: 3, d: 4 };

console.log(diff(a, b)); // { a: 1, d: 4 }
console.log(diffKeys(a, b)); // [ 'a', 'd' ]
console.log(diffWithSource(a, b));
// { a: { value: 1, from: 'T' }, d: { value: 4, from: 'U' } }

// 无差异
console.log(diff({ a: 1 }, { a: 1 })); // {}
console.log(diffKeys({ a: 1 }, { a: 1 })); // []

// 完全不同
console.log(diff({ a: 1 }, { b: 2 })); // { a: 1, b: 2 }

// 空对象
console.log(diff({}, { a: 1 })); // { a: 1 }
console.log(diff({ a: 1 }, {})); // { a: 1 }
console.log(diff({}, {})); // {}

// 值不同但键同名不算差异（按类型语义）
console.log(diff({ a: 1 }, { a: 999 })); // {}（键同名）
console.log(diffKeys({ a: 1 }, { a: 999 })); // []

// 处理 null
console.log(diff(null, { a: 1 })); // { a: 1 }
console.log(diff({ a: 1 }, null)); // { a: 1 }

// 较多字段
const configA = { host: "h", port: 1, debug: true, retries: 3 };
const configB = { host: "h", port: 1, timeout: 100, verbose: false };
console.log(diffKeys(configA, configB)); // [ 'debug', 'retries', 'timeout', 'verbose' ]
