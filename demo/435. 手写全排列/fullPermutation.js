/**
 * 手写全排列
 *
 * 给定一个数组，返回其所有可能的排列。例如 [1,2,3] 共 3! = 6 种排列。
 *
 * 实现 1（回溯 + used 标记）：维护一个 path 和一个 used 数组，
 *   依次尝试将每个未使用的元素加入 path，递归到底后回溯。
 *   适用于含重复元素的数组去重（需先排序并跳过同层重复）。
 *
 * 实现 2（交换法）：通过原地交换元素生成排列，不需要额外 used 数组，
 *   空间更省。固定第 i 位，把 [i, n) 中每个元素交换到第 i 位后递归。
 *
 * 时间复杂度 O(n * n!)，空间复杂度 O(n)（递归栈）。
 */

// 方法一：回溯 + used 标记（支持重复元素去重）
function permuteUnique(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  const path = [];
  const sorted = nums.slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  function backtrack() {
    if (path.length === sorted.length) {
      result.push(path.slice());
      return;
    }
    for (let i = 0; i < sorted.length; i++) {
      // 同层重复元素跳过：当前元素与前一个相同，且前一个未被使用
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;
      if (used[i]) continue;
      used[i] = true;
      path.push(sorted[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return result;
}

// 方法二：交换法（适用于无重复元素，或不去重场景）
function permuteSwap(nums) {
  const result = [];
  const arr = nums.slice();
  function backtrack(start) {
    if (start === arr.length) {
      result.push(arr.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]]; // 选
      backtrack(start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]]; // 撤销
    }
  }
  backtrack(0);
  return result;
}

// --- 测试 ---

console.log("permuteSwap([1,2,3]):");
console.log(permuteSwap([1, 2, 3]));
// 共 6 种排列，例如：
// [1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]
console.log("count:", permuteSwap([1, 2, 3]).length); // 6

console.log('permuteSwap(["a","b"]):');
console.log(permuteSwap(["a", "b"])); // [['a','b'], ['b','a']]

console.log("permuteUnique([1,1,2]):");
console.log(permuteUnique([1, 1, 2]));
// 去重后共 3 种：
// [1,1,2] [1,2,1] [2,1,1]
console.log("count:", permuteUnique([1, 1, 2]).length); // 3

console.log("permuteUnique([1,2,3]):");
console.log(permuteUnique([1, 2, 3]).length); // 6

console.log("permuteSwap([1]):");
console.log(permuteSwap([1])); // [[1]]
