/**
 * 手写验证邮箱
 *
 * 邮箱格式：local-part@domain
 *   - local-part：可含字母、数字、. _ % + - 等，不能以 . 开头/结尾、不能连续 ..
 *   - domain：可含字母、数字、-、.，每段（label）不超 63 字符，TLD 至少 2 位字母
 *   - @ 必须有且仅一个
 *
 * 严格按 RFC 5321/5322 校验非常复杂，工程上用"够用"的正则即可。
 * 这里实现两档：
 *   - validateEmailCommon：常用严格正则（推荐）
 *   - validateEmailLoose：宽松校验（基本结构）
 *
 * 实现思路：用正则做结构与长度校验，并额外检查 label 长度。
 */

function validateEmailCommon(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false; // RFC 总长度上限 254

  // local@domain 基本结构
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!regex.test(trimmed)) return false;

  const [local, domain] = trimmed.split("@");
  if (local.length > 64) return false; // local-part 上限 64
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (local.includes("..")) return false;

  // domain 每段不超 63
  const labels = domain.split(".");
  if (labels.some((label) => label.length > 63 || label.length === 0)) {
    return false;
  }
  if (labels.some((label) => label.startsWith("-") || label.endsWith("-"))) {
    return false;
  }

  return true;
}

function validateEmailLoose(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ===== 测试 =====
console.log("user@example.com:", validateEmailCommon("user@example.com")); // true
console.log(
  "user.name@example.com:",
  validateEmailCommon("user.name@example.com"),
); // true
console.log(
  "user+tag@sub.example.com:",
  validateEmailCommon("user+tag@sub.example.com"),
); // true
console.log("user_name@a.b.co:", validateEmailCommon("user_name@a.b.co")); // true
console.log("无@:", validateEmailCommon("userexample.com")); // false
console.log("无域名后缀:", validateEmailCommon("user@example")); // false
console.log("以.结尾local:", validateEmailCommon("user.@example.com")); // false
console.log("以.开头local:", validateEmailCommon(".user@example.com")); // false
console.log("连续..:", validateEmailCommon("user..name@example.com")); // false
console.log("含空格:", validateEmailCommon("user @example.com")); // false
console.log("多个@:", validateEmailCommon("user@name@example.com")); // false
console.log("TLD 一位:", validateEmailCommon("user@example.c")); // false
console.log("domain label 横线开头:", validateEmailCommon("user@-example.com")); // false
console.log("数字类型:", validateEmailCommon(123)); // false
console.log("中文邮箱:", validateEmailCommon("用户@example.com")); // false（不含中文）

console.log("--- loose ---");
console.log("loose user@example.com:", validateEmailLoose("user@example.com")); // true
console.log("loose user@ex.c:", validateEmailLoose("user@ex.c")); // true
console.log("loose 无点:", validateEmailLoose("user@example")); // false
