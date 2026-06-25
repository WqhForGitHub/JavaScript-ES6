/**
 * 手写 Array.prototype.reduce
 *
 * 作用：从左到右遍历数组，把每个元素通过回调累计到一个值上，最终返回该累计值。
 *
 * 实现思路：
 *   1. 若提供了 initialValue，则累加器 acc 初始为它，从下标 0 开始遍历
 *   2. 若没有提供 initialValue，则取第一个非空位元素作为 acc，从其下一个下标开始遍历；
 *      若数组为空（或全是空位）又没给初始值，抛出 TypeError
 *   3. 回调接收四个参数：acc、当前元素、当前索引、原数组
 *   4. 用 `i in this` 跳过稀疏空位
 */

Array.prototype.myReduce = function (callback, initialValue) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const hasInitial = arguments.length >= 2;
  let acc;
  let startIndex = 0;

  if (hasInitial) {
    acc = initialValue;
  } else {
    let found = false;
    for (let k = 0; k < this.length; k++) {
      if (k in this) {
        acc = this[k];
        startIndex = k + 1;
        found = true;
        break;
      }
    }
    if (!found) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      acc = callback(acc, this[i], i, this);
    }
  }

  return acc;
};

// ===== 测试 =====

// --- 求和（无初始值）---
console.log([1, 2, 3, 4].myReduce((a, b) => a + b)); // 10

// --- 求和（带初始值）---
console.log([1, 2, 3, 4].myReduce((a, b) => a + b, 10)); // 20

// --- 累乘 ---
console.log([1, 2, 3, 4].myReduce((a, b) => a * b)); // 24

// --- 扁平化二维数组 ---
console.log([[1, 2], [3, 4], [5]].myReduce((a, b) => a.concat(b), [])); // [1, 2, 3, 4, 5]

// --- 统计元素出现次数 ---
console.log(
  ["a", "b", "a", "c", "b", "a"].myReduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
  }, {}),
); // { a: 3, b: 2, c: 1 }

// --- 使用索引和原数组参数 ---
console.log([10, 20, 30].myReduce((acc, cur, i, arr) => acc + cur + i, 0)); // 0+10+0 + 20+1 + 30+2 = 63

// --- 空数组 + 初始值 ---
console.log([].myReduce((a, b) => a + b, 0)); // 0

// --- 空数组 + 无初始值，应抛错 ---
try {
  [].myReduce((a, b) => a + b);
} catch (e) {
  console.log(e.message); // Reduce of empty array with no initial value
}
