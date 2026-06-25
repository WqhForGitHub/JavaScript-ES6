/**
 * 手写密码强度检测
 *
 * 功能：评估密码强度，给出分数与等级
 *       用于注册/修改密码时引导用户使用强密码
 *
 * 实现思路：
 *   1. 基础得分：长度贡献
 *   2. 字符多样性：大写、小写、数字、符号四类字符
 *   3. 加分项：长度超阈值、混合字符类、不包含常见弱口令
 *   4. 扣分项：纯字母/纯数字、连续字符、重复字符、键盘序列、常见弱口令
 *   5. 输出 0-100 分与等级（很弱/弱/中/强/很强）
 */

// 常见弱口令黑名单（演示，实际应使用大字典）
const WEAK_PASSWORDS = new Set([
  "123456",
  "12345678",
  "123456789",
  "password",
  "Password",
  "PASSWORD",
  "qwerty",
  "abc123",
  "111111",
  "000000",
  "iloveyou",
  "admin",
  "root",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "letmein",
  "login",
  "passw0rd",
  "p@ssw0rd",
  "123qwe",
  "qazwsx",
]);

// 键盘序列
const KEYBOARD_SEQUENCES = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1234567890",
  "qaz",
  "wsx",
  "edc",
];

// 字符类别判定
const hasLower = (s) => /[a-z]/.test(s);
const hasUpper = (s) => /[A-Z]/.test(s);
const hasDigit = (s) => /[0-9]/.test(s);
const hasSymbol = (s) => /[^A-Za-z0-9]/.test(s);

// 统计字符类别数
function charVariety(pwd) {
  return [hasLower, hasUpper, hasDigit, hasSymbol].filter((f) => f(pwd)).length;
}

// 检测连续/重复字符
function hasSequence(pwd, minLen = 3) {
  const lower = pwd.toLowerCase();
  // 升序/降序连续字符（如 abc, 321, 987）
  for (let i = 0; i + minLen <= lower.length; i++) {
    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);
    if (b - a === 1 && c - b === 1) return true; // abc
    if (a - b === 1 && b - c === 1) return true; // cba
  }
  // 键盘序列
  for (const seq of KEYBOARD_SEQUENCES) {
    for (let i = 0; i + minLen <= seq.length; i++) {
      const sub = seq.slice(i, i + minLen);
      if (lower.includes(sub)) return true;
    }
  }
  return false;
}

function hasRepeat(pwd, minLen = 3) {
  return /(.)\1{2,}/.test(pwd); // 同字符连续 3 次以上
}

// 主评分函数
function checkStrength(pwd) {
  if (typeof pwd !== "string") pwd = String(pwd);
  const reasons = [];

  if (pwd.length === 0) {
    return { score: 0, level: "空", reasons: ["密码为空"] };
  }

  let score = 0;

  // 1. 长度得分
  if (pwd.length >= 8) score += 10;
  if (pwd.length >= 12) score += 15;
  if (pwd.length >= 16) score += 15;
  if (pwd.length >= 20) score += 10;
  if (pwd.length < 6) {
    score -= 20;
    reasons.push("长度过短（<6）");
  }

  // 2. 字符多样性
  const variety = charVariety(pwd);
  score += variety * 10;
  if (variety >= 3) score += 10;
  if (variety === 4) score += 10;
  if (variety === 1) {
    score -= 15;
    reasons.push("仅使用单一字符类别");
  }

  // 3. 每种字符数量加成
  const lowerCount = (pwd.match(/[a-z]/g) || []).length;
  const upperCount = (pwd.match(/[A-Z]/g) || []).length;
  const digitCount = (pwd.match(/[0-9]/g) || []).length;
  const symbolCount = (pwd.match(/[^A-Za-z0-9]/g) || []).length;
  score +=
    Math.min(lowerCount, 4) +
    Math.min(upperCount, 4) +
    Math.min(digitCount, 4) +
    Math.min(symbolCount, 6);

  // 4. 扣分项
  if (WEAK_PASSWORDS.has(pwd)) {
    score -= 50;
    reasons.push("命中常见弱口令黑名单");
  }
  if (/^\d+$/.test(pwd)) {
    score -= 20;
    reasons.push("纯数字");
  }
  if (/^[a-zA-Z]+$/.test(pwd)) {
    score -= 15;
    reasons.push("纯字母");
  }
  if (hasSequence(pwd)) {
    score -= 15;
    reasons.push("包含连续/键盘序列字符");
  }
  if (hasRepeat(pwd)) {
    score -= 10;
    reasons.push("包含连续重复字符");
  }
  if (
    /^(19|20)\d{2}$/.test(pwd) ||
    (/^\d{4,8}$/.test(pwd) && pwd.length <= 8)
  ) {
    score -= 10;
    reasons.push("疑似出生年份或简单数字");
  }

  // 5. 钳制范围
  score = Math.max(0, Math.min(100, score));

  // 等级
  let level;
  if (score < 30) level = "很弱";
  else if (score < 50) level = "弱";
  else if (score < 70) level = "中";
  else if (score < 90) level = "强";
  else level = "很强";

  return { score, level, reasons, variety };
}

// ===== 测试 =====
console.log("=== 手写密码强度检测 ===");

const testCases = [
  "123", // 很弱
  "123456", // 很弱（黑名单 + 纯数字）
  "password", // 很弱（黑名单）
  "abcdefgh", // 弱（纯字母）
  "abcd1234", // 中
  "Abc12345", // 中
  "P@ssw0rd", // 弱（黑名单）
  "Abc@2024xyz", // 强
  "Tr0ub4dour&3$Mango!", // 很强
  "qwertyASDF123!@#", // 强（含键盘序列但有混合）
  "xK9#mP2$vL7^nQ5@", // 很强
];

for (const pwd of testCases) {
  const r = checkStrength(pwd);
  console.log(
    `[${r.level} ${r.score}分] ${pwd}` +
      (r.reasons.length ? `  -> ${r.reasons.join("; ")}` : ""),
  );
}

// 预期: 弱密码得分低，强密码得分高
// 空密码检测
console.log("\n空密码:", JSON.stringify(checkStrength(""))); // 预期: { score: 0, level: '空' }
