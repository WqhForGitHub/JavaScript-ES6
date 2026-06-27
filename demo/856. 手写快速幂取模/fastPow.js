/**
 * 手写快速幂取模
 * 计算 (base^exp) % mod，时间复杂度 O(log exp * log mod)（含安全模乘）
 *
 * 思路：二进制拆分指数
 *   base^exp = base^(b0 + b1*2 + b2*4 + ...) = ∏ base^(2^k)  (当该二进制位为 1)
 *   每一步对 mod 取模防止数值过大。
 *
 * 关键细节：
 *   1) 当 mod 较大（接近 1e9）时，两数相乘可能超过 Number 安全整数范围 2^53
 *      (≈9.007e15) 导致精度丢失。因此用 mulMod（二进制拆分乘法）保证
 *      (a*b)%mod 始终精确：每次只做 (r+a)%mod 与 (a+a)%mod，两者均 < 2*mod。
 *   2) 指数右移用 Math.floor(exp/2) 而非 (exp>>>1)，以支持超过 2^31 的大指数。
 *   3) base 可为负数：先规整到 [0, mod) 区间。
 * 假设：exp >= 0；mod > 0。
 */

/**
 * 安全模乘：(a * b) % mod，用二进制拆分避免乘法溢出
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
    if (b & 1) r = (r + a) % mod; // r + a < 2*mod，安全
    a = (a + a) % mod; // a + a < 2*mod，安全
    b = Math.floor(b / 2);
  }
  return r;
}

/**
 * 快速幂取模 - 迭代版本（推荐）
 * @param {number} base - 底数（可为负数）
 * @param {number} exp - 指数（非负整数）
 * @param {number} mod - 模数（正整数）
 * @returns {number} (base^exp) % mod
 */
function fastPow(base, exp, mod) {
  if (mod <= 0) throw new Error("mod must be positive");
  let result = 1 % mod; // 处理 mod === 1 的情况
  base = ((base % mod) + mod) % mod; // 规整到 [0, mod)，处理负数
  while (exp > 0) {
    if (exp & 1) result = mulMod(result, base, mod); // 当前位为 1，累乘
    base = mulMod(base, base, mod); // base 自乘
    exp = Math.floor(exp / 2); // 右移一位（支持大指数）
  }
  return result;
}

/**
 * 快速幂取模 - 递归版本
 * @param {number} base
 * @param {number} exp
 * @param {number} mod
 * @returns {number}
 */
function fastPowRecursive(base, exp, mod) {
  if (mod <= 0) throw new Error("mod must be positive");
  if (exp === 0) return 1 % mod;
  base = ((base % mod) + mod) % mod;
  const half = fastPowRecursive(base, Math.floor(exp / 2), mod);
  const t = mulMod(half, half, mod);
  return exp & 1 ? mulMod(t, base, mod) : t;
}

/**
 * 不取模的快速幂（仅对小结果适用，用于演示原理；大指数会溢出丢失精度）
 * @param {number} base
 * @param {number} exp
 * @returns {number}
 */
function powNoMod(base, exp) {
  let result = 1;
  let b = base;
  while (exp > 0) {
    if (exp & 1) result *= b;
    b *= b;
    exp = Math.floor(exp / 2);
  }
  return result;
}

// ===== 测试 =====
const P = 1000000007;
console.log("2^10 % 1e9+7:", fastPow(2, 10, P)); // 1024
console.log("3^0 % 7:", fastPow(3, 0, 7)); // 1
console.log("0^5 % 7:", fastPow(0, 5, 7)); // 0
console.log("5^3 % 1:", fastPow(5, 3, 1)); // 0（任意数模 1 都是 0）
console.log("(-2)^3 % 5:", fastPow(-2, 3, 5)); // 2（-8 ≡ 2 mod 5）
console.log("(-2)^4 % 5:", fastPow(-2, 4, 5)); // 1（16 ≡ 1 mod 5）

// 迭代与递归一致性
console.log("iter 2^100 % 1e9+7:", fastPow(2, 100, P));
console.log("rec  2^100 % 1e9+7:", fastPowRecursive(2, 100, P));

// 与 BigInt 对拍验证正确性（仅正底数，避免 BigInt 取模符号差异）
const check = (b, e, m) =>
  fastPow(b, e, m) === Number(BigInt(b) ** BigInt(e) % BigInt(m));
console.log("2^100 与 BigInt 一致:", check(2, 100, P)); // true
console.log("2^1000 与 BigInt 一致:", check(2, 1000, P)); // true
console.log("3^999 与 BigInt 一致:", check(3, 999, P)); // true
console.log("7^10000 与 BigInt 一致:", check(7, 10000, P)); // true

// 大指数用例
const bigExp = 1000000;
const expected = Number(BigInt(2) ** BigInt(bigExp) % BigInt(P));
console.log("2^1000000 % 1e9+7:", fastPow(2, bigExp, P), "expect:", expected); // 235042059

console.log("powNoMod(2,10):", powNoMod(2, 10)); // 1024
console.log("powNoMod(3,5):", powNoMod(3, 5)); // 243
