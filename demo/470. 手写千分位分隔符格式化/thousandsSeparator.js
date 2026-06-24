/**
 * 手写千分位分隔符格式化
 *
 * 千分位分隔符：从个位起每三位加一个逗号，如 1234567 -> 1,234,567。
 * 需注意：
 *   - 小数部分不加逗号
 *   - 负数处理
 *   - 非数字输入
 *
 * 这里实现多种写法：
 *   - formatByRegex：正则反向断言（推荐，简洁）
 *   - formatByLoop：手动从右往左每 3 位插逗号
 *   - formatNumber：统一入口，支持小数与符号
 */

function formatNumber(num) {
  if (typeof num !== "number" && typeof num !== "string") return num;
  const str = String(num).trim();
  if (str === "" || str === "-") return str;

  // 拆分符号 / 整数 / 小数
  let sign = "";
  let intPart = str;
  let fracPart = "";

  if (str[0] === "-" || str[0] === "+") {
    sign = str[0];
    intPart = str.slice(1);
  }
  const dotIdx = intPart.indexOf(".");
  if (dotIdx !== -1) {
    fracPart = intPart.slice(dotIdx); // 含小数点
    intPart = intPart.slice(0, dotIdx);
  }

  // 整数部分加千分位
  intPart = formatByRegex(intPart);
  return sign + intPart + fracPart;
}

function formatByRegex(intStr) {
  // 反向断言：匹配位置前面是数字，且后面是 3 的倍数个数字直到结尾
  return String(intStr).replace(/\B(?=(\d{3})+$)/g, ",");
}

function formatByLoop(intStr) {
  let s = String(intStr);
  let result = "";
  let count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    result = s[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = "," + result;
    }
  }
  return result;
}

// 支持千分位是中文风格的工具（每4位）
function formatChineseWan(num) {
  const str = String(num).replace(/^-/, "");
  const sign = String(num).startsWith("-") ? "-" : "";
  const result = str.replace(/\B(?=(\d{4})+$)/g, ",");
  return sign + result;
}

// ===== 测试 =====
console.log(formatNumber(1234567)); // 1,234,567
console.log(formatNumber(123)); // 123
console.log(formatNumber(1234)); // 1,234
console.log(formatNumber(12)); // 12
console.log(formatNumber(0)); // 0
console.log(formatNumber(-1234567)); // -1,234,567
console.log(formatNumber(1234567.8910)); // 1,234,567.8910
console.log(formatNumber(-1234567.89)); // -1,234,567.89
console.log(formatNumber("1000000")); // 1,000,000
console.log(formatNumber("00123456")); // 00,123,456（前导零也按位处理）
console.log(formatNumber("+999999")); // +999,999

console.log("--- loop 版 ---");
console.log(formatByLoop("1234567")); // 1,234,567
console.log(formatByLoop("9876543210")); // 9,876,543,210

console.log("--- 中文万位 ---");
console.log(formatChineseWan(12345678)); // 1234,5678
console.log(formatChineseWan(-10000)); // -1,0000

// 与原生 toLocaleString 对比
console.log("原生:", (1234567.89).toLocaleString("en-US")); // 1,234,567.89
console.log("自实现 === 原生:", formatNumber(1234567.89) === (1234567.89).toLocaleString("en-US")); // true
