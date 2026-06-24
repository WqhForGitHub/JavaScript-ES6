/**
 * 手写浅拷贝函数（Shallow Clone）
 *
 * 浅拷贝：
 *   - 创建一个新对象/数组，复制第一层属性
 *   - 嵌套的引用类型属性仍与原对象共享同一引用
 *
 * 常见实现方式：
 *   - Object.assign({}, source)
 *   - 展开运算符 { ...source }
 *   - Array.prototype.slice() / concat() / from()
 *
 * 这里手写一个通用版本，同时支持对象和数组，
 * 并通过 Object.getOwnPropertyDescriptors 保留属性描述符。
 */

function shallowClone(source) {
  // 1. 基本类型、null、undefined 直接返回
  if (source === null || typeof source !== "object") {
    return source;
  }

  // 2. 数组：用 slice 创建新数组（仅复制一层）
  if (Array.isArray(source)) {
    return source.slice();
  }

  // 3. Date / RegExp 等内置对象，用构造函数重建
  if (source instanceof Date) {
    return new Date(source.getTime());
  }
  if (source instanceof RegExp) {
    return new RegExp(source.source, source.flags);
  }

  // 4. 普通对象：合并到空对象，仅复制一层
  const cloned = Object.create(Object.getPrototypeOf(source));
  // 使用 getOwnPropertyDescriptors 保留属性描述符（writable/enumerable/configurable）
  Object.defineProperties(cloned, Object.getOwnPropertyDescriptors(source));
  return cloned;
}

// ===== 测试 =====

// --- 基本类型 ---
console.log(shallowClone(42)); // 42
console.log(shallowClone("hello")); // "hello"
console.log(shallowClone(null)); // null

// --- 普通对象 ---
const obj = { a: 1, b: { c: 2 } };
const clonedObj = shallowClone(obj);
console.log(clonedObj); // { a: 1, b: { c: 2 } }
console.log(clonedObj === obj); // false（外层是新对象）
console.log(clonedObj.b === obj.b); // true（内层仍共享引用 —— 浅拷贝特征）

// --- 修改内层属性会互相影响 ---
clonedObj.b.c = 999;
console.log(obj.b.c); // 999（证明是浅拷贝）

// --- 数组 ---
const arr = [1, [2, 3], { x: 4 }];
const clonedArr = shallowClone(arr);
console.log(clonedArr); // [ 1, [ 2, 3 ], { x: 4 } ]
console.log(clonedArr === arr); // false
console.log(clonedArr[1] === arr[1]); // true（内层数组共享引用）
console.log(clonedArr instanceof Array); // true

// --- Date ---
const date = new Date("2024-06-01");
const clonedDate = shallowClone(date);
console.log(clonedDate.getTime() === date.getTime()); // true
console.log(clonedDate === date); // false

// --- RegExp ---
const reg = /abc/gi;
const clonedReg = shallowClone(reg);
console.log(clonedReg.source === reg.source); // true
console.log(clonedReg === reg); // false

// --- 属性描述符保留 ---
const withDescriptor = {};
Object.defineProperty(withDescriptor, "frozen", {
  value: 1,
  writable: false,
  enumerable: true,
});
const clonedDescriptor = shallowClone(withDescriptor);
console.log(Object.getOwnPropertyDescriptor(clonedDescriptor, "frozen"));
// { value: 1, writable: false, enumerable: true, configurable: false }

// --- 原型链保留 ---
class Animal {
  speak() {
    return "sound";
  }
}
const animal = new Animal();
const clonedAnimal = shallowClone(animal);
console.log(clonedAnimal.speak()); // "sound"（原型链保留）
console.log(Object.getPrototypeOf(clonedAnimal) === Animal.prototype); // true
