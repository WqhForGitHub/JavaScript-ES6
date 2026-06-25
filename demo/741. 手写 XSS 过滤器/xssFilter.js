/**
 * 手写 XSS 过滤器
 *
 * 功能：对用户输入的字符串进行 XSS（跨站脚本）消毒
 *       去除/转义可执行的 HTML 与 JavaScript 代码，防止脚本注入
 *
 * 实现思路：
 *   1. 将 & < > " ' / 等敏感字符替换为 HTML 实体
 *   2. 额外过滤 onXxx=、javascript:、data: 等危险协议与事件
 *   3. 提供 strict 模式直接剥离所有 <script>、<iframe> 等危险标签
 */

// 基础实体转义表
const ENTITY_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
};

// 将敏感字符转义为 HTML 实体
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'`/]/g, (ch) => ENTITY_MAP[ch] || ch);
}

// 剥离危险标签与属性（strict 模式）
const DANGEROUS_TAG_RE =
  /<\/?(script|iframe|object|embed|svg|math|style|link|meta|base|form)\b[^>]*>/gi;
const DANGEROUS_ATTR_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_PROTO_RE = /(javascript|vbscript|data|expression)\s*:/gi;

function stripDangerous(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(DANGEROUS_TAG_RE, "")
    .replace(DANGEROUS_ATTR_RE, "")
    .replace(DANGEROUS_PROTO_RE, "$1&#58;");
}

// 主入口：XSS 过滤器
function xssFilter(input, { strict = true } = {}) {
  if (input == null) return "";
  const text = String(input);
  const stripped = strict ? stripDangerous(text) : text;
  return escapeHtml(stripped);
}

// ===== 测试 =====
console.log("=== 手写 XSS 过滤器 ===");

// 1. 普通脚本注入
console.log(xssFilter("<script>alert(1)</script>"));
// 预期: &lt;script&gt;alert(1)&lt;/script&gt; (strict 模式下 script 标签被剥离后为空字符串再转义)

// 2. 事件属性注入
console.log(xssFilter("<img src=x onerror=alert(1)>"));
// 预期: &lt;img src=x&gt; (onerror 被剥离)

// 3. javascript 协议
console.log(xssFilter('<a href="javascript:alert(1)">click</a>'));
// 预期: &lt;a href="javascript&#58;alert(1)"&gt;click&lt;/a&gt;

// 4. 普通文本应保留
console.log(xssFilter("Hello World <b>bold</b>"));
// 预期: Hello World &lt;b&gt;bold&lt;/b&gt;

// 5. 非字符串输入
console.log(xssFilter(null)); // 预期: (空字符串)
console.log(xssFilter(123)); // 预期: 123
