/**
 * 手写 Object.isExtensible
 *
 * 原生 Object.isExtensible 的作用：
 *   - 判断对象是否可扩展（能否添加新属性）
 *   - freeze/seal/preventExtensions 都会使对象不可扩展
 *
 * 实现思路：
 *   纯 JS 无法直接读取 [[Extensible]] 内部槽位，
 *   可用一个"试探性添加属性再回滚"的探测法：
 *   1. 生成一个唯一 key（用 Symbol 避免覆盖已有属性）
 *   2. 尝试给对象添加该属性
 *   3. 严格模式下，不可扩展对象会抛 TypeError；可扩展则成功
 *   4. 添加成功后删除该属性并恢复
 *
 * 注意：此探测法是只读的（添加后立即删除），但仍有副作用风险，
 *       严格模式下不可扩展对象抛错需 try/catch。
 */

function myIsExtensible(obj) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return false; // 原生对基本类型返回 false
  }

  // 用一个唯一 Symbol 作为测试 key，避免与已有属性冲突
  const testKey = Symbol("__isExtensible_test__");

  try {
    // 在严格模式下尝试添加属性
    "use strict";
    obj[testKey] = 1;
    // 成功说明可扩展，删除测试属性并返回 true
    delete obj[testKey];
    return true;
  } catch (e) {
    // 不可扩展会抛 TypeError
    return false;
  }
}

// ===== 测试 =====

const obj = { a: 1 };
console.log(myIsExtensible(obj)); // true

Object.preventExtensions(obj);
console.log(myIsExtensible(obj)); // false

const sealed = { b: 2 };
Object.seal(sealed);
console.log(myIsExtensible(sealed)); // false

const frozen = { c: 3 };
Object.freeze(frozen);
console.log(myIsExtensible(frozen)); // false

// 普通对象、数组、函数默认可扩展
console.log(myIsExtensible([])); // true
console.log(myIsExtensible(function () {})); // true
console.log(myIsExtensible({})); // true

// 基本类型返回 false
console.log(myIsExtensible(123)); // false
console.log(myIsExtensible("str")); // false
console.log(myIsExtensible(null)); // false
console.log(myIsExtensible(undefined)); // false

// 探测后不应残留测试属性
const clean = { x: 1 };
myIsExtensible(clean);
console.log(Object.keys(clean)); // ['x']（无残留）
console.log(Object.getOwnPropertySymbols(clean)); // []（Symbol 已删除）
