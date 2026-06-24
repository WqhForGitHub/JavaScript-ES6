/**
 * 手写 Object.seal
 *
 * 原生 Object.seal 的作用：
 *   - 密封对象：使其不可扩展，且所有自有属性不可配置
 *   - 与 freeze 的区别：seal 允许修改属性值（只要原本 writable）
 *   - 返回密封后的对象（同一引用）
 *
 * 实现思路：
 *   1. Object.preventExtensions 阻止添加新属性
 *   2. 遍历所有自有属性，将 configurable 设为 false
 *   3. 不修改 writable（保持原值，所以仍可修改属性值）
 *   4. 返回原对象
 */

function myObjectSeal(obj) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return obj;
  }

  // 1. 阻止扩展
  Object.preventExtensions(obj);

  // 2. 所有自有属性设为不可配置
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc && desc.configurable) {
      Object.defineProperty(obj, key, {
        ...desc,
        configurable: false,
      });
    }
  }

  return obj;
}

// ===== 测试 =====

const obj = { a: 1, b: 2 };
myObjectSeal(obj);

console.log(Object.isSealed(obj)); // true

// 不能添加新属性
obj.c = 3;
console.log(obj.c); // undefined

// 不能删除属性
delete obj.a;
console.log(obj.a); // 1

// 可以修改属性值（区别于 freeze）
obj.a = 100;
console.log(obj.a); // 100

// 数组密封：不能增删元素，但可改值（push 会抛 TypeError）
const arr = [1, 2, 3];
myObjectSeal(arr);
arr[0] = 999;
console.log(arr[0]); // 999
try {
  arr.push(4);
} catch (e) {
  console.log("push 抛错:", e instanceof TypeError); // true
}
console.log(arr.length); // 3

// 密封 vs 冻结（用原生 Object.freeze 对比）
const sealed = { x: 1 };
const frozen = { x: 1 };
myObjectSeal(sealed);
Object.freeze(frozen);
sealed.x = 2;
console.log(sealed.x); // 2（可改）
frozen.x = 2;
console.log(frozen.x); // 1（不可改）

// 返回同一对象
const target = { a: 1 };
const sealedTarget = myObjectSeal(target);
console.log(sealedTarget === target); // true
