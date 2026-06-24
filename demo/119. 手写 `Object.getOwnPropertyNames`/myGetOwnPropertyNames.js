/**
 * 手写 Object.getOwnPropertyNames
 *
 * 原生 Object.getOwnPropertyNames 的作用：
 *   - 返回对象自身所有属性名数组（字符串 key）
 *   - 包括可枚举和不可枚举属性
 *   - 不包括 Symbol 属性
 *
 * 与 Object.keys 的区别：
 *   - Object.keys 只返回可枚举属性
 *   - getOwnPropertyNames 返回全部字符串属性（含不可枚举）
 *
 * 实现思路：
 *   1. for...in 只能拿到可枚举属性（含继承），不够
 *   2. 通过原生 Object.getOwnPropertyNames 自身已可枚举全部，但为"手写"，
 *      这里用一个巧妙的办法：遍历可枚举的 + 已知的内置不可枚举属性
 *   3. 更实际的做法：结合 for...in（可枚举）+ 手动检查常见不可枚举属性
 *   4. 最稳妥：直接利用 Object.keys（可枚举自有）+ 额外收集不可枚举自有属性
 *
 * 说明：纯 JS 无法枚举不可枚举自有属性，必须依赖原生能力。
 *       下面给出借助 Object.getOwnPropertyNames 自身 + 描述符过滤 Symbol 的实现，
 *       同时提供一个能正确工作的版本（剔除 Symbol）。
 */

function myGetOwnPropertyNames(obj) {
  if (obj === null || obj === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }

  const target = Object(obj);

  // Reflect.ownKeys 返回字符串 key 和 Symbol key
  // 过滤掉 Symbol，保留字符串 key（与 getOwnPropertyNames 行为一致）
  const names = [];
  for (const key of Reflect.ownKeys(target)) {
    if (typeof key === "string") {
      names.push(key);
    }
  }
  return names;
}

// ===== 测试 =====

const obj = { a: 1, b: 2 };
Object.defineProperty(obj, "c", { value: 3, enumerable: false });
const sym = Symbol("s");
obj[sym] = "sym";

// 返回所有字符串 key（含不可枚举），不含 Symbol
console.log(myGetOwnPropertyNames(obj)); // ['a', 'b', 'c']

// 与 Object.keys 对比
console.log(Object.keys(obj)); // ['a', 'b']（不含不可枚举）

// 数组：返回索引 + length
console.log(myGetOwnPropertyNames([1, 2, 3])); // ['0', '1', '2', 'length']

// 字符串：返回索引 + length
console.log(myGetOwnPropertyNames("ab")); // ['0', '1', 'length']

// 空对象
console.log(myGetOwnPropertyNames({})); // []

// 包含 length 等内置不可枚举属性
console.log(myGetOwnPropertyNames(/regex/)); // 包含 'lastIndex', 'source', ... 等

// null / undefined 抛错
try {
  myGetOwnPropertyNames(null);
} catch (e) {
  console.log(e.message); // Cannot convert undefined or null to object
}
