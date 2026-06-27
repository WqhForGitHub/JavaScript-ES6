/**
 * 手写大整数加法
 * 使用字符串模拟加法（不使用 BigInt），支持：
 *   - 任意长度
 *   - 不同长度的两个数
 *   - 进位处理
 *   - 负数（含异号相加，退化为减法）
 *
 * 实现思路：
 *   1) 解析符号 + 绝对值（去掉前导 0）
 *   2) 同号：绝对值相加，结果符号不变
 *   3) 异号：比较绝对值大小，用大绝对值减小绝对值，符号取绝对值较大者
 *   4) 从个位开始逐位相加，处理进位
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

// 比较两个非负整数字符串大小（按长度、再按字典序）
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

// 大整数加法入口
function bigIntAdd(a, b) {
  const A = parseNum(a);
  const B = parseNum(b);
  if (A.neg === B.neg) {
    const mag = addMag(A.mag, B.mag);
    if (mag === "0") return "0";
    return (A.neg ? "-" : "") + mag;
  }
  // 异号相加：转化为绝对值的减法
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

// ===== 测试 =====
console.log("123 + 456 =", bigIntAdd("123", "456")); // 579
console.log("999 + 1 =", bigIntAdd("999", "1")); // 1000
console.log("1 + 999 =", bigIntAdd("1", "999")); // 1000
console.log("123456789 + 987654321 =", bigIntAdd("123456789", "987654321")); // 1111111110
console.log("0 + 0 =", bigIntAdd("0", "0")); // 0
console.log("0 + 123 =", bigIntAdd("0", "123")); // 123
console.log("000123 + 0456 =", bigIntAdd("000123", "0456")); // 579（前导 0 处理）

// 不同长度
console.log("1 + 1000000 =", bigIntAdd("1", "1000000")); // 1000001
console.log("999999999999 + 1 =", bigIntAdd("999999999999", "1")); // 1000000000000

// 负数
console.log("-123 + 456 =", bigIntAdd("-123", "456")); // 333
console.log("123 + -456 =", bigIntAdd("123", "-456")); // -333
console.log("-456 + 123 =", bigIntAdd("-456", "123")); // -333
console.log("-123 + -456 =", bigIntAdd("-123", "-456")); // -579
console.log("-5 + 5 =", bigIntAdd("-5", "5")); // 0
console.log("5 + -5 =", bigIntAdd("5", "-5")); // 0
console.log("100 + -50 =", bigIntAdd("100", "-50")); // 50
console.log("50 + -100 =", bigIntAdd("50", "-100")); // -50
console.log("-100 + -200 =", bigIntAdd("-100", "-200")); // -300

// 带正号
console.log("+123 + +456 =", bigIntAdd("+123", "+456")); // 579

// 超大数相加（结果正确，与 BigInt 比对）
const hugeA = "9".repeat(50);
const hugeB = "1";
console.log("10^50-1 + 1 =", bigIntAdd(hugeA, hugeB)); // 1 后跟 50 个 0
