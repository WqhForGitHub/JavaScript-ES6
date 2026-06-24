/**
 * 手写 Array.prototype.flat（支持指定深度）
 *
 * 作用：按指定深度 depth 递归地将数组展平，返回一个新数组，不修改原数组。
 *       depth 缺省为 1；depth 为 Infinity 时完全展平；depth <= 0 时不展平（仅浅拷贝一层）。
 *       会移除原数组中的空位（稀疏数组中的 hole）。
 *
 * 实现思路：
 *   1. 规范化 depth（缺省为 1）
 *   2. 定义递归函数 flatten(arr, d)：
 *        - 遍历 arr 每个元素（用 `i in arr` 跳过空位，从而移除空位）
 *        - 若当前元素是数组且 d > 0，递归展平一层（d - 1）
 *        - 否则把元素追加到结果数组
 *   3. 返回结果数组
 */

Array.prototype.myFlat = function (depth) {
  if (depth === undefined) depth = 1;
  const d = Number(depth) >= 0 ? Number(depth) : 0;

  const result = [];

  const flatten = (arr, depth) => {
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) {
        const item = arr[i];
        if (Array.isArray(item) && depth > 0) {
          flatten(item, depth - 1);
        } else {
          result[result.length] = item;
        }
      }
      // 跳过空位：不追加任何东西，等价于移除空位
    }
  };

  flatten(this, d);
  return result;
};

// ===== 测试 =====

// --- 默认深度 1 ---
console.log([1, [2, [3, [4]]]].myFlat()); // [1, 2, [3, [4]]]

// --- 指定深度 2 ---
console.log([1, [2, [3, [4]]]].myFlat(2)); // [1, 2, 3, [4]]

// --- 完全展平 Infinity ---
console.log([1, [2, [3, [4]]]].myFlat(Infinity)); // [1, 2, 3, 4]

// --- 深度 0：不展平，但会移除空位 ---
console.log([1, [2, [3]]].myFlat(0)); // [1, [2, [3]]]

// --- 移除空位 ---
const sparse = [1, , 3, , 5];
console.log(sparse.myFlat()); // [1, 3, 5]

// --- 不修改原数组 ---
const original = [1, [2, [3]]];
original.myFlat();
console.log(original); // [1, [2, [3]]]

// --- 混合类型 ---
console.log([1, [2, [3, 4]], 5].myFlat(2)); // [1, 2, 3, 4, 5]
