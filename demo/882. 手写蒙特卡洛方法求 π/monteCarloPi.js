/**
 * 蒙特卡洛方法求 π (Monte Carlo π Estimation)
 *
 * 在单位正方形 [0,1]×[0,1] 内随机投点，
 * 统计落入四分之一圆 (x² + y² ≤ 1) 内的点数比例。
 *
 * 由于四分之一圆面积 = π/4，正方形面积 = 1，故:
 *   π/4 ≈ (圆内点数) / (总点数)
 *   π  ≈ 4 * (圆内点数) / (总点数)
 *
 * 根据大数定律，N 越大估计越精确，误差约为 O(1/√N)。
 */

/**
 * 使用蒙特卡洛方法估算 π
 * @param {number} N - 投点总数
 * @returns {number} π 的估算值
 */
function monteCarloPi(N) {
  let inside = 0;
  for (let i = 0; i < N; i++) {
    const x = Math.random();
    const y = Math.random();
    if (x * x + y * y <= 1) {
      inside++;
    }
  }
  return (4 * inside) / N;
}

/**
 * 带可复现随机种子的版本 (线性同余生成器 LCG)
 * @param {number} N    - 投点总数
 * @param {number} seed - 随机种子
 * @returns {number} π 的估算值
 */
function monteCarloPiSeeded(N, seed = 12345) {
  let s = seed >>> 0;
  const rand = () => {
    // LCG: 参数来自 glibc / Numerical Recipes
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296; // 归一化到 [0,1)
  };
  let inside = 0;
  for (let i = 0; i < N; i++) {
    const x = rand();
    const y = rand();
    if (x * x + y * y <= 1) inside++;
  }
  return (4 * inside) / N;
}

// ---- 测试 ----

// 测试 1: 大样本估算 (结果应接近 Math.PI)
const N = 1000000;
const estimate = monteCarloPi(N);
console.log(`蒙特卡洛估算 π (N=${N}):`);
console.log("  估计值 :", estimate);
console.log("  真实值 :", Math.PI);
console.log("  误差   :", Math.abs(estimate - Math.PI).toFixed(6));

// 测试 2: 多次不同规模对比，观察误差随 N 减小
console.log("\n不同样本量下的估算 (使用固定种子保证可复现):");
const sizes = [1000, 10000, 100000, 1000000];
for (const n of sizes) {
  const est = monteCarloPiSeeded(n, 42);
  const err = Math.abs(est - Math.PI);
  console.log(
    `  N=${String(n).padStart(7)}  ->  π ≈ ${est.toFixed(6)}  误差=${err.toFixed(6)}`,
  );
}

// 测试 3: 理论误差界 ~ 1/√N
console.log("\n理论误差界 (约 1/√N):");
for (const n of sizes) {
  console.log(
    `  N=${String(n).padStart(7)}  ->  1/√N ≈ ${(1 / Math.sqrt(n)).toFixed(6)}`,
  );
}
