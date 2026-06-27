/**
 * 手写大整数乘法
 * 说明：使用字符串模拟竖式乘法（grade-school algorithm），不使用 BigInt。
 *      逐位相乘并累加进位，支持正负号、前导零处理，返回字符串形式的结果。
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
 * @param {string} s 非负整数字符串
 * @returns {string}
 */
function trimZero(s) {
  let i = 0;
  while (i < s.length - 1 && s[i] === "0") i++;
  return s.slice(i);
}

/**
 * 两个非负整数字符串相乘（竖式法）
 * 用 arr[i+j+1] 累积 a 的第 i 位与 b 的第 j 位的乘积，最后统一处理进位。
 * 时间复杂度 O(n*m)
 * @param {string} a 非负整数字符串
 * @param {string} b 非负整数字符串
 * @returns {string}
 */
function mulAbs(a, b) {
  if (a === "0" || b === "0") return "0";
  a = trimZero(a);
  b = trimZero(b);
  const m = a.length;
  const n = b.length;
  const arr = new Array(m + n).fill(0);

  for (let i = m - 1; i >= 0; i--) {
    const da = a.charCodeAt(i) - 48;
    for (let j = n - 1; j >= 0; j--) {
      const db = b.charCodeAt(j) - 48;
      const product = da * db + arr[i + j + 1];
      arr[i + j + 1] = product % 10;
      arr[i + j] += Math.floor(product / 10);
    }
  }

  // 跳过前导零
  let k = 0;
  while (k < arr.length - 1 && arr[k] === 0) k++;
  return arr.slice(k).join("");
}

/**
 * 大整数乘法（支持负数）
 * @param {string} a 整数字符串
 * @param {string} b 整数字符串
 * @returns {string} 乘积字符串
 */
function bigIntMul(a, b) {
  if (typeof a !== "string") a = String(a);
  if (typeof b !== "string") b = String(b);

  // 处理符号
  let negA = a[0] === "-";
  let negB = b[0] === "-";
  if (negA) a = a.slice(1);
  if (negB) b = b.slice(1);
  // 去除可能的正号
  if (a[0] === "+") a = a.slice(1);
  if (b[0] === "+") b = b.slice(1);

  // 去前导零
  a = trimZero(a);
  b = trimZero(b);

  const abs = mulAbs(a, b);
  if (abs === "0") return "0"; // 零不带符号
  // 异号为负
  return (negA !== negB ? "-" : "") + abs;
}

// ===== 测试 =====
console.log("===== 大整数乘法 测试 =====");
console.log("123 * 456 =", bigIntMul("123", "456"), " (期望 56088)");
console.log("999 * 999 =", bigIntMul("999", "999"), " (期望 998001)");
console.log("0 * 12345 =", bigIntMul("0", "12345"), " (期望 0)");
console.log("-123 * 456 =", bigIntMul("-123", "456"), " (期望 -56088)");
console.log("123 * -456 =", bigIntMul("123", "-456"), " (期望 -56088)");
console.log("-123 * -456 =", bigIntMul("-123", "-456"), " (期望 56088)");
console.log("00123 * 0456 =", bigIntMul("00123", "0456"), " (期望 56088)");
console.log(
  "123456789 * 987654321 =",
  bigIntMul("123456789", "987654321"),
  " (期望 121932631112635269)",
);
console.log(
  "大数 1e20 * 1e20 =",
  bigIntMul("100000000000000000000", "100000000000000000000"),
);
// 期望 10000000000000000000000000000000000000000
console.log("大数 12345678901234567890 * 98765432109876543210 =");
console.log(" ", bigIntMul("12345678901234567890", "98765432109876543210"));

// 与原生 BigInt 交叉验证（仅用于测试，实现未使用 BigInt）
const x = "9876543210123456789";
const y = "1234567890123456789";
console.log("交叉验证:", bigIntMul(x, y) === String(BigInt(x) * BigInt(y)));
