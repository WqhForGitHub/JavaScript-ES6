/**
 * 手写卡特兰数
 *
 * 卡特兰数（Catalan Number）是组合数学中常见的数列：
 * C_0 = 1, C_n = (2*(2n-1)/(n+1)) * C_{n-1}
 *
 * 通项公式：C_n = C(2n, n) / (n + 1) = (2n)! / (n! * (n+1)!)
 *
 * 应用场景：
 * - n 对括号的合法匹配方式数
 * - n 个节点的不同二叉搜索树个数
 * - 凸 (n+2) 边形的三角剖分数
 * - 从 (0,0) 到 (n,n) 不越过对角线的路径数
 *
 * 前 10 项：1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862
 */

/**
 * 方法一：动态规划法计算第 n 个卡特兰数
 *
 * 递推关系：C_0 = 1
 *           C_n = sum_{i=0}^{n-1} C_i * C_{n-1-i}
 *
 * 即 C_n = C_0*C_{n-1} + C_1*C_{n-2} + ... + C_{n-1}*C_0
 *
 * 时间复杂度：O(n^2)
 * 空间复杂度：O(n)
 *
 * @param {number} n 卡特兰数下标（n >= 0）
 * @returns {number} 第 n 个卡特兰数
 */
function catalanDP(n) {
  if (n < 0) throw new Error("n must be non-negative");
  if (n === 0 || n === 1) return 1;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      dp[i] += dp[j] * dp[i - 1 - j];
    }
  }
  return dp[n];
}

/**
 * 方法二：组合数公式法计算第 n 个卡特兰数
 *
 * C_n = C(2n, n) / (n + 1)
 *     = (2n)! / (n! * n! * (n+1))
 *     = (2n)! / (n! * (n+1)!)
 *
 * 为避免大数阶乘溢出，使用递推乘除：
 * C(2n, n) = prod_{i=1}^{n} (n + i) / i
 * 然后 C_n = C(2n, n) / (n + 1)
 *
 * 时间复杂度：O(n)
 * 空间复杂度：O(1)
 *
 * @param {number} n 卡特兰数下标
 * @returns {number} 第 n 个卡特兰数
 */
function catalanFormula(n) {
  if (n < 0) throw new Error("n must be non-negative");
  if (n === 0 || n === 1) return 1;
  // 计算组合数 C(2n, n)
  let c = 1;
  const k = n;
  for (let i = 0; i < k; i++) {
    c = (c * (2 * n - i)) / (i + 1);
  }
  return Math.round(c / (n + 1));
}

/**
 * 方法三：线性递推（最简实现）
 * C_0 = 1, C_n = C_{n-1} * 2 * (2n - 1) / (n + 1)
 *
 * @param {number} n 卡特兰数下标
 * @returns {number} 第 n 个卡特兰数
 */
function catalanLinear(n) {
  if (n < 0) throw new Error("n must be non-negative");
  let c = 1;
  for (let i = 1; i <= n; i++) {
    c = (c * 2 * (2 * i - 1)) / (i + 1);
  }
  return Math.round(c);
}

/**
 * 列出前 N 个卡特兰数
 *
 * @param {number} N 要列出的个数
 * @returns {number[]} 卡特兰数数组
 */
function listCatalan(N) {
  const result = [];
  for (let i = 0; i < N; i++) {
    result.push(catalanLinear(i));
  }
  return result;
}

/**
 * 应用：n 对括号的所有合法匹配方式数
 * 等于第 n 个卡特兰数
 *
 * @param {number} n 括号对数
 * @returns {number} 合法匹配方式数
 */
function validParenthesisCount(n) {
  return catalanLinear(n);
}

// ===== 测试 =====
console.log("===== 手写卡特兰数 =====\n");

// 测试 1：前 10 个卡特兰数
console.log("1. 前 10 个卡特兰数:");
const list = listCatalan(10);
list.forEach((c, i) => console.log("   C_" + i + " =", c));
// 预期：1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862

// 测试 2：三种方法结果一致
console.log("\n2. 三种方法对比（n=8）:");
console.log("  动态规划法:", catalanDP(8));
console.log("  组合公式法:", catalanFormula(8));
console.log("  线性递推法:", catalanLinear(8));
// 预期均为 1430

// 测试 3：特殊值
console.log("\n3. 特殊值:");
console.log("  C_0 =", catalanDP(0)); // 1
console.log("  C_1 =", catalanDP(1)); // 1
console.log("  C_2 =", catalanDP(2)); // 2
console.log("  C_3 =", catalanDP(3)); // 5
console.log("  C_10 =", catalanDP(10)); // 16796

// 测试 4：应用 - 括号匹配数
console.log("\n4. n 对括号的合法匹配方式数:");
for (let n = 1; n <= 6; n++) {
  console.log("   " + n + " 对括号:", validParenthesisCount(n), "种");
}

// 测试 5：应用 - 不同二叉搜索树个数
console.log("\n5. n 个节点的不同二叉搜索树个数（n=1..8）:");
for (let n = 1; n <= 8; n++) {
  console.log("   " + n + " 个节点:", catalanLinear(n), "种");
}
