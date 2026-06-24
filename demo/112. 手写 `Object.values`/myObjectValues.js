/**
 * 手写 Object.values
 *
 * 原生 Object.values 的作用：
 *   - 返回对象自身可枚举属性值组成的数组
 *   - 不包含继承属性，不包含 Symbol 属性
 *
 * 实现思路：
 *   1. 先获取自身可枚举属性名（复用 Object.keys 的逻辑）
 *   2. 将每个 key 映射为对应的值
 *   3. 返回值数组
 */

function myObjectValues(obj) {
  if (obj === null || obj === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }

  const target = Object(obj);
  const values = [];
  const hasOwn = Object.prototype.hasOwnProperty;
  const isEnumerable = Object.prototype.propertyIsEnumerable;

  for (const key in target) {
    if (hasOwn.call(target, key) && isEnumerable.call(target, key)) {
      values.push(target[key]);
    }
  }

  return values;
}

// ===== 测试 =====

console.log(myObjectValues({ a: 1, b: 2, c: 3 })); // [1, 2, 3]

// 继承属性值不应出现
function Animal() {
  this.name = "cat";
}
Animal.prototype.legs = 4;
const a = new Animal();
console.log(myObjectValues(a)); // ['cat']

// 不可枚举属性值不应出现
const obj = { x: 1, y: 2 };
Object.defineProperty(obj, "z", { value: 3, enumerable: false });
console.log(myObjectValues(obj)); // [1, 2]

// 数组
console.log(myObjectValues([10, 20, 30])); // [10, 20, 30]

// 字符串
console.log(myObjectValues("hi")); // ['h', 'i']

// 空对象
console.log(myObjectValues({})); // []

// 基本类型
console.log(myObjectValues(123)); // []

// null / undefined 应抛错
try {
  myObjectValues(undefined);
} catch (e) {
  console.log(e.message); // Cannot convert undefined or null to object
}
