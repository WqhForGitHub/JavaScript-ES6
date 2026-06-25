/**
 * 手写组合
 *
 * 从 n 个元素中选出 k 个元素的所有组合，例如 [1,2,3,4] 选 2 个共 C(4,2)=6 种。
 * 与排列不同，组合不关心顺序，[1,2] 与 [2,1] 视为同一种。
 *
 * 实现 1（回溯 + start 下标）：用 start 限定每次只向后选取，天然避免重复。
 *   剪枝：剩余可选元素不足 (k - path.length) 个时提前结束。
 *
 * 实现 2（选/不选）：对每个元素决定「选」或「不选」，递归到底收集结果。
 *
 * 时间复杂度 O(C(n,k) * k)（收集每个组合需要拷贝）。
 */

// 方法一：回溯 + start 下标（带剪枝）
function combine(nums, k) {
  const result = [];
  const path = [];
  const n = nums.length;
  function backtrack(start) {
    if (path.length === k) {
      result.push(path.slice());
      return;
    }
    // 剪枝：i 最多到 n - (k - path.length)，保证剩余元素足够凑齐 k 个
    const need = k - path.length;
    for (let i = start; i <= n - need; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(0);
  return result;
}

// 方法二：选/不选（对每个元素做二叉决策）
function combinePick(nums, k) {
  const result = [];
  const path = [];
  const n = nums.length;
  function backtrack(index) {
    // 提前返回：剩余元素不足以凑齐 k 个，或已选满
    if (path.length === k) {
      result.push(path.slice());
      return;
    }
    if (index === n) return;
    // 选当前元素
    path.push(nums[index]);
    backtrack(index + 1);
    path.pop();
    // 不选当前元素
    backtrack(index + 1);
  }
  backtrack(0);
  return result;
}

// 扩展：所有子集（k 从 0 到 n 的组合）
function subsets(nums) {
  const result = [];
  const path = [];
  const n = nums.length;
  function backtrack(start) {
    result.push(path.slice());
    for (let i = start; i < n; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(0);
  return result;
}

// --- 测试 ---

console.log("combine([1,2,3,4], 2):");
console.log(combine([1, 2, 3, 4], 2));
// [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
console.log("count:", combine([1, 2, 3, 4], 2).length); // 6

console.log("combinePick([1,2,3], 2):");
console.log(combinePick([1, 2, 3], 2));
// [[1,2],[1,3],[2,3]]
console.log("count:", combinePick([1, 2, 3], 2).length); // 3

console.log("combine([1,2,3], 0):");
console.log(combine([1, 2, 3], 0)); // [[]]

console.log("combine([1,2,3], 3):");
console.log(combine([1, 2, 3], 3)); // [[1,2,3]]

console.log("subsets([1,2,3]):");
console.log(subsets([1, 2, 3]));
// [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]
console.log("count:", subsets([1, 2, 3]).length); // 8 (= 2^3)

console.log("C(5,3) =", combine([1, 2, 3, 4, 5], 3).length); // 10
