/**
 * 手写验证手机号
 *
 * 中国大陆手机号规则：
 *   - 共 11 位数字
 *   - 第 1 位固定为 1
 *   - 第 2 位为 3-9（目前运营商号段：13x-19x）
 *   - 后 9 位为任意数字
 *
 * 这里提供两个版本：
 *   - validatePhoneStrict：严格校验号段（推荐）
 *   - validatePhoneLoose：宽松校验（仅 1 开头 11 位）
 *
 * 实现思路：用正则 ^1[3-9]\d{9}$ 匹配。
 */

function validatePhoneStrict(phone) {
  if (typeof phone !== "string" && typeof phone !== "number") return false;
  const str = String(phone).replace(/[\s-]/g, ""); // 去除空格、横线
  return /^1[3-9]\d{9}$/.test(str);
}

function validatePhoneLoose(phone) {
  if (phone == null) return false;
  const str = String(phone).replace(/[\s-]/g, "");
  return /^1\d{10}$/.test(str);
}

// ===== 测试 =====
console.log("strict 13812345678:", validatePhoneStrict("13812345678")); // true
console.log("strict 15812345678:", validatePhoneStrict("15812345678")); // true
console.log("strict 19912345678:", validatePhoneStrict("19912345678")); // true
console.log("strict 12345678901:", validatePhoneStrict("12345678901")); // false（号段非法）
console.log("strict 10 位:", validatePhoneStrict("1381234567")); // false
console.log("strict 12 位:", validatePhoneStrict("138123456789")); // false
console.log("strict 含空格:", validatePhoneStrict("138 1234 5678")); // true
console.log("strict 含横线:", validatePhoneStrict("138-1234-5678")); // true
console.log("strict 非数字:", validatePhoneStrict("1381234567a")); // false
console.log("strict 数字类型:", validatePhoneStrict(13812345678)); // true
console.log("strict 2 开头:", validatePhoneStrict("23812345678")); // false
console.log("strict 110 开头:", validatePhoneStrict("11012345678")); // false（第二位1不在3-9）
console.log("strict null:", validatePhoneStrict(null)); // false

console.log("loose 12345678901:", validatePhoneLoose("12345678901")); // true（宽松允许）
console.log("loose 11 位含字母:", validatePhoneLoose("1381234567a")); // false
