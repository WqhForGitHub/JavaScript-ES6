/**
 * 手写验证车牌号
 *
 * 中国大陆车牌号规则：
 *   1. 燃油车（普通蓝牌/绿牌）：
 *      - 第 1 位：省份简称汉字（京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁）
 *      - 第 2 位：发牌机关字母（A-Z，不含 I O）
 *      - 第 3-7 位：5 位字符（字母数字，不含 I O），最后一位为数字（新能源另有规则）
 *      - 标准格式：京A12345
 *   2. 新能源车牌（6 位序号）：
 *      - 小型车：省份+字母+1位(D/F)+5位字母数字
 *      - 大型车：省份+字母+5位字母数字+1位(D/F)
 *
 * 这里实现：
 *   - validateLicensePlate(str)：常规蓝牌（5 位序号）
 *   - validateNewEnergyPlate(str)：新能源车牌（6 位序号）
 *   - validateAnyPlate(str)：自动判断
 *
 * 实现思路：用正则匹配，省份做白名单。
 */

const PROVINCES = "京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁";

// 普通燃油车牌：省+字母+5位字母数字（不含IO）
function validateLicensePlate(plate) {
  if (typeof plate !== "string") return false;
  const str = plate.trim().toUpperCase();
  const regex = new RegExp(
    "^[" + PROVINCES + "][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4}[0-9]$"
  );
  // 总长度 7
  if (str.length !== 7) return false;
  return regex.test(str);
}

// 新能源车牌：8 位（省+字母+6位序号），含 D/F
function validateNewEnergyPlate(plate) {
  if (typeof plate !== "string") return false;
  const str = plate.trim().toUpperCase();
  if (str.length !== 8) return false;

  const head = new RegExp("^[" + PROVINCES + "][A-HJ-NP-Z]");
  if (!head.test(str)) return false;

  const body = str.slice(2); // 6 位
  // 小型车：第 1 位为 D 或 F，后 5 位字母数字
  const small = /^[DF][A-HJ-NP-Z0-9]{5}$/.test(body);
  // 大型车：前 5 位字母数字，最后一位 D/F
  const large = /^[A-HJ-NP-Z0-9]{5}[DF]$/.test(body);
  return small || large;
}

function validateAnyPlate(plate) {
  return validateLicensePlate(plate) || validateNewEnergyPlate(plate);
}

// ===== 测试 =====
console.log("--- 普通车牌 ---");
console.log("京A12345:", validateLicensePlate("京A12345")); // true
console.log("沪B99999:", validateLicensePlate("沪B99999")); // true
console.log("粤S·AB123:", validateLicensePlate("粤SAB123")); // true（无分隔符）
console.log("含小写 粤s12345:", validateLicensePlate("粤s12345")); // true（自动转大写）
console.log("末位非数字 京A1234B:", validateLicensePlate("京A1234B")); // false
console.log("含非法字母I 京A1234I:", validateLicensePlate("京A1234I")); // false（I 非法）
console.log("长度不足 京A1234:", validateLicensePlate("京A1234")); // false
console.log("非法省份 港A12345:", validateLicensePlate("港A12345")); // false
console.log("第二位非字母 京112345:", validateLicensePlate("京112345")); // false

console.log("--- 新能源车牌 ---");
console.log("小型 京AD12345:", validateNewEnergyPlate("京AD12345")); // true
console.log("小型 京AF12345:", validateNewEnergyPlate("京AF12345")); // true
console.log("大型 京A12345D:", validateNewEnergyPlate("京A12345D")); // true
console.log("新能源非DF 京AB12345:", validateNewEnergyPlate("京AB12345")); // false
console.log("新能源长度7:", validateNewEnergyPlate("京AD1234")); // false

console.log("--- 自动判断 ---");
console.log("京A12345:", validateAnyPlate("京A12345")); // true
console.log("京AD12345:", validateAnyPlate("京AD12345")); // true
console.log("非法 港A12345:", validateAnyPlate("港A12345")); // false
