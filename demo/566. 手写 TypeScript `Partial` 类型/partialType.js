/**
 * 手写 TypeScript `Partial` 类型
 *
 * 类型作用：
 *   将类型 T 的所有属性变为可选（添加 ? 修饰符）。
 *   常用于更新操作、函数参数放宽等场景。
 *
 * 实现思路：
 *   使用 mapped type 遍历 keyof T，给每个属性加上 ? 修饰符：
 *     [P in keyof T]?: T[P]
 *
 * 运行时模拟：
 *   JS 没有静态类型，这里通过函数返回一份浅拷贝来表达"可选"语义——
 *   即允许传入部分字段，缺失字段不会报错。
 */

// ===== TypeScript 类型实现 =====
// type Partial<T> = {
//   [P in keyof T]?: T[P];
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Object} PartialT 等价于 TS 的 Partial<T>
 * @property {Partial<T[keyof T]>} [key] 所有属性都变为可选
 */

// ===== 运行时模拟函数 =====
/**
 * 将一个对象包装为"部分对象"——返回浅拷贝，允许只传入部分字段
 * @param {Record<string, any>} source 源对象
 * @returns {Record<string, any>} 拷贝后的对象
 */
function partial(source) {
  if (source === null || typeof source !== "object") {
    return {};
  }
  return { ...source };
}

/**
 * 模拟 Partial 的应用：合并部分更新到目标对象
 * @param {Object} target 目标对象
 * @param {Object} patch 部分更新
 * @returns {Object} 合并后的新对象
 */
function applyPartial(target, patch) {
  return { ...target, ...patch };
}

// ===== 测试 =====

const user = { name: "Alice", age: 18, email: "a@b.com" };

// 只更新部分字段（Partial 语义）
const updated = applyPartial(user, { age: 19 });
console.log(updated); // { name: 'Alice', age: 19, email: 'a@b.com' }

// 空更新也合法
const empty = applyPartial(user, {});
console.log(empty); // { name: 'Alice', age: 18, email: 'a@b.com' }

// 全部更新
const all = applyPartial(user, { name: "Bob", age: 20, email: "c@d.com" });
console.log(all); // { name: 'Bob', age: 20, email: 'c@d.com' }

// partial 本身返回浅拷贝
console.log(partial(user)); // { name: 'Alice', age: 18, email: 'a@b.com' }
console.log(partial(null)); // {}
