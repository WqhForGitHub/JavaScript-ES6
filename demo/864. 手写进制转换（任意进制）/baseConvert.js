/**
 * 手写进制转换（任意进制）
 * 说明：将数字字符串在任意进制（2-36）之间转换，支持自定义字符集，支持大整数。
 *
 * 思路：
 *   1. 源进制 -> 十进制：result = result * fromBase + digit（大整数逐位累加）
 *   2. 十进制 -> 目标进制：反复对 toBase 取余、整除，余数倒序排列
 */

/** 默认字符集：0-9 + A-Z，可表示 2-36 进制 */
const DEFAULT_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
 * 大整数（十进制字符串）乘以一个小整数（0-36）
 * @param {string} num 十进制非负整数字符串
 * @param {number} small 0-36
 * @returns {string}
 */
function mulSmall(num, small) {
  if (small === 0 || num === "0") return "0";
  let carry = 0;
  let res = "";
  for (let i = num.length - 1; i >= 0; i--) {
    const product = (num.charCodeAt(i) - 48) * small + carry;
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
 * 大整数（十进制字符串）加上一个小整数（0-36）
 * @param {string} num 十进制非负整数字符串
 * @param {number} small 0-36
 * @returns {string}
 */
function addSmall(num, small) {
  if (small === 0) return num;
  let carry = small;
  let res = "";
  let i = num.length - 1;
  while (i >= 0 || carry) {
    const d = (i >= 0 ? num.charCodeAt(i--) - 48 : 0) + carry;
    res = (d % 10) + res;
    carry = Math.floor(d / 10);
  }
  return res;
}

/**
 * 大整数（十进制字符串）除以一个小整数，返回 [商, 余数]
 * @param {string} num 十进制非负整数字符串
 * @param {number} small 除数（2-36）
 * @returns {[string, number]} [quotient, remainder]
 */
function divmodSmall(num, small) {
  let q = "";
  let rem = 0;
  for (let i = 0; i < num.length; i++) {
    const cur = rem * 10 + (num.charCodeAt(i) - 48);
    q += Math.floor(cur / small);
    rem = cur % small;
  }
  return [trimZero(q), rem];
}

/**
 * 将任意进制字符串转换为十进制字符串
 * @param {string} num 源进制数字字符串（不含符号）
 * @param {number} base 源进制 2-36
 * @param {string} digits 字符集
 * @returns {string} 十进制字符串
 */
function toDecimal(num, base, digits) {
  let result = "0";
  for (let i = 0; i < num.length; i++) {
    let d = digits.indexOf(num[i]);
    if (d < 0) d = digits.indexOf(num[i].toUpperCase()); // 兼容小写输入（默认字符集为大写）
    if (d < 0 || d >= base)
      throw new Error(`非法字符 "${num[i]}"（进制 ${base}）`);
    result = addSmall(mulSmall(result, base), d);
  }
  return result;
}

/**
 * 将十进制字符串转换为目标进制字符串
 * @param {string} decimal 十进制非负整数字符串
 * @param {number} base 目标进制 2-36
 * @param {string} digits 字符集
 * @returns {string}
 */
function fromDecimal(decimal, base, digits) {
  if (decimal === "0") return digits[0];
  let num = decimal;
  let res = "";
  while (num !== "0") {
    const [q, r] = divmodSmall(num, base);
    res = digits[r] + res;
    num = q;
  }
  return res;
}

/**
 * 任意进制转换
 * @param {string} num 源数字字符串（可带正负号）
 * @param {number} fromBase 源进制（2-36）
 * @param {number} toBase 目标进制（2-36）
 * @param {string} [digits=DEFAULT_DIGITS] 字符集，长度需 >= max(fromBase, toBase)
 * @returns {string} 目标进制字符串
 */
function baseConvert(num, fromBase, toBase, digits = DEFAULT_DIGITS) {
  if (typeof num !== "string") num = String(num);
  if (fromBase < 2 || fromBase > digits.length)
    throw new Error("源进制超出范围");
  if (toBase < 2 || toBase > digits.length) throw new Error("目标进制超出范围");

  // 处理符号
  let sign = "";
  if (num[0] === "-") {
    sign = "-";
    num = num.slice(1);
  } else if (num[0] === "+") {
    num = num.slice(1);
  }

  const dec = toDecimal(num, fromBase, digits);
  const result = fromDecimal(dec, toBase, digits);
  return result === digits[0] ? digits[0] : sign + result;
}

// ===== 测试 =====
console.log("===== 进制转换 测试 =====");
console.log("255 (10) -> 16 =", baseConvert("255", 10, 16), " (期望 FF)");
console.log("FF (16) -> 2 =", baseConvert("FF", 16, 2), " (期望 11111111)");
console.log("1010 (2) -> 10 =", baseConvert("1010", 2, 10), " (期望 10)");
console.log("ZZ (36) -> 10 =", baseConvert("ZZ", 36, 10), " (期望 1295)");
console.log("1295 (10) -> 36 =", baseConvert("1295", 10, 36), " (期望 ZZ)");
console.log("1000 (10) -> 8 =", baseConvert("1000", 10, 8), " (期望 1750)");
console.log("1750 (8) -> 10 =", baseConvert("1750", 8, 10), " (期望 1000)");
console.log("-255 (10) -> 16 =", baseConvert("-255", 10, 16), " (期望 -FF)");
console.log("0 (10) -> 2 =", baseConvert("0", 10, 2), " (期望 0)");
console.log(
  "大数 12345678901234567890 (10) -> 16 =",
  baseConvert("12345678901234567890", 10, 16),
);
// 期望 AB54A98CEB1F0AD2

// 往返转换一致性
const bigDec = "9876543210123456789";
const hex = baseConvert(bigDec, 10, 16);
console.log("往返转换:", baseConvert(hex, 16, 10) === bigDec, " (期望 true)");

// 与原生 BigInt 交叉验证（仅用于测试）
console.log(
  "交叉验证:",
  baseConvert("9999999999999999", 10, 2) ===
    BigInt(9999999999999999n).toString(2),
);

// 自定义字符集示例：用 'abcdef' 作为 6 进制符号（a=0, b=1, ..., f=5）
// 注意：digits 同时用于源进制与目标进制，长度需 >= max(fromBase, toBase)
const customDigits = "abcdef";
// ffff(6进制) = 5*216 + 5*36 + 5*6 + 5 = 1295
const customBin = baseConvert("ffff", 6, 2, customDigits); // 6 -> 2（用 a/b 表示 0/1）
console.log("自定义字符集 ffff (6->2) =", customBin, " (期望 babaaaabbbb)");
console.log(
  "自定义字符集往返 (2->6) =",
  baseConvert(customBin, 2, 6, customDigits),
  " (期望 ffff)",
);
