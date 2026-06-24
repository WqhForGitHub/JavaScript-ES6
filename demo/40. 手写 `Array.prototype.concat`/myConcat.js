/**
 * 手写 Array.prototype.concat
 *
 * 作用：把当前数组与若干参数合并成一个新数组返回，不修改原数组。
 *       若参数是数组，则把它的元素逐个追加（只展开一层）；非数组参数直接追加。
 *
 * 实现思路：
 *   1. 创建空结果数组
 *   2. 先把 this 的每个元素追加到结果（保留空位）
 *   3. 再遍历每个参数：是数组则展开一层追加其元素，否则直接追加
 *   4. 返回结果数组
 */

Array.prototype.myConcat = function () {
  const result = [];

  // 把一个元素追加到结果：是数组则展开一层
  const append = (item) => {
    if (Array.isArray(item)) {
      for (let j = 0; j < item.length; j++) {
        if (j in item) {
          result[result.length] = item[j];
        } else {
          // 保留空位
          result.length++;
        }
      }
    } else {
      result[result.length] = item;
    }
  };

  // 先追加 this 的元素
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[result.length] = this[i];
    } else {
      result.length++;
    }
  }

  // 再追加每个参数
  for (let a = 0; a < arguments.length; a++) {
    append(arguments[a]);
  }

  return result;
};

// ===== 测试 =====

// --- 基本合并 ---
console.log([1, 2].myConcat([3, 4])); // [1, 2, 3, 4]

// --- 合并多个数组 ---
console.log([1].myConcat([2], [3], [4])); // [1, 2, 3, 4]

// --- 参数含非数组 ---
console.log([1, 2].myConcat(3, 4)); // [1, 2, 3, 4]
console.log([1, 2].myConcat(3, [4, 5], 6)); // [1, 2, 3, 4, 5, 6]

// --- 只展开一层（嵌套数组不展开）---
console.log([1].myConcat([2, [3, 4]])); // [1, 2, [3, 4]]

// --- 无参数：返回浅拷贝 ---
const original = [1, 2, 3];
const copy = original.myConcat();
console.log(copy); // [1, 2, 3]
console.log(copy === original); // false

// --- 不修改原数组 ---
const arr = [1, 2];
arr.myConcat([3, 4]);
console.log(arr); // [1, 2]

// --- 合并对象数组 ---
console.log([{ a: 1 }].myConcat([{ b: 2 }])); // [{ a: 1 }, { b: 2 }]
