/**
 * 手写矩阵快速幂
 * 利用快速幂思想计算 n 阶方阵的 k 次幂 A^k，时间复杂度 O(n^3 * log k)。
 *
 * 思路：与数值快速幂一致，把「数乘」替换成「矩阵乘法」。
 *   1) 矩阵乘法：C[i][j] = Σ A[i][t] * B[t][j]
 *   2) 单位矩阵 I 作为结果初值（类比 result = 1）
 *   3) 每次把指数右移，若该位为 1 则结果累乘当前 base，base 自乘
 *   4) 取模时用 mulMod 避免两数相乘超过 Number 安全范围 2^53 丢失精度
 *
 * 附带应用：用 2x2 矩阵快速幂求斐波那契数
 *   [[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]
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
 * 矩阵类（仅支持方阵），提供乘法与快速幂
 */
class Matrix {
  /**
   * @param {number[][]} data - 二维数组（方阵）
   */
  constructor(data) {
    this.data = data;
    this.n = data.length;
  }

  /**
   * 创建 n 阶单位矩阵
   * @param {number} n
   * @returns {Matrix}
   */
  static identity(n) {
    const data = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) data[i][i] = 1;
    return new Matrix(data);
  }

  /**
   * 矩阵乘法：this * other
   * @param {Matrix} other
   * @param {number} [mod] - 可选模数
   * @returns {Matrix}
   */
  multiply(other, mod) {
    const n = this.n;
    const result = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) {
        const aik = this.data[i][k];
        if (aik === 0) continue; // 跳过 0，小优化
        for (let j = 0; j < n; j++) {
          const bkj = other.data[k][j];
          if (mod !== undefined) {
            // 取模：用 mulMod 防止乘法溢出，累加后再模
            result[i][j] = (result[i][j] + mulMod(aik, bkj, mod)) % mod;
          } else {
            result[i][j] += aik * bkj;
          }
        }
      }
    }
    return new Matrix(result);
  }

  /**
   * 矩阵快速幂：计算 this^n
   * @param {number} n - 非负整数
   * @param {number} [mod] - 可选模数
   * @returns {Matrix}
   */
  pow(n, mod) {
    let result = Matrix.identity(this.n); // 结果初值 = 单位矩阵
    let base = new Matrix(this.data.map((row) => row.slice()));
    while (n > 0) {
      if (n & 1) result = result.multiply(base, mod);
      base = base.multiply(base, mod);
      n = Math.floor(n / 2); // 支持大指数
    }
    return result;
  }
}

// ===== 测试 =====
// 1. 矩阵乘法
const A = new Matrix([
  [1, 2],
  [3, 4],
]);
const B = new Matrix([
  [5, 6],
  [7, 8],
]);
console.log("A * B =", A.multiply(B).data); // [[19,22],[43,50]]

// 2. 单位矩阵：A^0 = I
console.log("A^0 (单位矩阵) =", A.pow(0).data); // [[1,0],[0,1]]

// 3. 矩阵幂
console.log("A^1 =", A.pow(1).data); // [[1,2],[3,4]]
console.log("A^2 =", A.pow(2).data); // [[7,10],[15,22]]
console.log("A^3 =", A.pow(3).data); // [[37,54],[81,118]]

// 4. 模意义下的矩阵幂：A^5 = [[1069,1558],[2337,3406]]，模 100
console.log("A^5 % 100 =", A.pow(5, 100).data); // [[69,58],[37,6]]

// 5. 应用：用矩阵快速幂求斐波那契数
//    [[1,1],[1,0]]^n = [[F(n+1),F(n)],[F(n),F(n-1)]]，故 P[0][1] = F(n)
function fib(n, mod) {
  if (n === 0) return 0;
  const M = new Matrix([
    [1, 1],
    [1, 0],
  ]);
  return M.pow(n, mod).data[0][1];
}
const MOD = 1000000007;
console.log("fib(10) =", fib(10)); // 55
console.log("fib(50) =", fib(50)); // 12586269025
console.log("fib(100) % 1e9+7 =", fib(100, MOD)); // 687995182

// 6. 与朴素递推对拍验证（取模，大范围）
function fibNaive(n, mod) {
  if (n === 0) return 0 % mod;
  let a = 0,
    b = 1;
  for (let i = 2; i <= n; i++) {
    const c = (a + b) % mod;
    a = b;
    b = c;
  }
  return b % mod;
}
let ok = true;
for (let i = 0; i <= 2000; i++) {
  if (fib(i, MOD) !== fibNaive(i, MOD)) {
    ok = false;
    break;
  }
}
console.log("fib 与朴素递推 0..2000 对拍:", ok); // true
