/**
 * 手写组合生成
 *
 * 组合（Combination）：从 n 个不同元素中取出 k 个元素组成一组，不考虑顺序。
 * 组合数 C(n, k) = n! / (k! * (n-k)!)
 *
 * 本文件实现两种方式：
 * 1. 递归法（回溯）：选择/不选择当前元素
 * 2. 迭代法：利用索引数组的迭代
 *
 * 另外实现计算组合数 C(n, k) 的函数。
 */

/**
 * 计算组合数 C(n, k)
 * 使用乘法公式避免大数阶乘溢出：
 * C(n, k) = n * (n-1) * ... * (n-k+1) / (k * (k-1) * ... * 1)
 *
 * @param {number} n 总数
 * @param {number} k 选取数
 * @returns {number} 组合数
 */
function combinationCount(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  // 利用对称性减少计算
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * 递归法生成所有 C(n, k) 组合（回溯法）
 *
 * 算法思想：
 * - 从 start 开始枚举，每次选择一个元素加入 path
 * - 当 path 长度达到 k 时，记录结果
 * - 剪枝：若剩余元素不足以填满 path，则提前返回
 *
 * 时间复杂度：O(C(n,k) * k)
 *
 * @param {number[]} arr 待组合数组
 * @param {number} k 每组选取个数
 * @returns {number[][]} 所有组合
 */
function combineRecursive(arr, k) {
  const result = [];
  const path = [];

  /**
   * 回溯
   * @param {number} start 起始索引
   */
  function backtrack(start) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    // 剪枝：i 的上限为 n - (k - path.length) + 1
    const need = k - path.length;
    for (let i = start; i <= arr.length - need; i++) {
      path.push(arr[i]);
      backtrack(i + 1);
      path.pop();
    }
  }

  backtrack(0);
  return result;
}

/**
 * 迭代法生成所有 C(n, k) 组合
 *
 * 算法思想：
 * - 使用一个索引数组 indices = [0, 1, 2, ..., k-1]，对应一种组合
 * - 从右向左找到第一个可递增的索引 i（indices[i] != n - k + i）
 * - indices[i]++，且 indices[i+1..] = indices[i] + 1, indices[i] + 2, ...
 * - 重复直到无法递增
 *
 * @param {number[]} arr 待组合数组
 * @param {number} k 每组选取个数
 * @returns {number[][]} 所有组合
 */
function combineIterative(arr, k) {
  const n = arr.length;
  if (k < 0 || k > n) return [];
  if (k === 0) return [[]];

  const result = [];
  // 初始化索引数组
  const indices = Array.from({ length: k }, (_, i) => i);

  while (true) {
    // 记录当前组合
    result.push(indices.map((i) => arr[i]));

    // 从右向左找第一个可递增的索引
    let i = k - 1;
    while (i >= 0 && indices[i] === n - k + i) i--;

    if (i < 0) break; // 所有组合已生成

    // 递增并重置后续索引
    indices[i]++;
    for (let j = i + 1; j < k; j++) {
      indices[j] = indices[j - 1] + 1;
    }
  }

  return result;
}

/**
 * 生成数组的所有子集（幂集）
 * 即所有 k 从 0 到 n 的组合
 *
 * @param {number[]} arr 输入数组
 * @returns {number[][]} 所有子集
 */
function allSubsets(arr) {
  const result = [];
  for (let k = 0; k <= arr.length; k++) {
    result.push(...combineRecursive(arr, k));
  }
  return result;
}

// ===== 测试 =====
console.log("===== 手写组合生成 =====\n");

// 测试 1：组合数计算
console.log("1. 组合数 C(5, 2) =", combinationCount(5, 2)); // 10
console.log("   组合数 C(6, 3) =", combinationCount(6, 3)); // 20
console.log("   组合数 C(10, 5) =", combinationCount(10, 5)); // 252

// 测试 2：递归法 C(4, 2)
console.log("\n2. 递归法 C([1,2,3,4], 2):");
const c1 = combineRecursive([1, 2, 3, 4], 2);
console.log("  共", c1.length, "组（应为 C(4,2)=6）:");
c1.forEach((c, i) => console.log("   ", i + 1 + ":", c));

// 测试 3：迭代法 C(5, 3)
console.log("\n3. 迭代法 C([1,2,3,4,5], 3):");
const c2 = combineIterative([1, 2, 3, 4, 5], 3);
console.log("  共", c2.length, "组（应为 C(5,3)=10）:");
c2.forEach((c, i) => console.log("   ", i + 1 + ":", c));

// 测试 4：边界 k=0 和 k=n
console.log("\n4. 边界测试:");
console.log("  C([1,2,3], 0):", combineRecursive([1, 2, 3], 0)); // [[]]
console.log("  C([1,2,3], 3):", combineRecursive([1, 2, 3], 3)); // [[1,2,3]]

// 测试 5：两种方法结果一致
console.log("\n5. 两种方法结果一致（[1,2,3,4,5] 取 3）:");
const r1 = combineRecursive([1, 2, 3, 4, 5], 3);
const r2 = combineIterative([1, 2, 3, 4, 5], 3);
console.log("  递归法数量:", r1.length, "迭代法数量:", r2.length);
console.log("  结果一致:", JSON.stringify(r1) === JSON.stringify(r2));

// 测试 6：所有子集
console.log("\n6. [1,2,3] 的所有子集（共 2^3=8 个）:");
const subs = allSubsets([1, 2, 3]);
subs.forEach((s, i) => console.log("   ", i + 1 + ":", s));
