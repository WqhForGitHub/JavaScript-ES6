/**
 * 手写对象深冻结 deepFreeze
 *
 * 作用：
 *   - 递归冻结对象及其所有嵌套对象/数组
 *   - 原生 Object.freeze 是浅冻结，嵌套对象仍可修改
 *   - 深冻结后任何层级的属性都不可增删改
 *
 * 实现思路：
 *   1. 先用 Object.freeze 冻结当前对象
 *   2. 获取所有自有属性，递归冻结值为对象的属性
 *   3. 用缓存 Set 避免循环引用导致的无限递归
 *   4. 返回冻结后的对象
 *
 * 应用场景：Redux state、常量配置等需要不可变性的场景
 */

function deepFreeze(obj, seen = new WeakSet()) {
  // 非对象直接返回（基本类型天然不可变）
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 已冻结或已处理过，直接返回（避免循环引用）
  if (Object.isFrozen(obj) || seen.has(obj)) {
    return obj;
  }
  seen.add(obj);

  // 先冻结当前对象
  Object.freeze(obj);

  // 递归冻结所有自有属性的值
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    const value = obj[key];
    if (value !== null && typeof value === "object") {
      deepFreeze(value, seen);
    }
  }

  return obj;
}

// 辅助：检查对象及其嵌套是否全部冻结
function isDeepFrozen(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== "object") return true;
  if (!Object.isFrozen(obj)) return false;
  if (seen.has(obj)) return true;
  seen.add(obj);
  for (const key of Reflect.ownKeys(obj)) {
    const value = obj[key];
    if (value !== null && typeof value === "object") {
      if (!isDeepFrozen(value, seen)) return false;
    }
  }
  return true;
}

// ===== 测试 =====

const obj = {
  a: 1,
  b: {
    c: 2,
    d: {
      e: 3,
    },
  },
  arr: [1, { x: 2 }],
};

deepFreeze(obj);

console.log(isDeepFrozen(obj)); // true

// 任意层级都不可修改
obj.a = 100;
console.log(obj.a); // 1

obj.b.c = 200;
console.log(obj.b.c); // 2

obj.b.d.e = 300;
console.log(obj.b.d.e); // 3

obj.arr[0] = 999;
console.log(obj.arr[0]); // 1

obj.arr[1].x = 999;
console.log(obj.arr[1].x); // 2

// 不能添加新属性
obj.newProp = "x";
console.log(obj.newProp); // undefined

// 不能删除
delete obj.a;
console.log(obj.a); // 1

// 循环引用也能处理
const cyclic = { name: "c" };
cyclic.self = cyclic;
deepFreeze(cyclic);
console.log(isDeepFrozen(cyclic)); // true
cyclic.name = "changed";
console.log(cyclic.name); // 'c'

// 数组深冻结
const arr = [{ a: 1 }, { b: { c: 2 } }];
deepFreeze(arr);
console.log(isDeepFrozen(arr)); // true
arr[0].a = 100;
console.log(arr[0].a); // 1

// 基本类型直接返回
console.log(deepFreeze(42)); // 42
console.log(deepFreeze("str")); // 'str'
console.log(deepFreeze(null)); // null
