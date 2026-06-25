/**
 * 手写 HTML 转义
 *
 * 功能：将字符串中特殊字符转换为 HTML 实体
 *       防止用户输入被浏览器解析为 HTML 标签
 *
 * 实现思路：
 *   1. 维护字符 -> 实体的映射表
 *   2. 使用正则一次性替换所有敏感字符
 *   3. 兼容属性上下文（引号、反引号也需转义）
 */

const HTML_ESCAPE_MAP = {
  "&": "&amp;", // 必须最先替换，避免二次转义
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

// 默认转义集合（仅文本上下文必需）
const DEFAULT_RE = /[&<>"'`]/g;

// 转义函数
function htmlEscape(str) {
  if (str == null) return "";
  return String(str).replace(DEFAULT_RE, (ch) => HTML_ESCAPE_MAP[ch]);
}

// 仅转义属性上下文需要的字符（用于 href、value 等）
function htmlEscapeAttr(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

// ===== 测试 =====
console.log("=== 手写 HTML 转义 ===");

console.log(htmlEscape('<div class="a">Tom & Jerry</div>'));
// 预期: &lt;div class=&quot;a&quot;&gt;Tom &amp; Jerry&lt;/div&gt;

console.log(htmlEscape("it's a `test`"));
// 预期: it&#39;s a &#96;test&#96;

console.log(htmlEscapeAttr('a="b"&c'));
// 预期: a=&quot;b&quot;&amp;c

console.log(htmlEscape(null)); // 预期: (空字符串)
console.log(htmlEscape(42)); // 预期: 42

// 注意：& 必须最先替换，避免二次转义
console.log(htmlEscape("&lt;")); // 预期: &amp;lt;
