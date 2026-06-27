/**
 * 手写高精度开方
 * 说明：使用牛顿迭代法（Newton's method）求大整数（字符串形式）的整数平方根（下取整）。
 *      返回 floor(sqrt(n))，不使用 BigInt。
 *
 * 牛顿迭代公式：x_{k+1} = floor((x_k + floor(n / x_k)) / 2)
 * 当 x_{k+1} >= x_k 时收敛，此时 x_k 即为 floor(sqrt(n))。
 */

/**
 * 比较两个非负整数字符串（无前导零）的大小
 * @param {string} a
 * @param {string} b
 * @returns {number} 1: a>b, -1: a<b, 0: 相等
 */
function cmpAbs(a, b) {
  if (a.length !== b.length) return a.length > b.length ? 1 : -1;
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

/**
 * 去除前导零（"0" 保留为 "0"）
 * @param {string} s
 * @returns {string}
 */
function trimZero(s) {
  let i = 0;
  while (i < s.length - 1 && s[i] === "0") i++;
  return s.slice(i);
}

/**
 * 两个非负整数字符串相加
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function addAbs(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let res = "";
  while (i >= 0 || j >= 0 || carry) {
    const da = i >= 0 ? a.charCodeAt(i--) - 48 : 0;
    const db = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    const sum = da + db + carry;
    res = (sum % 10) + res;
    carry = Math.floor(sum / 10);
  }
  return res;
}

/**
 * 非负整数字符串减法（要求 a >= b），返回 a - b
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function subAbs(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let borrow = 0;
  let res = "";
  while (i >= 0) {
    const da = a.charCodeAt(i--) - 48;
    const db = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    let d = da - db - borrow;
    if (d < 0) {
      d += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    res = d + res;
  }
  return trimZero(res);
}

/**
 * 非负整数字符串乘以单个数字（0-9）
 * @param {string} num
 * @param {number} d
 * @returns {string}
 */
function mulDigit(num, d) {
  if (d === 0 || num === "0") return "0";
  let carry = 0;
  let res = "";
  for (let i = num.length - 1; i >= 0; i--) {
    const product = (num.charCodeAt(i) - 48) * d + carry;
    res = (product % 10) + res;
    carry = Math.floor(product / 10);
  }
  while (carry > 0) {
    res = (carry % 10) + res;
    carry = Math.floor(carry / 10);
  }
  return res;
}

/**
 * 非负大整数除法，返回 [商, 余数]
 * @param {string} a 被除数
 * @param {string} b 除数（不为 "0"）
 * @returns {[string, string]} [quotient, remainder]
 */
function divAbs(a, b) {
  if (cmpAbs(a, b) < 0) return ["0", a];
  let quotient = "";
  let cur = "0";
  for (let i = 0; i < a.length; i++) {
    cur = cur === "0" ? a[i] : cur + a[i];
    cur = trimZero(cur);
    let d = 0;
    let lo = 1;
    let hi = 9;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cmpAbs(mulDigit(b, mid), cur) <= 0) {
        d = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    quotient += d;
    if (d > 0) cur = subAbs(cur, mulDigit(b, d));
  }
  return [trimZero(quotient), cur];
}

/**
 * 求大整数 n 的整数平方根（下取整）
 * @param {string} n 非负整数字符串
 * @returns {string} floor(sqrt(n))
 */
function isqrt(n) {
  if (typeof n !== "string") n = String(n);
  // 处理符号
  if (n[0] === "-") throw new Error("负数不能开平方");
  if (n[0] === "+") n = n.slice(1);
  n = trimZero(n);

  if (n === "0" || n === "1") return n;

  // 初始猜测：10^ceil(d/2)，保证 x >= sqrt(n)
  const d = n.length;
  let x = "1";
  for (let i = 0; i < Math.ceil(d / 2); i++) x += "0";

  // 牛顿迭代
  while (true) {
    const [q] = divAbs(n, x); // q = floor(n / x)
    const sum = addAbs(x, q);
    const [next] = divAbs(sum, "2"); // next = floor((x + n/x) / 2)
    if (cmpAbs(next, x) >= 0) break; // 收敛
    x = next;
  }
  return x;
}

// ===== 测试 =====
console.log("===== 高精度开方 测试 =====");
console.log("isqrt(0) =", isqrt("0"), " (期望 0)");
console.log("isqrt(1) =", isqrt("1"), " (期望 1)");
console.log("isqrt(2) =", isqrt("2"), " (期望 1)");
console.log("isqrt(3) =", isqrt("3"), " (期望 1)");
console.log("isqrt(4) =", isqrt("4"), " (期望 2)");
console.log("isqrt(9) =", isqrt("9"), " (期望 3)");
console.log("isqrt(10) =", isqrt("10"), " (期望 3)");
console.log("isqrt(15) =", isqrt("15"), " (期望 3)");
console.log("isqrt(16) =", isqrt("16"), " (期望 4)");
console.log("isqrt(99) =", isqrt("99"), " (期望 9)");
console.log("isqrt(100) =", isqrt("100"), " (期望 10)");
console.log("isqrt(120) =", isqrt("120"), " (期望 10)");
console.log("isqrt(1000000) =", isqrt("1000000"), " (期望 1000)");
console.log("isqrt(1000001) =", isqrt("1000001"), " (期望 1000)");

// 大数测试：10^40 的平方根为 10^20
console.log(
  "isqrt(10^40) =",
  isqrt("1" + "0".repeat(40)),
  " (期望 1 后 20 个 0)",
);
// 12345678901234567890^2 的平方根应回到原数
const big = "12345678901234567890";
console.log(
  "isqrt(12345678901234567890^2) =",
  isqrt(String(BigInt(big) * BigInt(big))),
);

// 与原生 BigInt 交叉验证（仅用于测试，实现未使用 BigInt）
function check(n) {
  return isqrt(n) === String(bigIntSqrtRef(BigInt(n)));
}
function bigIntSqrtRef(v) {
  let x = v;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + v / x) / 2n;
  }
  return x;
}
console.log("交叉验证 999999999999999:", check("999999999999999"));
console.log("交叉验证 152399025:", isqrt("152399025"), " (期望 12345)"); // 12345^2 = 152399025
