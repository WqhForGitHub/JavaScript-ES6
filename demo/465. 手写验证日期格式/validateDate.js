/**
 * 手写验证日期格式
 *
 * 校验日期字符串是否符合指定格式，并验证日期真实存在（如 2 月 30 日非法）。
 * 这里实现：
 *   - validateDateFormat(str, format)：按格式校验（支持 YYYY MM DD HH mm ss 及分隔符）
 *   - validateDateByPattern(str)：常用格式（YYYY-MM-DD / YYYY/MM/DD）校验
 *
 * 实现思路：
 *   1. 根据格式构建对应正则提取年月日时分秒
 *   2. 用 new Date 构造后回读，确认与输入一致（防止自动进位）
 *   3. 校验闰年 2 月 29 日
 */

function validateDateFormat(str, format = "YYYY-MM-DD") {
  if (typeof str !== "string" || typeof format !== "string") return false;

  // 构建正则：把格式中的占位符替换为捕获组
  const tokenRegex = /(YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s)/g;
  const tokens = [];
  let regexStr = format.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 先转义
  // 还原占位符（上面转义不影响字母）
  regexStr = format.replace(tokenRegex, (m) => {
    tokens.push(m);
    switch (m) {
      case "YYYY":
        return "(\\d{4})";
      case "YY":
        return "(\\d{2})";
      case "MM":
        return "(\\d{2})";
      case "M":
        return "(\\d{1,2})";
      case "DD":
        return "(\\d{2})";
      case "D":
        return "(\\d{1,2})";
      case "HH":
        return "(\\d{2})";
      case "H":
        return "(\\d{1,2})";
      case "mm":
        return "(\\d{2})";
      case "m":
        return "(\\d{1,2})";
      case "ss":
        return "(\\d{2})";
      case "s":
        return "(\\d{1,2})";
      default:
        return m;
    }
  });

  // 转义格式中的字面分隔符
  const fullRegex = new RegExp("^" + regexStr + "$");
  const match = str.match(fullRegex);
  if (!match) return false;

  // 组装各字段
  const parts = {};
  tokens.forEach((token, i) => {
    const value = parseInt(match[i + 1], 10);
    switch (token) {
      case "YYYY":
        parts.year = value;
        break;
      case "YY":
        parts.year = value + (value > 50 ? 1900 : 2000);
        break;
      case "MM":
      case "M":
        parts.month = value;
        break;
      case "DD":
      case "D":
        parts.day = value;
        break;
      case "HH":
      case "H":
        parts.hour = value;
        break;
      case "mm":
      case "m":
        parts.minute = value;
        break;
      case "ss":
      case "s":
        parts.second = value;
        break;
    }
  });

  // 必须有年月日
  if (parts.year == null || parts.month == null || parts.day == null)
    return false;

  return isValidDateParts(parts);
}

function isValidDateParts(p) {
  const { year, month, day } = p;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  // 校验时分秒
  if (p.hour != null && (p.hour < 0 || p.hour > 23)) return false;
  if (p.minute != null && (p.minute < 0 || p.minute > 59)) return false;
  if (p.second != null && (p.second < 0 || p.second > 59)) return false;

  if (p.hour != null && p.minute != null && p.second != null) {
    const dt = new Date(year, month - 1, day, p.hour, p.minute, p.second);
    if (
      dt.getHours() !== p.hour ||
      dt.getMinutes() !== p.minute ||
      dt.getSeconds() !== p.second
    ) {
      return false;
    }
  }
  return true;
}

function validateDateByPattern(str) {
  // 常见 YYYY-MM-DD 或 YYYY/MM/DD
  return (
    validateDateFormat(str, "YYYY-MM-DD") ||
    validateDateFormat(str, "YYYY/MM/DD")
  );
}

// ===== 测试 =====
console.log("2024-01-15:", validateDateFormat("2024-01-15")); // true
console.log("2024/01/15:", validateDateByPattern("2024/01/15")); // true
console.log("2024-2-30 非法:", validateDateFormat("2024-2-30", "YYYY-M-DD")); // false
console.log("2024-02-29 闰年:", validateDateFormat("2024-02-29")); // true
console.log("2023-02-29 平年:", validateDateFormat("2023-02-29")); // false
console.log("2024-13-01 非法月:", validateDateFormat("2024-13-01")); // false
console.log("2024-00-01:", validateDateFormat("2024-00-01")); // false
console.log(
  "带时间:",
  validateDateFormat("2024-01-15 23:59:59", "YYYY-MM-DD HH:mm:ss"),
); // true
console.log(
  "非法时间24:",
  validateDateFormat("2024-01-15 24:00:00", "YYYY-MM-DD HH:mm:ss"),
); // false
console.log("斜杠格式:", validateDateFormat("2024/01/15", "YYYY/MM/DD")); // true
console.log("点分:", validateDateFormat("2024.01.15", "YYYY.MM.DD")); // true
console.log(
  "中文分隔:",
  validateDateFormat("2024年01月15日", "YYYY年MM月DD日"),
); // true
console.log("格式不匹配:", validateDateFormat("2024/01/15", "YYYY-MM-DD")); // false
console.log("YY 两位:", validateDateFormat("99-01-15", "YY-MM-DD")); // true (1999)
console.log("非字符串:", validateDateFormat(20240115)); // false
