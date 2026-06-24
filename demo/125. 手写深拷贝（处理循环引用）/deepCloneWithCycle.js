/**
 * 手写深拷贝（处理循环引用）
 *
 * 作用：
 *   - 深拷贝对象/数组，递归复制所有层级
 *   - 处理循环引用，避免无限递归栈溢出
 *
 * 实现思路：
 *   1. 用一个 Map（或 WeakMap）缓存已拷贝过的对象：源对象 -> 拷贝对象
 *   2. 递归前先查缓存，若已拷贝过直接返回缓存的拷贝
 *   3. 处理对象和数组两种引用类型，基本类型直接返回
 *
 * 本版本处理范围：
 *   - 普通对象、数组（递归深拷贝）
 *   - 基本类型、null、undefined、function（直接返回）
 *   - 循环引用、共享引用（保持引用关系）
 *   - Date、RegExp 等特殊类型在下一个 demo 完整处理
 */

function deepCloneWithCycle(obj, cache = new Map()) {
  // 1. 基本类型、null、undefined、function 直接返回
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 2. 查缓存：若已拷贝过，返回缓存（处理循环引用 & 共享引用）
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  // 3. 根据类型创建空容器
  const clone = Array.isArray(obj) ? [] : {};

  // 4. 先存入缓存（必须在递归之前，否则循环引用时还未存入会再次递归）
  cache.set(obj, clone);

  // 5. 递归拷贝每个属性
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    clone[key] = deepCloneWithCycle(obj[key], cache);
  }

  return clone;
}

// ===== 测试 =====

// 基本深拷贝
const original = { a: 1, b: { c: 2 }, arr: [1, { x: 3 }] };
const copy = deepCloneWithCycle(original);
console.log(copy); // { a: 1, b: { c: 2 }, arr: [1, { x: 3 }] }
console.log(copy === original); // false
console.log(copy.b === original.b); // false（深拷贝，引用不同）
console.log(copy.arr[1] === original.arr[1]); // false

// 循环引用：对象引用自身
const cyclic = { name: "cycle" };
cyclic.self = cyclic;
const cyclicCopy = deepCloneWithCycle(cyclic);
console.log(cyclicCopy.name); // 'cycle'
console.log(cyclicCopy.self === cyclicCopy); // true（循环引用保持）
console.log(cyclicCopy === cyclic); // false

// 相互引用
const a = { name: "a" };
const b = { name: "b" };
a.partner = b;
b.partner = a;
const aCopy = deepCloneWithCycle(a);
console.log(aCopy.partner.name); // 'b'
console.log(aCopy.partner.partner === aCopy); // true（相互引用保持）

// 共享引用：同一对象被多处引用，拷贝后仍共享同一拷贝
const shared = { val: 10 };
const container = { x: shared, y: shared };
const containerCopy = deepCloneWithCycle(container);
console.log(containerCopy.x === containerCopy.y); // true（共享同一拷贝）

// 数组循环引用
const arr = [1, 2];
arr.push(arr);
const arrCopy = deepCloneWithCycle(arr);
console.log(arrCopy[0]); // 1
console.log(arrCopy[2] === arrCopy); // true

// 基本类型与函数
console.log(deepCloneWithCycle(42)); // 42
console.log(deepCloneWithCycle("str")); // 'str'
const fn = () => 1;
console.log(deepCloneWithCycle(fn) === fn); // true（函数直接返回）
