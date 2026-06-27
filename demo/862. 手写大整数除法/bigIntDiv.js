/**
 * 手写大整数除法
 * 说明：使用字符串模拟竖式除法（long division），不使用 BigInt。
 *      返回 [商, 余数]，商向零取整，余数符号与被除数一致，处理除零错误。
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
 * 竖式法：逐位将被除数加入当前余数，二分求商位（0-9），再做减法
 * @param {string} a 被除数（非负，无前导零）
 * @param {string} b 除数（非负，无前导零，不为 "0"）
 * @returns {[string, string]} [quotient, remainder]
 */
function divAbs(a, b) {
  // 被除数小于除数：商 0，余数为被除数
  if (cmpAbs(a, b) < 0) return ["0", a];

  let quotient = "";
  let cur = "0";
  for (let i = 0; i < a.length; i++) {
    // 将下一位加入当前余数末尾
    cur = cur === "0" ? a[i] : cur + a[i];
    cur = trimZero(cur);

    // 二分查找最大的商位 d (0..9)，使 d * b <= cur
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
    if (d > 0) {
      cur = subAbs(cur, mulDigit(b, d));
    }
  }
  quotient = trimZero(quotient);
  return [quotient, cur];
}

/**
 * 大整数除法（支持负数）
 * @param {string} a 被除数
 * @param {string} b 除数
 * @returns {[string, string]} [quotient, remainder]
 *   - 商符号：异号为负（向零取整）
 *   - 余数符号：与被除数一致
 */
function bigIntDiv(a, b) {
  if (typeof a !== "string") a = String(a);
  if (typeof b !== "string") b = String(b);

  // 解析符号
  let signA = 1;
  let signB = 1;
  if (a[0] === "-") {
    signA = -1;
    a = a.slice(1);
  } else if (a[0] === "+") {
    a = a.slice(1);
  }
  if (b[0] === "-") {
    signB = -1;
    b = b.slice(1);
  } else if (b[0] === "+") {
    b = b.slice(1);
  }

  a = trimZero(a);
  b = trimZero(b);
  if (b === "0") throw new Error("Division by zero");

  // 0 / x = 0 余 0
  if (a === "0") return ["0", "0"];

  const [q, r] = divAbs(a, b);

  // 商符号
  let quotient = q;
  if (quotient !== "0" && signA * signB === -1) quotient = "-" + quotient;
  // 余数符号（与被除数一致）
  let remainder = r;
  if (remainder !== "0" && signA === -1) remainder = "-" + remainder;

  return [quotient, remainder];
}

// ===== 测试 =====
console.log("===== 大整数除法 测试 =====");
console.log("100 / 7 =", bigIntDiv("100", "7"), ' (期望 ["14", "2"])');
console.log("-100 / 7 =", bigIntDiv("-100", "7"), ' (期望 ["-14", "-2"])');
console.log("100 / -7 =", bigIntDiv("100", "-7"), ' (期望 ["-14", "2"])');
console.log("-100 / -7 =", bigIntDiv("-100", "-7"), ' (期望 ["14", "-2"])');
console.log("5 / 10 =", bigIntDiv("5", "10"), ' (期望 ["0", "5"])');
console.log("0 / 123 =", bigIntDiv("0", "123"), ' (期望 ["0", "0"])');
console.log(
  "123456789 / 123 =",
  bigIntDiv("123456789", "123"),
  ' (期望 ["1003713", "90"])',
);
console.log(
  "100000000000000000000 / 3 =",
  bigIntDiv("100000000000000000000", "3"),
);
// 期望 ["33333333333333333333", "1"]

// 除以零测试
try {
  bigIntDiv("123", "0");
} catch (e) {
  console.log("除以零错误:", e.message);
}

// 与原生 BigInt 交叉验证（仅用于测试，实现未使用 BigInt）
const A = "9876543210123456789";
const B = "123456789";
const [q, r] = bigIntDiv(A, B);
console.log("交叉验证商:", q === String(BigInt(A) / BigInt(B)));
console.log("交叉验证余:", r === String(BigInt(A) % BigInt(B)));
