/**
 * 手写 TypeScript `Readonly` 类型
 *
 * 类型作用：
 *   将类型 T 的所有属性变为只读（添加 readonly 修饰符），
 *   使其不可在编译期被重新赋值。
 *
 * 实现思路：
 *   使用 mapped type 遍历 keyof T，给每个属性加上 readonly 修饰符：
 *     readonly [P in keyof T]: T[P]
 *
 * 运行时模拟：
 *   JS 通过 Object.freeze 实现真正的运行时只读——
 *   冻结后任何修改操作都会静默失败（严格模式下抛错）。
 */

// ===== TypeScript 类型实现 =====
// type Readonly<T> = {
//   readonly [P in keyof T]: T[P];
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Readonly<T>} ReadonlyT 等价于 TS 的 Readonly<T>
 * 所有属性只读
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Readonly：返回一个被冻结（深冻结浅层）的对象
 * @param {Object} source 源对象
 * @returns {Object} 冻结后的只读对象
 */
function readonly(source) {
  if (source === null || typeof source !== "object") {
    return source;
  }
  return Object.freeze({ ...source });
}

/**
 * 判断一个对象是否被冻结（只读）
 * @param {Object} obj
 * @returns {boolean}
 */
function isReadonly(obj) {
  return Object.isFrozen(obj);
}

// ===== 测试 =====

const user = { name: "Alice", age: 18 };

const frozenUser = readonly(user);
console.log(frozenUser); // { name: 'Alice', age: 18 }
console.log(isReadonly(frozenUser)); // true
console.log(isReadonly(user)); // false（原对象未被冻结）

// 尝试修改只读对象（严格模式下会抛 TypeError）
("use strict");
try {
  frozenUser.age = 20;
} catch (e) {
  console.log("catch:", e.message); // Cannot assign to read only property 'age'
}
console.log(frozenUser.age); // 18（未被修改）

// 原对象仍可修改
user.age = 30;
console.log(user.age); // 30
