/**
 * 手写扩展欧几里得算法
 * 在求 gcd(a, b) 的同时求出整数 x, y 满足：a*x + b*y = gcd(a, b)
 * 递推关系：
 *   exgcd(a, b) 返回 {g, x, y}，其中 g = gcd(a, b)
 *   当 b === 0：g = a, x = 1, y = 0
 *   否则先求 {g, x', y'} = exgcd(b, a % b)
 *       则 x = y', y = x' - (a / b) * y'
 *
 * 应用：求解线性不定方程 a*x + b*y = c
 *   - 若 c % gcd(a, b) !== 0，则无整数解
 *   - 否则令 d = gcd(a, b)，先求 a*x0 + b*y0 = d 的一组解
 *     再放大 k = c / d，得 x = x0 * k, y = y0 * k
 *   - 通解：x = x0*k + (b/d)*t,  y = y0*k - (a/d)*t,  t ∈ Z
 */

function extGcd(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x: x1, y: y1 } = extGcd(b, a % b);
  // x = y1, y = x1 - (a / b) * y1
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

// 迭代版本
function extGcdIter(a, b) {
  let oldR = a,
    r = b;
  let oldS = 1,
    s = 0;
  let oldT = 0,
    t = 1;
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }
  return { g: oldR, x: oldS, y: oldT };
}

// 求解 a*x + b*y = c 的一组整数解，返回 {x, y} 或 null（无解）
function solveLinear(a, b, c) {
  const { g, x, y } = extGcd(a, b);
  if (c % g !== 0) return null; // 无整数解
  const k = c / g;
  return { x: x * k, y: y * k };
}

// ===== 测试 =====
const r1 = extGcd(30, 12);
console.log("extGcd(30,12):", r1, "校验 30*x+12*y =", 30 * r1.x + 12 * r1.y); // g=6

const r2 = extGcd(35, 15);
console.log("extGcd(35,15):", r2, "校验 =", 35 * r2.x + 15 * r2.y); // g=5

const r3 = extGcdIter(240, 46);
console.log("extGcdIter(240,46):", r3, "校验 =", 240 * r3.x + 46 * r3.y); // g=2

// 求解 47*x + 30*y = 1（47 与 30 互质，必有解）
const s1 = solveLinear(47, 30, 1);
console.log("solveLinear(47,30,1):", s1, "校验 =", 47 * s1.x + 30 * s1.y); // 1

// 求解 6*x + 9*y = 3
const s2 = solveLinear(6, 9, 3);
console.log("solveLinear(6,9,3):", s2, "校验 =", 6 * s2.x + 9 * s2.y); // 3

// 无解情况：6*x + 9*y = 5（gcd=3 不整除 5）
console.log("solveLinear(6,9,5):", solveLinear(6, 9, 5)); // null

// 求乘法逆元：a 模 m 的逆元 ax ≡ 1 (mod m) 等价于 ax + my = 1
const inv = extGcd(3, 11);
console.log("3 模 11 的逆元:", ((inv.x % 11) + 11) % 11); // 4，因为 3*4=12≡1 (mod 11)
