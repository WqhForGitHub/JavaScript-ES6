/**
 * 手写 Object.freeze
 *
 * 原生 Object.freeze 的作用：
 *   - 冻结对象：使其不可扩展、所有属性不可配置、所有数据属性不可写
 *   - 返回被冻结的对象（与传入的是同一个）
 *   - 浅冻结：嵌套对象不受影响
 *
 * 实现思路：
 *   1. Object.preventExtensions 阻止添加新属性
 *   2. 遍历所有自有属性，将 configurable 设为 false、writable 设为 false
 *   3. 返回原对象
 *
 * 注意：
 *   - accessor 属性没有 writable，只设 configurable
 *   - 浅冻结：嵌套对象仍可修改（需配合深冻结）
 */

function myObjectFreeze(obj) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return obj; // 原生对基本类型直接返回
  }

  // 1. 阻止扩展
  Object.preventExtensions(obj);

  // 2. 获取所有自有属性名（含 Symbol）
  const keys = Reflect.ownKeys(obj);

  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (!desc) continue;

    // 数据属性：设为不可写、不可配置
    if ("value" in desc) {
      // 只有当前可写时才需要 redefine（避免不必要的抛错）
      if (desc.writable || desc.configurable) {
        Object.defineProperty(obj, key, {
          ...desc,
          writable: false,
          configurable: false,
        });
      }
    } else {
      // 存取器属性：只设为不可配置
      if (desc.configurable) {
        Object.defineProperty(obj, key, {
          ...desc,
          configurable: false,
        });
      }
    }
  }

  return obj;
}

// ===== 测试 =====

const obj = { a: 1, b: 2 };
myObjectFreeze(obj);

console.log(Object.isFrozen(obj)); // true

// 不能添加新属性
obj.c = 3;
console.log(obj.c); // undefined

// 不能修改现有属性
obj.a = 100;
console.log(obj.a); // 1（仍是原值）

// 不能删除属性
delete obj.b;
console.log(obj.b); // 2

// 数组也可冻结（push 会抛 TypeError，因为它内部使用 Throw 标志）
const arr = [1, 2, 3];
myObjectFreeze(arr);
try {
  arr.push(4);
} catch (e) {
  console.log("push 抛错:", e instanceof TypeError); // true
}
console.log(arr); // [1, 2, 3]（无法修改）

// 浅冻结：嵌套对象仍可修改
const nested = { inner: { x: 1 } };
myObjectFreeze(nested);
nested.inner.x = 999;
console.log(nested.inner.x); // 999（内层未冻结）

// 返回的是同一对象
const target = { a: 1 };
const frozen = myObjectFreeze(target);
console.log(frozen === target); // true

// 不可配置属性在冻结后无法 defineProperty
try {
  Object.defineProperty(obj, "a", { enumerable: false });
} catch (e) {
  console.log("无法重新定义:", e instanceof TypeError); // true
}
