/**
 * 手写 Object.keys
 *
 * 原生 Object.keys 的作用：
 *   - 返回对象自身可枚举属性名组成的数组
 *   - 不包含继承属性，不包含 Symbol 属性
 *
 * 实现思路：
 *   1. 通过 for...in 遍历对象
 *   2. 用 Object.prototype.hasOwnProperty 过滤掉继承属性
 *   3. 用 Object.prototype.propertyIsEnumerable 过滤不可枚举属性
 *   4. 收集 key 到数组返回
 *
 * 注意：for...in 本身只遍历可枚举属性，但仍需 hasOwnProperty 过滤继承属性
 */

function myObjectKeys(obj) {
  // 非对象/字符串/null/undefined 等处理
  // 原生 Object.keys 对基本类型会先做 Object() 包装（null/undefined 抛错）
  if (obj === null || obj === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }

  // 将基本类型包装为对象，保持与原生行为一致
  const target = Object(obj);

  const keys = [];
  // 使用 Object.prototype 的方法，避免 obj 上被覆盖
  const hasOwn = Object.prototype.hasOwnProperty;
  const isEnumerable = Object.prototype.propertyIsEnumerable;

  for (const key in target) {
    if (hasOwn.call(target, key) && isEnumerable.call(target, key)) {
      keys.push(key);
    }
  }

  return keys;
}

// ===== 测试 =====

// 普通对象
console.log(myObjectKeys({ a: 1, b: 2, c: 3 })); // ['a', 'b', 'c']

// 继承属性不应出现
function Person() {
  this.name = "Tom";
}
Person.prototype.age = 18;
const p = new Person();
console.log(myObjectKeys(p)); // ['name']（不含继承的 age）

// 不可枚举属性不应出现
const obj = { a: 1, b: 2 };
Object.defineProperty(obj, "c", { value: 3, enumerable: false });
console.log(myObjectKeys(obj)); // ['a', 'b']

// 数组（索引作为字符串 key）
console.log(myObjectKeys([10, 20, 30])); // ['0', '1', '2']

// 字符串（每个字符的索引作为 key）
console.log(myObjectKeys("abc")); // ['0', '1', '2']

// 空对象
console.log(myObjectKeys({})); // []

// 基本类型包装
console.log(myObjectKeys(123)); // []

// null / undefined 应抛错
try {
  myObjectKeys(null);
} catch (e) {
  console.log(e.message); // Cannot convert undefined or null to object
}
