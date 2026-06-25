/**
 * 手写快速幂
 *
 * 高效计算 x^n（n 为整数）。相比朴素连乘 O(n)，快速幂利用二进制拆分
 * 将复杂度降到 O(log n)。
 *
 * 核心思想（迭代版）：
 *   x^n = (x^2)^(n/2)              （n 为偶）
 *   x^n = x * (x^2)^((n-1)/2)      （n 为奇）
 *   等价于：把 n 写成二进制，逐位判断，当前位为 1 就把 base 累乘进结果，
 *   每轮 base 自乘（平方），n 右移一位。
 *
 * 本文件提供三种版本：
 *   1. fastPow(x, n)        —— 普通浮点/整数（n 在安全范围内）
 *   2. fastPowBig(x, n)     —— 基于 BigInt，支持任意大指数
 *   3. fastPowMod(x, n, m)  —— 模意义下的快速幂（数论常用，防溢出）
 */

// 1. 普通快速幂（n 为整数，可为负）
function fastPow(x, n) {
  if (n < 0) {
    // 负指数：x^(-n) = 1 / x^n
    return 1 / fastPowPositive(x, -n);
  }
  return fastPowPositive(x, n);
}

function fastPowPositive(x, n) {
  let result = 1;
  let base = x;
  let exp = n;
  while (exp > 0) {
    if (exp & 1) {
      // 当前二进制位为 1，累乘 base
      result *= base;
    }
    base *= base; // base 平方
    exp = Math.floor(exp / 2); // 用除法支持大于 2^31 的指数
  }
  return result;
}

// 2. 递归版快速幂（便于理解）
function fastPowRecursive(x, n) {
  if (n === 0) return 1;
  if (n < 0) return 1 / fastPowRecursive(x, -n);
  const half = fastPowRecursive(x, Math.floor(n / 2));
  return n % 2 === 0 ? half * half : half * half * x;
}

// 3. BigInt 版快速幂：支持任意大整数底数与指数
function fastPowBig(x, n) {
  if (typeof x !== "bigint") x = BigInt(x);
  if (typeof n !== "bigint") n = BigInt(n);
  const negative = n < 0n;
  if (negative) n = -n;
  let result = 1n;
  let base = x;
  while (n > 0n) {
    if (n & 1n) result *= base;
    base *= base;
    n >>= 1n;
  }
  return negative ? 1n / result : result;
}

// 4. 模意义快速幂：(x^n) mod m，常用于数论与密码学，避免大数溢出
function fastPowMod(x, n, m) {
  if (n < 0) {
    // 负指数模幂需要求模逆元，这里简化处理为正指数
    return fastPowModPositive(x, -n, m);
  }
  return fastPowModPositive(x, n, m);
}

function fastPowModPositive(x, n, m) {
  if (m === 1) return 0; // 任意数模 1 为 0
  let result = 1;
  let base = ((x % m) + m) % m; // 规范化到 [0, m)
  let exp = n;
  while (exp > 0) {
    if (exp & 1) {
      result = (result * base) % m;
    }
    base = (base * base) % m;
    exp = Math.floor(exp / 2);
  }
  return result;
}

// --- 测试 ---

console.log("fastPow(2, 10):", fastPow(2, 10)); // 1024
console.log("fastPow(2, 0):", fastPow(2, 0)); // 1
console.log("fastPow(3, 5):", fastPow(3, 5)); // 243
console.log("fastPow(2, -2):", fastPow(2, -2)); // 0.25
console.log("fastPow(5, 3):", fastPow(5, 3)); // 125
console.log("fastPow(1.5, 3):", fastPow(1.5, 3)); // 3.375

console.log("fastPowRecursive(2, 10):", fastPowRecursive(2, 10)); // 1024
console.log("fastPowRecursive(3, 5):", fastPowRecursive(3, 5)); // 243

console.log("fastPowBig(2n, 100n):", fastPowBig(2n, 100n));
// 1267650600228229401496703205376
console.log("fastPowBig(2, 64):", fastPowBig(2, 64)); // 18446744073709551616

console.log("fastPowMod(2, 10, 1000):", fastPowMod(2, 10, 1000)); // 24 (1024 % 1000)
console.log("fastPowMod(3, 100, 7):", fastPowMod(3, 100, 7)); // 4
console.log("fastPowMod(7, 256, 13):", fastPowMod(7, 256, 13)); // 9
console.log("fastPowMod(2, 0, 5):", fastPowMod(2, 0, 5)); // 1

// 与 Math.pow / BigInt 对照验证
console.log("Math.pow check:", Math.pow(2, 10)); // 1024
console.log("BigInt check:", (2n ** 100n).toString());
// '1267650600228229401496703205376'  (与 fastPowBig 一致)
