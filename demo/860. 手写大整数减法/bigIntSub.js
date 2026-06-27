/**
 * 手写大整数减法
 * 使用字符串模拟减法（不使用 BigInt），支持：
 *   - 任意长度
 *   - 不同长度的两个数
 *   - 借位处理
 *   - 负数（含异号相减，转化为加法）
 *   - 结果为负数
 *
 * 实现思路：
 *   a - b = a + (-b)，因此把减法转化为加法：
 *   1) 翻转 b 的符号后调用大整数加法逻辑。
 *   2) 内部仍分同号/异号处理：同号相减退化为绝对值减法；异号相减退化为绝对值加法。
 *
 *   核心运算 subMag(a, b)：a >= b（均非负），从个位起逐位相减并处理借位。
 */

// 解析字符串：返回 { neg, mag }，mag 为无前导 0 的纯数字字符串
function parseNum(s) {
  s = String(s).trim();
  let neg = false;
  if (s[0] === "-") {
    neg = true;
    s = s.slice(1);
  } else if (s[0] === "+") {
    s = s.slice(1);
  }
  s = s.replace(/^0+/, "") || "0";
  return { neg, mag: s };
}

// 比较两个非负整数字符串大小
function cmpMag(a, b) {
  if (a.length !== b.length) return a.length < b.length ? -1 : 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// 两个非负整数字符串相加（逐位 + 进位）
function addMag(a, b) {
  let i = a.length - 1,
    j = b.length - 1,
    carry = 0;
  let res = "";
  while (i >= 0 || j >= 0 || carry) {
    const da = i >= 0 ? a.charCodeAt(i--) - 48 : 0;
    const db = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    const sum = da + db + carry;
    res = String(sum % 10) + res;
    carry = sum >= 10 ? 1 : 0;
  }
  return res.replace(/^0+/, "") || "0";
}

// 两个非负整数字符串相减（要求 a >= b，处理借位）
function subMag(a, b) {
  let i = a.length - 1,
    j = b.length - 1,
    borrow = 0;
  let res = "";
  while (i >= 0) {
    const da = a.charCodeAt(i--) - 48;
    const db = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    let d = da - borrow - db;
    if (d < 0) {
      d += 10;
      borrow = 1;
    } else borrow = 0;
    res = String(d) + res;
  }
  return res.replace(/^0+/, "") || "0";
}

// 大整数加法（内部复用：减法 a - b 等价于 a + (-b)）
function bigIntAdd(a, b) {
  const A = parseNum(a);
  const B = parseNum(b);
  if (A.neg === B.neg) {
    const mag = addMag(A.mag, B.mag);
    if (mag === "0") return "0";
    return (A.neg ? "-" : "") + mag;
  }
  const c = cmpMag(A.mag, B.mag);
  if (c === 0) return "0";
  let mag, neg;
  if (c > 0) {
    mag = subMag(A.mag, B.mag);
    neg = A.neg;
  } else {
    mag = subMag(B.mag, A.mag);
    neg = B.neg;
  }
  if (mag === "0") return "0";
  return (neg ? "-" : "") + mag;
}

// 大整数减法入口：a - b = a + (-b)
function bigIntSub(a, b) {
  const B = parseNum(b);
  const flipped = B.mag === "0" ? "0" : B.neg ? B.mag : "-" + B.mag;
  return bigIntAdd(a, flipped);
}

// ===== 测试 =====
console.log("456 - 123 =", bigIntSub("456", "123")); // 333
console.log("123 - 456 =", bigIntSub("123", "456")); // -333
console.log("1000 - 1 =", bigIntSub("1000", "1")); // 999
console.log("1 - 1000 =", bigIntSub("1", "1000")); // -999
console.log("500 - 500 =", bigIntSub("500", "500")); // 0
console.log("0 - 0 =", bigIntSub("0", "0")); // 0
console.log("0 - 5 =", bigIntSub("0", "5")); // -5
console.log("5 - 0 =", bigIntSub("5", "0")); // 5

// 不同长度
console.log("1000000 - 1 =", bigIntSub("1000000", "1")); // 999999
console.log("1 - 1000000 =", bigIntSub("1", "1000000")); // -999999

// 涉及负数
console.log("-123 - 456 =", bigIntSub("-123", "456")); // -579
console.log("123 - -456 =", bigIntSub("123", "-456")); // 579
console.log("-123 - -456 =", bigIntSub("-123", "-456")); // 333
console.log("-456 - -123 =", bigIntSub("-456", "-123")); // -333
console.log("5 - -5 =", bigIntSub("5", "-5")); // 10
console.log("-5 - 5 =", bigIntSub("-5", "5")); // -10
console.log("-5 - -5 =", bigIntSub("-5", "-5")); // 0

// 带正号 / 前导 0
console.log("+456 - +123 =", bigIntSub("+456", "+123")); // 333
console.log("000456 - 0123 =", bigIntSub("000456", "0123")); // 333

// 借位链
console.log("10000 - 1 =", bigIntSub("10000", "1")); // 9999
console.log(
  "100000000000 - 99999999999 =",
  bigIntSub("100000000000", "99999999999"),
); // 1

// 超大数（与 BigInt 对拍）
const huge = "9".repeat(50);
console.log(
  "(10^50-1) - (10^50-2) =",
  bigIntSub(huge, huge.slice(0, -1) + "8"),
); // 1
