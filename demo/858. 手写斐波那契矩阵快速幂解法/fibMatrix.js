/**
 * 手写斐波那契矩阵快速幂解法
 *
 * 核心递推：
 *   [[F(n+1)], [F(n)]] = [[1,1],[1,0]] * [[F(n)], [F(n-1)]]
 *   所以 [[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]
 *   取 P[0][1] 即得 F(n)。
 * 时间复杂度：O(log n)（矩阵快速幂）
 * 空间复杂度：O(1)
 * 约定：F(0) = 0, F(1) = 1, F(2) = 1, F(3) = 2, ...
 *
 * 注意：不取模时，F(n) 超过 Number 安全整数范围 2^53 (≈9.007e15) 后会丢失精度
 *       （F(79) ≈ 1.45e16 已超界），因此大 n 必须配合取模使用。
 *       取模时用 mulMod 避免矩阵乘法中两数相乘溢出。
 */

/**
 * 安全模乘：(a * b) % mod，二进制拆分避免乘法溢出
 * @param {number} a
 * @param {number} b
 * @param {number} mod
 * @returns {number}
 */
function mulMod(a, b, mod) {
  a = ((a % mod) + mod) % mod;
  b = ((b % mod) + mod) % mod;
  let r = 0;
  while (b > 0) {
    if (b & 1) r = (r + a) % mod;
    a = (a + a) % mod;
    b = Math.floor(b / 2);
  }
  return r;
}

/**
 * 2x2 矩阵乘法（带可选模数）
 * @param {number[][]} a
 * @param {number[][]} b
 * @param {number} [mod]
 * @returns {number[][]}
 */
function matMul2(a, b, mod) {
  const c = [
    [0, 0],
    [0, 0],
  ];
  for (let i = 0; i < 2; i++) {
    for (let k = 0; k < 2; k++) {
      const aik = a[i][k];
      if (aik === 0) continue;
      for (let j = 0; j < 2; j++) {
        if (mod !== undefined) {
          c[i][j] = (c[i][j] + mulMod(aik, b[k][j], mod)) % mod;
        } else {
          c[i][j] += aik * b[k][j];
        }
      }
    }
  }
  return c;
}

/**
 * 2x2 矩阵快速幂
 * @param {number[][]} M
 * @param {number} k - 非负整数
 * @param {number} [mod]
 * @returns {number[][]}
 */
function matPow2(M, k, mod) {
  let result = [
    [1, 0],
    [0, 1],
  ]; // 单位矩阵
  let base = [M[0].slice(), M[1].slice()];
  while (k > 0) {
    if (k & 1) result = matMul2(result, base, mod);
    base = matMul2(base, base, mod);
    k = Math.floor(k / 2); // 支持大指数
  }
  return result;
}

/**
 * 斐波那契第 n 项（n >= 0）
 * @param {number} n
 * @param {number} [mod] - 可选模数；不传则在 Number 范围内计算（大 n 会丢精度）
 * @returns {number} F(n) 或 F(n) % mod
 */
function fib(n, mod) {
  if (n === 0) return mod !== undefined ? 0 % mod : 0;
  const M = [
    [1, 1],
    [1, 0],
  ];
  const P = matPow2(M, n, mod); // P[0][1] = F(n)
  return P[0][1];
}

/**
 * 朴素递推，用于对拍验证
 * @param {number} n
 * @param {number} [mod]
 * @returns {number}
 */
function fibNaive(n, mod) {
  if (n === 0) return mod !== undefined ? 0 % mod : 0;
  let a = 0,
    b = 1;
  for (let i = 2; i <= n; i++) {
    const c = mod !== undefined ? (a + b) % mod : a + b;
    a = b;
    b = c;
  }
  return mod !== undefined ? b % mod : b;
}

// ===== 测试 =====
console.log("fib(0):", fib(0)); // 0
console.log("fib(1):", fib(1)); // 1
console.log("fib(2):", fib(2)); // 1
console.log("fib(3):", fib(3)); // 2
console.log("fib(10):", fib(10)); // 55
console.log("fib(20):", fib(20)); // 6765
console.log("fib(50):", fib(50)); // 12586269025（仍在安全整数范围内）

// 取模
const MOD = 1000000007;
console.log("fib(100) % 1e9+7:", fib(100, MOD)); // 687995182
console.log("fib(1000) % 1e9+7:", fib(1000, MOD)); // 517691607
console.log("fib(1000000000) % 1e9+7:", fib(1000000000, MOD)); // 21（巨大指数下 O(log n) 仍很快）

// 与朴素递推对拍（不取模，仅安全整数范围内：F(78) < 2^53 < F(79)）
let ok = true;
for (let i = 0; i <= 78; i++) {
  if (fib(i) !== fibNaive(i)) {
    ok = false;
    break;
  }
}
console.log("不取模 0..78 对拍:", ok); // true

// 取模版本对拍（大范围）
let okMod = true;
for (let i = 0; i <= 2000; i++) {
  if (fib(i, MOD) !== fibNaive(i, MOD)) {
    okMod = false;
    break;
  }
}
console.log("取模版 0..2000 对拍:", okMod); // true
