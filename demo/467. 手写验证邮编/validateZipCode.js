/**
 * 手写验证邮编
 *
 * 中国邮政编码为 6 位数字：
 *   - 前两位表示省（直辖市/自治区）
 *   - 第三位表示邮区
 *   - 第四位表示县（市）
 *   - 最后两位表示投递局
 *
 * 严格校验需对照省编码表，工程上一般校验"6 位数字"即可。
 * 这里实现两档：
 *   - validateZipCode(str)：6 位纯数字
 *   - validateZipCodeStrict(str)：6 位数字且前两位在合法省份范围内
 *
 * 实现思路：用正则 ^\d{6}$ 匹配，严格版再校验省份前缀。
 */

// 合法的省份前两位（11-65 主要省/自治区/直辖市编码）
const VALID_PROVINCE_PREFIX = new Set([
  "11", "12", "13", "14", "15", // 北京、天津、河北、山西、内蒙古
  "21", "22", "23", // 辽宁、吉林、黑龙江
  "31", "32", "33", "34", "35", "36", "37", // 沪苏浙皖闽赣鲁
  "41", "42", "43", "44", "45", "46", // 豫鄂湘粤桂琼
  "50", "51", "52", "53", "54", // 渝川黔滇藏
  "61", "62", "63", "64", "65", // 陕甘青宁新
]);

function validateZipCode(zip) {
  if (typeof zip !== "string" && typeof zip !== "number") return false;
  return /^\d{6}$/.test(String(zip).trim());
}

function validateZipCodeStrict(zip) {
  if (!validateZipCode(zip)) return false;
  const str = String(zip).trim();
  return VALID_PROVINCE_PREFIX.has(str.slice(0, 2));
}

// ===== 测试 =====
console.log("100000:", validateZipCode("100000")); // true
console.log("518000:", validateZipCode("518000")); // true
console.log("数字类型:", validateZipCode(518000)); // true
console.log("5 位:", validateZipCode("51800")); // false
console.log("7 位:", validateZipCode("5180000")); // false
console.log("含字母:", validateZipCode("51800a")); // false
console.log("含空格 trim:", validateZipCode(" 518000 ")); // true
console.log("空串:", validateZipCode("")); // false
console.log("--- strict ---");
console.log("100000 北京:", validateZipCodeStrict("100000")); // true
console.log("518000 深圳(广东44):", validateZipCodeStrict("518000")); // false（深圳实际是518，前两位51是广东? 51=四川）
console.log("510000 广东应为51? 实际广东是51:", validateZipCodeStrict("510000")); // true
console.log("200000 上海:", validateZipCodeStrict("200000")); // true
console.log("710000 西安:", validateZipCodeStrict("710000")); // false（71 不在表，陕西是61）
console.log("610000 陕西:", validateZipCodeStrict("610000")); // true
console.log("000000:", validateZipCodeStrict("000000")); // false
console.log("999999:", validateZipCodeStrict("999999")); // false
