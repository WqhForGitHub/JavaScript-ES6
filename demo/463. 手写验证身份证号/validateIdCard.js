/**
 * 手写验证身份证号
 *
 * 中国大陆 18 位居民身份证号规则：
 *   - 前 6 位：地区码
 *   - 第 7-14 位：出生日期 YYYYMMDD
 *   - 第 15-17 位：顺序码（奇数男、偶数女）
 *   - 第 18 位：校验码，由前 17 位按权重模 11 算出，可能为 X
 *
 * 校验码算法：
 *   权重 W = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2]
 *   sum = Σ(数字i * Wi)
 *   校验码 = ['1','0','X','9','8','7','6','5','4','3','2'][sum % 11]
 *
 * 实现思路：
 *   1. 正则校验前 17 位数字 + 末位数字或 X
 *   2. 校验出生日期真实有效（含闰年）
 *   3. 计算校验码比对
 */

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CODES = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

function calcCheckCode(id17) {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id17[i], 10) * WEIGHTS[i];
  }
  return CHECK_CODES[sum % 11];
}

function isValidDate(year, month, day) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function validateIdCard(id) {
  if (typeof id !== "string") return false;
  const str = id.trim().toUpperCase();

  // 基本格式：17 位数字 + 1 位数字或 X
  if (!/^\d{17}[\dX]$/.test(str)) return false;

  // 校验出生日期
  const year = str.slice(6, 10);
  const month = str.slice(10, 12);
  const day = str.slice(12, 14);
  if (!isValidDate(year, month, day)) return false;

  // 年份范围合理性
  const y = parseInt(year, 10);
  const curYear = new Date().getFullYear();
  if (y < 1900 || y > curYear) return false;

  // 校验码
  const expected = calcCheckCode(str.slice(0, 17));
  return str[17] === expected;
}

// 辅助：从身份证提取信息
function parseIdCard(id) {
  if (!validateIdCard(id)) return null;
  const str = id.trim().toUpperCase();
  const year = str.slice(6, 10);
  const month = str.slice(10, 12);
  const day = str.slice(12, 14);
  const seq = parseInt(str.slice(14, 17), 10);
  return {
    birthday: `${year}-${month}-${day}`,
    gender: seq % 2 === 1 ? "male" : "female",
    checkCode: str[17],
  };
}

// ===== 测试 =====
// 构造一个合法身份证：110105 (北京) 19491001 (1949-10-01) 001 (男) 校验码
function buildValidId(prefix17) {
  return prefix17 + calcCheckCode(prefix17);
}

const validId = buildValidId("11010519491001001");
console.log("合法身份证:", validId); // 11010519491001001X（校验码 X）
console.log("validate:", validateIdCard(validId)); // true

const validId2 = buildValidId("44030419900307882");
console.log("合法2:", validId2, validateIdCard(validId2)); // ... true

console.log("长度不足:", validateIdCard("1101051949100100")); // false
console.log("含非法字符:", validateIdCard("1101051949100100A1")); // false
console.log(
  "非法日期2月30:",
  validateIdCard(buildValidId("11010520000230001")),
); // false
console.log(
  "闰年2月29合法:",
  validateIdCard(buildValidId("11010520000229001")),
); // true
console.log(
  "平年2月29非法:",
  validateIdCard(buildValidId("11010519000229001")),
); // false
console.log("校验码错误:", validateIdCard("110105194910010011")); // false（应尾 X）
console.log("小写x也合法:", validateIdCard(validId.slice(0, 17) + "x")); // true
console.log("年份未来:", validateIdCard(buildValidId("11010520990101001"))); // false（2099 > 当前年，会随时间变化）

console.log("parse:", parseIdCard(validId)); // { birthday: '1949-10-01', gender: 'male', checkCode: 'X' }
console.log("parse female:", parseIdCard(buildValidId("11010519491001002"))); // gender: 'female'
