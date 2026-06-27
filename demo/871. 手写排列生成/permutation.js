/**
 * 手写排列生成
 *
 * 排列（Permutation）：从 n 个不同元素中取出 m 个元素，按照一定的顺序排成一列。
 * 全排列：n 个元素的所有排列，共 n! 个。
 *
 * 本文件实现两种方式：
 * 1. 递归法（交换法）：通过交换元素位置生成排列
 * 2. 迭代法（字典序法）：按照字典序依次生成下一个排列
 *
 * 同时处理含重复元素的情况，避免生成重复排列。
 */

/**
 * 递归法生成全排列（交换法）
 *
 * 算法思想：
 * - 固定第 i 个位置，依次将 [i, n) 中的元素与第 i 个位置交换
 * - 递归处理第 i+1 个位置
 * - 回溯：恢复交换
 * - 通过 Set 去重，避免重复元素产生重复排列
 *
 * @param {number[]} arr 待排列数组
 * @returns {number[][]} 所有排列（已去重）
 */
function permuteRecursive(arr) {
  const result = [];
  const seen = new Set(); // 用于结果去重

  /**
   * 递归交换生成排列
   * @param {number[]} nums 当前数组
   * @param {number} start 起始位置
   */
  function backtrack(nums, start) {
    if (start === nums.length) {
      const key = nums.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        result.push([...nums]);
      }
      return;
    }
    for (let i = start; i < nums.length; i++) {
      // 交换
      [nums[start], nums[i]] = [nums[i], nums[start]];
      backtrack(nums, start + 1);
      // 回溯
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }

  backtrack([...arr], 0);
  return result;
}

/**
 * 优化的递归排列（剪枝去重，避免产生重复排列）
 * 使用 used 数组 + 排序剪枝
 *
 * @param {number[]} arr 待排列数组
 * @returns {number[][]} 所有排列（已去重）
 */
function permuteUnique(arr) {
  const result = [];
  const nums = [...arr].sort((a, b) => a - b);
  const used = new Array(nums.length).fill(false);
  const path = [];

  function dfs() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      // 当前元素已使用，跳过
      if (used[i]) continue;
      // 剪枝：当前元素与前一个相同，且前一个未使用（说明已回溯），跳过
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  }

  dfs();
  return result;
}

/**
 * 迭代法生成全排列（字典序法）
 *
 * 算法思想（C++ STL next_permutation 算法）：
 * 1. 从右向左找到第一个 nums[i] < nums[i+1] 的位置 i
 * 2. 从右向左找到第一个 nums[j] > nums[i] 的位置 j
 * 3. 交换 nums[i] 和 nums[j]
 * 4. 反转 nums[i+1..n-1]
 * 5. 重复直到找不到 i（即数组已降序），结束
 *
 * 时间复杂度：O(n! * n)
 *
 * @param {number[]} arr 待排列数组
 * @returns {number[][]} 所有排列（字典序）
 */
function permuteIterative(arr) {
  const nums = [...arr].sort((a, b) => a - b);
  const result = [[...nums]];
  const n = nums.length;

  while (true) {
    // 1. 找第一个升序对 (i, i+1)，从右向左
    let i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i < 0) break; // 已是最大排列

    // 2. 找第一个 nums[j] > nums[i]，从右向左
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;

    // 3. 交换
    [nums[i], nums[j]] = [nums[j], nums[i]];

    // 4. 反转 i+1 到末尾
    let left = i + 1;
    let right = n - 1;
    while (left < right) {
      [nums[left], nums[right]] = [nums[right], nums[left]];
      left++;
      right--;
    }

    result.push([...nums]);
  }

  return result;
}

// ===== 测试 =====
console.log("===== 手写排列生成 =====\n");

// 测试 1：递归法 - 无重复元素
console.log("1. 递归法 [1,2,3]:");
const r1 = permuteRecursive([1, 2, 3]);
console.log("  共", r1.length, "个排列:");
r1.forEach((p, i) => console.log("   ", i + 1 + ":", p));

// 测试 2：递归法 - 含重复元素
console.log("\n2. 递归法（去重） [1,1,2]:");
const r2 = permuteRecursive([1, 1, 2]);
console.log("  共", r2.length, "个排列:");
r2.forEach((p, i) => console.log("   ", i + 1 + ":", p));

// 测试 3：剪枝去重法
console.log("\n3. 剪枝去重法 [1,1,2]:");
const r3 = permuteUnique([1, 1, 2]);
console.log("  共", r3.length, "个排列:");
r3.forEach((p, i) => console.log("   ", i + 1 + ":", p));

// 测试 4：迭代法（字典序）
console.log("\n4. 迭代法（字典序） [1,2,3]:");
const r4 = permuteIterative([1, 2, 3]);
console.log("  共", r4.length, "个排列:");
r4.forEach((p, i) => console.log("   ", i + 1 + ":", p));

// 测试 5：迭代法含重复元素
console.log("\n5. 迭代法 [1,1,2]（含重复）:");
const r5 = permuteIterative([1, 1, 2]);
console.log("  共", r5.length, "个排列:");
r5.forEach((p, i) => console.log("   ", i + 1 + ":", p));

// 测试 6：单元素
console.log("\n6. 单元素 [42]:");
console.log("  ", permuteRecursive([42]));

// 测试 7：空数组
console.log("\n7. 空数组 []:");
console.log("  ", permuteRecursive([]));
