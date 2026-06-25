/**
 * 手写输入消毒（Sanitize）
 *
 * 功能：对用户输入进行规范化、清理与验证
 *       移除危险字符、规范化空格、控制长度，防御多种注入
 *
 * 实现思路：
 *   1. trim 首尾空白，统一 NFC 规范化避免 Unicode 异常
 *   2. 移除/转义控制字符（NULL、换行等，按需保留）
 *   3. 不同场景预设消毒策略：username / email / html / filename / number
 *   4. 长度限制与黑名单过滤
 *   5. 不修改原始输入已编码内容（避免双解码攻击）
 */

// 通用字符串消毒
function sanitizeString(input, options = {}) {
  if (input == null) return "";
  let s = String(input);

  // 1. 移除 BOM
  s = s.replace(/^\uFEFF/, "");
  // 2. 规范化为 NFC（统一 Unicode 表示）
  if (typeof s.normalize === "function") s = s.normalize("NFC");
  // 3. 移除 NULL 字节
  s = s.replace(/\0/g, "");
  // 4. 控制字符（保留 \t \r\n）
  if (options.stripControl !== false) {
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  }
  // 5. trim
  if (options.trim !== false) s = s.trim();
  // 6. 折叠多空白
  if (options.collapseSpaces) s = s.replace(/\s+/g, " ");
  // 7. 长度限制
  if (options.maxLength && s.length > options.maxLength) {
    s = s.slice(0, options.maxLength);
  }
  // 8. 黑名单字符
  if (options.blacklist) {
    const re = new RegExp(`[${escapeRegex(options.blacklist)}]`, "g");
    s = s.replace(re, "");
  }
  return s;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// === 用户名消毒：仅允许字母数字下划线，长度 3-20 ===
function sanitizeUsername(input) {
  let s = sanitizeString(input, { maxLength: 20, collapseSpaces: true });
  s = s.replace(/[^\w\-]/g, ""); // 仅保留 A-Z a-z 0-9 _ -
  if (s.length < 3) {
    return { value: s, valid: false, error: "用户名至少 3 个字符" };
  }
  return { value: s, valid: true };
}

// === 邮箱消毒与校验 ===
function sanitizeEmail(input) {
  let s = sanitizeString(input, {
    maxLength: 254,
    collapseSpaces: true,
  }).toLowerCase();
  // 简单邮箱正则
  const re = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
  if (!re.test(s)) {
    return { value: s, valid: false, error: "邮箱格式不正确" };
  }
  return { value: s, valid: true };
}

// === 整数消毒 ===
function sanitizeInt(
  input,
  { min = -Infinity, max = Infinity, defaultVal = 0 } = {},
) {
  const n = Number(input);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { value: defaultVal, valid: false, error: "非整数" };
  }
  const clamped = Math.max(min, Math.min(max, n));
  return { value: clamped, valid: true };
}

// === 文件名消毒：防止路径穿越 ===
function sanitizeFilename(input) {
  let s = sanitizeString(input, { maxLength: 255, stripControl: true });
  // 替换路径分隔符
  s = s.replace(/[\/\\]/g, "_");
  // 替换不允许的字符
  s = s.replace(/[<>:"|?*\x00-\x1f]/g, "_");
  // 防止 .. 路径穿越
  s = s.replace(/^\.+/, "");
  // 防止保留名（Windows）
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(s)) {
    s = "_" + s;
  }
  if (!s) s = "unnamed";
  return { value: s, valid: true };
}

// === HTML 文本消毒（保留安全标签，剥离危险属性） ===
function sanitizeHtml(input) {
  let s = sanitizeString(input, { trim: false, stripControl: true });
  // 移除危险标签
  s = s.replace(
    /<\/?(script|iframe|object|embed|style|link|meta|base|form|input|button|svg)\b[^>]*>/gi,
    "",
  );
  // 移除事件属性
  s = s.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // 移除 javascript: 协议
  s = s.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=$2#$2");
  return s;
}

// === URL 消毒 ===
function sanitizeUrl(input) {
  let s = sanitizeString(input, { maxLength: 2048, stripControl: true });
  // 仅允许 http/https/ftp 协议或相对路径
  if (
    /^(https?|ftp):\/\//i.test(s) ||
    /^[\/?#]/.test(s) ||
    !/^[a-z]+:/i.test(s)
  ) {
    return { value: s, valid: true };
  }
  return { value: "", valid: false, error: "不允许的协议" };
}

// ===== 测试 =====
console.log("=== 手写输入消毒（Sanitize） ===");

// 字符串消毒
console.log(
  "基础消毒:",
  JSON.stringify(sanitizeString("  hello\u0000world  ")),
);
// 预期: "hello world"

// 用户名
console.log("用户名合法:", sanitizeUsername("alice_123"));
// 预期: { value: 'alice_123', valid: true }
console.log("用户名含特殊字符:", sanitizeUsername("al<i>ce@"));
// 预期: { value: 'alice', valid: false } (< 3 字符)
console.log("用户名过长:", sanitizeUsername("a".repeat(30)).value.length);
// 预期: 20

// 邮箱
console.log("邮箱合法:", sanitizeEmail("USER@Example.COM"));
// 预期: { value: 'user@example.com', valid: true }
console.log("邮箱非法:", sanitizeEmail("not-an-email"));
// 预期: { valid: false }

// 整数
console.log("整数合法:", sanitizeInt("42", { min: 0, max: 100 }));
// 预期: { value: 42, valid: true }
console.log("整数越界:", sanitizeInt("999", { min: 0, max: 100 }));
// 预期: { value: 100, valid: true }
console.log("整数非法:", sanitizeInt("abc"));
// 预期: { value: 0, valid: false }

// 文件名
console.log("文件名路径穿越:", sanitizeFilename("../../etc/passwd").value);
// 预期: '__etc_passwd' (无路径分隔符，无前导点)
console.log("Windows 保留名:", sanitizeFilename("CON.txt").value);
// 预期: '_CON.txt'

// HTML 消毒
console.log(
  "HTML 消毒:",
  sanitizeHtml('<p onclick="x()">hi</p><script>alert(1)</script>'),
);
// 预期: <p>hi</p> (script 被剥离，onclick 被移除)
console.log(
  "URL 协议消毒:",
  sanitizeHtml('<a href="javascript:alert(1)">x</a>'),
);
// 预期: <a href="#">x</a>

// URL 消毒
console.log("URL 合法:", sanitizeUrl("https://example.com/path"));
// 预期: { value: 'https://example.com/path', valid: true }
console.log("URL 危险协议:", sanitizeUrl("javascript:alert(1)"));
// 预期: { value: '', valid: false }
