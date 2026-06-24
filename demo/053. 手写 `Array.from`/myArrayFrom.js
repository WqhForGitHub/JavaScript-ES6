/**
 * 手写 Array.from
 *
 * 作用：把类数组对象或可迭代对象转换成真正的数组。可选地对每个元素执行 mapFn 做映射。
 *       Array.from(arrayLike, mapFn, thisArg)
 *
 * 实现思路：
 *   1. 先判断 arrayLike 是否有 [Symbol.iterator]：
 *      - 有：按迭代器协议逐个取出 value
 *      - 无：按类数组方式，用 length 属性按下标取值
 *   2. 对取出的每个元素：若提供了 mapFn，则调用 mapFn(value, index) 做映射（可绑定 thisArg）；
 *      否则直接使用原值
 *   3. 把结果依次追加到结果数组并返回
 */

Array.myFrom = function (arrayLike, mapFn, thisArg) {
  if (arrayLike == null) {
    throw new TypeError('Array.from requires an array-like object - not null or undefined');
  }

  const hasMapFn = typeof mapFn === 'function';
  const result = [];

  if (typeof arrayLike[Symbol.iterator] === 'function') {
    // 可迭代对象
    let index = 0;
    const iterator = arrayLike[Symbol.iterator]();
    let step;
    while (!(step = iterator.next()).done) {
      const value = step.value;
      if (hasMapFn) {
        result[result.length] = mapFn.call(thisArg, value, index);
      } else {
        result[result.length] = value;
      }
      index++;
    }
  } else {
    // 类数组对象
    const len = Number(arrayLike.length);
    for (let i = 0; i < len; i++) {
      const value = arrayLike[i];
      if (hasMapFn) {
        result[result.length] = mapFn.call(thisArg, value, i);
      } else {
        result[result.length] = value;
      }
    }
  }

  return result;
};

// ===== 测试 =====

// --- 从字符串创建数组（字符串可迭代）---
console.log(Array.myFrom('hello')); // ['h', 'e', 'l', 'l', 'o']

// --- 从 Set 创建数组 ---
console.log(Array.myFrom(new Set([1, 2, 2, 3]))); // [1, 2, 3]

// --- 从类数组对象创建 ---
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
console.log(Array.myFrom(arrayLike)); // ['a', 'b', 'c']

// --- 使用 mapFn ---
console.log(Array.myFrom([1, 2, 3], x => x * 2)); // [2, 4, 6]
console.log(Array.myFrom({ length: 3 }, (_, i) => i)); // [0, 1, 2]

// --- 使用 thisArg ---
console.log(
  Array.myFrom(
    [1, 2, 3],
    function (x) {
      return x + this.base;
    },
    { base: 10 }
  )
); // [11, 12, 13]

// --- 从 arguments 类数组（通过函数调用）---
function fn() {
  return Array.myFrom(arguments);
}
console.log(fn(1, 2, 3)); // [1, 2, 3]

// --- 从 NodeList 类数组 ---
const fakeNodeList = { 0: 'div1', 1: 'div2', length: 2 };
console.log(Array.myFrom(fakeNodeList)); // ['div1', 'div2']

// --- 与原生 Array.from 对比 ---
console.log(
  JSON.stringify(Array.myFrom('abc', x => x.toUpperCase())) ===
    JSON.stringify(Array.from('abc', x => x.toUpperCase()))
); // true
