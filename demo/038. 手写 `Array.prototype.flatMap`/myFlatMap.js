/**
 * 手写 Array.prototype.flatMap
 *
 * 作用：先对数组每个元素调用回调（同 map），再把回调返回的数组「展平一层」拼接成新数组。
 *       等价于 arr.map(callback).flat(1)，但更高效。不修改原数组。
 *
 * 实现思路：
 *   1. for 循环遍历每个下标，用 `i in this` 跳过稀疏空位
 *   2. 对每个元素调用回调（传入 元素 / 索引 / 原数组），得到返回值 value
 *   3. 若 value 是数组，则把它的每个元素依次追加到结果（展平一层）；
 *      否则直接把 value 追加到结果
 *   4. 通过 call 绑定 thisArg
 */

Array.prototype.myFlatMap = function (callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const value = callback.call(thisArg, this[i], i, this);

      if (Array.isArray(value)) {
        // 展平一层
        for (let j = 0; j < value.length; j++) {
          if (j in value) {
            result[result.length] = value[j];
          }
        }
      } else {
        result[result.length] = value;
      }
    }
  }

  return result;
};

// ===== 测试 =====

// --- 把每个元素拆成重复数组并展平 ---
console.log([1, 2, 3].myFlatMap((x) => [x, x])); // [1, 1, 2, 2, 3, 3]

// --- 把句子拆成单词 ---
console.log(["hello world", "foo bar"].myFlatMap((s) => s.split(" "))); // ['hello', 'world', 'foo', 'bar']

// --- 回调返回非数组时，行为与 map 相同 ---
console.log([1, 2, 3].myFlatMap((x) => x * 2)); // [2, 4, 6]

// --- 只展平一层（不会深度展平）---
console.log([1, 2].myFlatMap((x) => [[x, x]])); // [[1, 1], [2, 2]]

// --- 使用索引 ---
console.log([10, 20, 30].myFlatMap((x, i) => [i, x])); // [0, 10, 1, 20, 2, 30]

// --- 使用 thisArg ---
console.log(
  [1, 2, 3].myFlatMap(
    function (x) {
      return [x, this.suffix];
    },
    { suffix: 0 },
  ),
); // [1, 0, 2, 0, 3, 0]

// --- 与原生 flatMap 结果对比 ---
console.log(
  JSON.stringify([1, 2, 3].myFlatMap((x) => [x, x * 2])) ===
    JSON.stringify([1, 2, 3].flatMap((x) => [x, x * 2])),
); // true
