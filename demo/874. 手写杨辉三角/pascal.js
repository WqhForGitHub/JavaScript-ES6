/**
 * 手写杨辉三角
 *
 * 杨辉三角（Pascal's Triangle）：每行两端为 1，中间元素等于上一行相邻两元素之和。
 * 第 n 行（从 0 开始）有 n+1 个元素，第 i 行第 j 个元素为 C(i, j)。
 *
 * 性质：
 * - 对称性：C(n, k) = C(n, n-k)
 * - 第 n 行元素和为 2^n
 * - 斜对角线为组合数
 *
 * 前 5 行：
 *        1
 *       1 1
 *      1 2 1
 *     1 3 3 1
 *    1 4 6 4 1
 */

/**
 * 生成杨辉三角的前 n 行（二维数组）
 *
 * 算法：逐行构建，每行首尾为 1，中间元素 = 上一行[j-1] + 上一行[j]
 *
 * 时间复杂度：O(n^2)
 * 空间复杂度：O(n^2)
 *
 * @param {number} n 行数
 * @returns {number[][]} 杨辉三角二维数组
 */
function generatePascal(n) {
  if (n <= 0) return [];
  const triangle = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(i + 1).fill(1);
    for (let j = 1; j < i; j++) {
      row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
    }
    triangle.push(row);
  }
  return triangle;
}

/**
 * 获取杨辉三角的第 n 行（从 0 开始），使用 O(n) 额外空间
 *
 * 算法：仅保留一行，从右向左更新
 * - row[j] = row[j] + row[j-1]（从右向左避免覆盖）
 *
 * 或使用组合数递推：C(n, k) = C(n, k-1) * (n - k + 1) / k
 *
 * 时间复杂度：O(n^2) 或 O(n)（组合数递推）
 * 空间复杂度：O(n)
 *
 * @param {number} n 行号（从 0 开始）
 * @returns {number[]} 第 n 行
 */
function getPascalRow(n) {
  if (n < 0) return [];
  const row = [1];
  for (let k = 1; k <= n; k++) {
    // 利用 C(n, k) = C(n, k-1) * (n - k + 1) / k
    row.push(Math.round((row[row.length - 1] * (n - k + 1)) / k));
  }
  return row;
}

/**
 * 打印杨辉三角（居中对齐）
 *
 * @param {number[][]} triangle 杨辉三角
 */
function printPascal(triangle) {
  if (triangle.length === 0) return;
  const lastRow = triangle[triangle.length - 1];
  const width = lastRow.join(" ").length;

  triangle.forEach((row) => {
    const line = row.join(" ");
    const pad = Math.floor((width - line.length) / 2);
    console.log(" ".repeat(pad) + line);
  });
}

/**
 * 获取杨辉三角中指定位置 (row, col) 的值，即 C(row, col)
 *
 * @param {number} row 行号
 * @param {number} col 列号
 * @returns {number} 该位置的值
 */
function getPascalValue(row, col) {
  if (col < 0 || col > row) return 0;
  return getPascalRow(row)[col];
}

// ===== 测试 =====
console.log("===== 手写杨辉三角 =====\n");

// 测试 1：生成前 6 行
console.log("1. 前 6 行杨辉三角:");
const tri = generatePascal(6);
printPascal(tri);

// 测试 2：二维数组形式
console.log("\n2. 二维数组形式（前 5 行）:");
console.log(generatePascal(5));

// 测试 3：获取指定行（O(n) 空间）
console.log("\n3. 获取第 n 行（O(n) 空间）:");
for (let i = 0; i <= 6; i++) {
  console.log("  第 " + i + " 行:", getPascalRow(i));
}

// 测试 4：验证第 5 行 = [1, 5, 10, 10, 5, 1]
console.log("\n4. 验证第 5 行:");
console.log("  期望 [1, 5, 10, 10, 5, 1]");
console.log("  实际", getPascalRow(5));
console.log(
  "  一致:",
  JSON.stringify(getPascalRow(5)) === JSON.stringify([1, 5, 10, 10, 5, 1]),
);

// 测试 5：获取指定位置的值 C(6, 3) = 20
console.log("\n5. C(6, 3) =", getPascalValue(6, 3)); // 20
console.log("   C(10, 5) =", getPascalValue(10, 5)); // 252

// 测试 6：验证每行和为 2^n
console.log("\n6. 验证每行和为 2^n:");
for (let i = 0; i <= 6; i++) {
  const sum = getPascalRow(i).reduce((a, b) => a + b, 0);
  console.log(
    "  第 " + i + " 行和:",
    sum,
    "= 2^" + i + " =",
    2 ** i,
    "正确:",
    sum === 2 ** i,
  );
}

// 测试 7：第 10 行
console.log("\n7. 第 10 行:");
console.log("  ", getPascalRow(10));
