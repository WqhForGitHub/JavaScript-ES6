/**
 * 手写最小公倍数（LCM）
 * 利用关系：LCM(a, b) = |a * b| / GCD(a, b)
 * 时间复杂度：O(log(min(a, b)))（取决于 GCD）
 * 边界：
 *   - 若 a、b 中存在 0，则 LCM = 0（0 与任何数没有非零公倍数）
 *   - 负数：LCM 总为非负数
 */

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  // 先除后乘，避免 a*b 溢出（在 JS 中数值较大时会丢失精度，但仍优于直接相乘）
  return Math.abs((a / gcd(a, b)) * b);
}

// 多个数的最小公倍数：依次两两求 LCM
function lcmOfArray(arr) {
  return arr.reduce((acc, cur) => lcm(acc, cur), 1);
}

// ===== 测试 =====
console.log("lcm(12, 8):", lcm(12, 8)); // 24
console.log("lcm(54, 24):", lcm(54, 24)); // 216
console.log("lcm(7, 5):", lcm(7, 5)); // 35（互质）
console.log("lcm(0, 9):", lcm(0, 9)); // 0（边界：含 0）
console.log("lcm(9, 0):", lcm(9, 0)); // 0
console.log("lcm(0, 0):", lcm(0, 0)); // 0
console.log("lcm(-12, 8):", lcm(-12, 8)); // 24（负数取绝对值）
console.log("lcm(-4, -6):", lcm(-4, -6)); // 12
console.log("lcmOfArray([4, 6, 8]):", lcmOfArray([4, 6, 8])); // 24
console.log("lcmOfArray([3, 5, 7]):", lcmOfArray([3, 5, 7])); // 105
