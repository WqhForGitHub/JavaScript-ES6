/**
 * 手写最大公约数（GCD，辗转相除法）
 * 辗转相除法（欧几里得算法）：gcd(a, b) = gcd(b, a % b)，直到 b === 0
 * 时间复杂度：O(log(min(a, b)))
 * 注意：GCD 的结果总为非负数；gcd(a, 0) = |a|；gcd(0, 0) = 0
 */

// 递归版本（处理负数：取绝对值参与运算）
function gcdRecursive(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b === 0) return a;
  return gcdRecursive(b, a % b);
}

// 迭代版本
function gcdIterative(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

// 通用入口：统一对外接口
function gcd(a, b) {
  return gcdIterative(a, b);
}

// ===== 测试 =====
console.log("gcd(12, 8):", gcd(12, 8)); // 4
console.log("gcd(54, 24):", gcd(54, 24)); // 6
console.log("gcdRecursive(48, 36):", gcdRecursive(48, 36)); // 12
console.log("gcd(17, 5):", gcd(17, 5)); // 1（互质）
console.log("gcd(0, 9):", gcd(0, 9)); // 9
console.log("gcd(9, 0):", gcd(9, 0)); // 9
console.log("gcd(0, 0):", gcd(0, 0)); // 0
console.log("gcd(-12, 8):", gcd(-12, 8)); // 4（负数取绝对值）
console.log("gcd(-24, -18):", gcd(-24, -18)); // 6
console.log("gcd(1071, 462):", gcd(1071, 462)); // 21
