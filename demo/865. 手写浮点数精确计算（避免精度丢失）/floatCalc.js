/**
 * 手写浮点数精确计算（避免精度丢失）
 * 说明：通过将浮点数按小数位数转换为整数进行运算，避免 IEEE 754 精度问题。
 *      例如修复 0.1 + 0.2 !== 0.3 这类问题。
 *
 * 核心思想：
 *   将浮点数 a 拆成 { int: 去掉小数点后的整数, decimals: 小数位数 }，
 *   加减法对齐小数位后做整数运算再除回去；
 *   乘法整数相乘、小数位相加；除法放大保留指定精度。
 *
 * 注意：内部用 JS Number 存整数，因此有效数字受 Number.MAX_SAFE_INTEGER 约束，
 *       适用于日常浮点精度场景（如金额、0.1+0.2 等）。
 */

/**
 * 将数字展开为普通十进制字符串（不含科学计数法）
 * @param {number|string} num
 * @returns {string} 形如 "-0.001" 或 "123.45" 或 "1200"
 */
function expandNumber(num) {
  let str = String(num);
  let sign = "";
  if (str[0] === "-" || str[0] === "+") {
    sign = str[0] === "-" ? "-" : "";
    str = str.slice(1);
  }
  if (str.includes("e") || str.includes("E")) {
    const [mant, expStr] = str.toLowerCase().split("e");
    const exp = parseInt(expStr, 10);
    let [intPart, fracPart = ""] = mant.split(".");
    fracPart = fracPart || "";
    const digits = intPart + fracPart;
    // 小数点在 digits 中从左数的位置（可能为负或超出）
    const pointPos = intPart.length + exp;
    let plain;
    if (pointPos <= 0) {
      plain = "0." + "0".repeat(-pointPos) + digits;
    } else if (pointPos >= digits.length) {
      plain = digits + "0".repeat(pointPos - digits.length);
    } else {
      plain = digits.slice(0, pointPos) + "." + digits.slice(pointPos);
    }
    return sign + plain;
  }
  return sign + str;
}

/**
 * 将浮点数转为 { int, decimals }
 * @param {number|string} num
 * @returns {{int: number, decimals: number}}
 */
function floatToInt(num) {
  const str = expandNumber(num);
  let sign = 1;
  let s = str;
  if (s[0] === "-") {
    sign = -1;
    s = s.slice(1);
  } else if (s[0] === "+") {
    s = s.slice(1);
  }
  let [intPart, fracPart = ""] = s.split(".");
  fracPart = fracPart || "";
  const digits = (intPart + fracPart).replace(/^0+/, "") || "0";
  return { int: parseInt(digits, 10) * sign, decimals: fracPart.length };
}

/**
 * 精确加法 a + b
 * @param {number|string} a
 * @param {number|string} b
 * @returns {number}
 */
function floatAdd(a, b) {
  const A = floatToInt(a);
  const B = floatToInt(b);
  const maxDec = Math.max(A.decimals, B.decimals);
  const ai = A.int * Math.pow(10, maxDec - A.decimals);
  const bi = B.int * Math.pow(10, maxDec - B.decimals);
  return (ai + bi) / Math.pow(10, maxDec);
}

/**
 * 精确减法 a - b
 * @param {number|string} a
 * @param {number|string} b
 * @returns {number}
 */
function floatSub(a, b) {
  const A = floatToInt(a);
  const B = floatToInt(b);
  const maxDec = Math.max(A.decimals, B.decimals);
  const ai = A.int * Math.pow(10, maxDec - A.decimals);
  const bi = B.int * Math.pow(10, maxDec - B.decimals);
  return (ai - bi) / Math.pow(10, maxDec);
}

/**
 * 精确乘法 a * b
 * @param {number|string} a
 * @param {number|string} b
 * @returns {number}
 */
function floatMul(a, b) {
  const A = floatToInt(a);
  const B = floatToInt(b);
  return (A.int * B.int) / Math.pow(10, A.decimals + B.decimals);
}

/**
 * 精确除法 a / b
 * 通过放大被除数保留指定小数位数，并对结果四舍五入到 precision 位
 * @param {number|string} a
 * @param {number|string} b
 * @param {number} [precision=10] 保留小数位数
 * @returns {number}
 */
function floatDiv(a, b, precision = 10) {
  const A = floatToInt(a);
  const B = floatToInt(b);
  if (B.int === 0) throw new Error("Division by zero");
  // a/b = (A.int / 10^Ad) / (B.int / 10^Bd) = (A.int * 10^Bd) / (B.int * 10^Ad)
  // 放大 10^precision 倍后做整数除法，再四舍五入
  const numerator = A.int * Math.pow(10, B.decimals + precision);
  const denominator = B.int * Math.pow(10, A.decimals);
  const rounded = Math.round(numerator / denominator);
  return rounded / Math.pow(10, precision);
}

// ===== 测试 =====
console.log("===== 浮点数精确计算 测试 =====");
console.log("原生 0.1 + 0.2 =", 0.1 + 0.2, " (存在精度问题)");
console.log(
  "精确 0.1 + 0.2 =",
  floatAdd(0.1, 0.2),
  "=== 0.3 ?",
  floatAdd(0.1, 0.2) === 0.3,
);
console.log(
  "精确 0.3 - 0.1 =",
  floatSub(0.3, 0.1),
  "=== 0.2 ?",
  floatSub(0.3, 0.1) === 0.2,
);
console.log(
  "精确 0.1 * 0.2 =",
  floatMul(0.1, 0.2),
  "=== 0.02 ?",
  floatMul(0.1, 0.2) === 0.02,
);
console.log(
  "精确 0.3 / 0.1 =",
  floatDiv(0.3, 0.1),
  "=== 3 ?",
  floatDiv(0.3, 0.1) === 3,
);

console.log("原生 0.7 + 0.1 =", 0.7 + 0.1, " (存在精度问题)");
console.log(
  "精确 0.7 + 0.1 =",
  floatAdd(0.7, 0.1),
  "=== 0.8 ?",
  floatAdd(0.7, 0.1) === 0.8,
);

console.log("原生 1.0 - 0.9 =", 1.0 - 0.9, " (存在精度问题)");
console.log(
  "精确 1.0 - 0.9 =",
  floatSub(1.0, 0.9),
  "=== 0.1 ?",
  floatSub(1.0, 0.9) === 0.1,
);

console.log(
  "精确 19.9 * 100 =",
  floatMul(19.9, 100),
  "=== 1990 ?",
  floatMul(19.9, 100) === 1990,
);
console.log(
  "精确 0.1 + 0.2 + 0.3 =",
  floatAdd(floatAdd(0.1, 0.2), 0.3),
  "=== 0.6 ?",
  floatAdd(floatAdd(0.1, 0.2), 0.3) === 0.6,
);

// 科学计数法输入
console.log(
  "精确 1.5e-3 + 2.5e-3 =",
  floatAdd(1.5e-3, 2.5e-3),
  "=== 0.004 ?",
  floatAdd(1.5e-3, 2.5e-3) === 0.004,
);

// 除法精度
console.log("精确 1 / 3 (precision=6) =", floatDiv(1, 3, 6), " (约 0.333333)");
console.log("精确 10 / 3 (precision=4) =", floatDiv(10, 3, 4), " (约 3.3333)");

// 除零测试
try {
  floatDiv(1, 0);
} catch (e) {
  console.log("除以零错误:", e.message);
}
