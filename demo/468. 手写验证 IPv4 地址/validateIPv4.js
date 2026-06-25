/**
 * 手写验证 IPv4 地址
 *
 * IPv4 地址由 4 段 0-255 的十进制数组成，用 . 分隔，如 192.168.1.1。
 * 注意点：
 *   - 每段 0-255
 *   - 不能有前导 0（如 01、001 通常视为非法，避免与八进制歧义）
 *   - 恰好 4 段
 *
 * 这里实现：
 *   - validateIPv4(ip)：严格校验（禁前导零）
 *   - validateIPv4Loose(ip)：宽松校验（允许前导零，仅范围合法）
 *
 * 实现思路：正则做结构校验 + 数值范围校验。
 */

function validateIPv4(ip) {
  if (typeof ip !== "string") return false;
  const str = ip.trim();

  // 4 段，每段 1-3 位数字
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str)) return false;

  const parts = str.split(".");
  for (const part of parts) {
    // 范围 0-255
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    // 禁止前导零：长度>1 且以0开头非法
    if (part.length > 1 && part.startsWith("0")) return false;
    // 必须全是数字（正则已保证，此处冗余防御）
    if (!/^\d+$/.test(part)) return false;
  }
  return true;
}

function validateIPv4Loose(ip) {
  if (typeof ip !== "string") return false;
  const str = ip.trim();
  if (!/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(str)) return false;
  return str.split(".").every((p) => {
    const n = parseInt(p, 10);
    return n >= 0 && n <= 255;
  });
}

// 提取 IPv4 段信息
function parseIPv4(ip) {
  if (!validateIPv4(ip)) return null;
  return ip
    .trim()
    .split(".")
    .map((p) => parseInt(p, 10));
}

// ===== 测试 =====
console.log("192.168.1.1:", validateIPv4("192.168.1.1")); // true
console.log("0.0.0.0:", validateIPv4("0.0.0.0")); // true
console.log("255.255.255.255:", validateIPv4("255.255.255.255")); // true
console.log("127.0.0.1:", validateIPv4("127.0.0.1")); // true
console.log("256.1.1.1:", validateIPv4("256.1.1.1")); // false（超255）
console.log("1.2.3:", validateIPv4("1.2.3")); // false（3段）
console.log("1.2.3.4.5:", validateIPv4("1.2.3.4.5")); // false（5段）
console.log("1.2.3.a:", validateIPv4("1.2.3.a")); // false（含字母）
console.log("前导零 192.168.01.1:", validateIPv4("192.168.01.1")); // false
console.log("前导零 001.1.1.1:", validateIPv4("001.1.1.1")); // false
console.log("前导零宽松:", validateIPv4Loose("192.168.01.1")); // true
console.log("负数 -1.1.1.1:", validateIPv4("-1.1.1.1")); // false
console.log("空格 trim:", validateIPv4(" 1.1.1.1 ")); // true
console.log("空串:", validateIPv4("")); // false
console.log("数字类型:", validateIPv4(123)); // false
console.log("末尾点 1.1.1.1.:", validateIPv4("1.1.1.1.")); // false
console.log("parse:", parseIPv4("192.168.1.1")); // [ 192, 168, 1, 1 ]
console.log("parse非法:", parseIPv4("999.1.1.1")); // null
