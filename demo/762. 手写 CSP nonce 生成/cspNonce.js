/**
 * 手写 CSP nonce 生成
 *
 * 功能：生成用于 Content-Security-Policy 的 nonce（Number used ONCE）
 *       配合 `script-src 'nonce-<value>'` 防止内联脚本注入
 *
 * 实现思路：
 *   1. nonce 必须使用加密安全的随机源（不能 Math.random）
 *   2. 长度至少 128 位（16 字节），base64 编码后约 22-24 字符
 *   3. 每次 HTTP 响应重新生成，不可缓存复用
 *   4. 同一响应中：HTTP 头 `Content-Security-Policy` 与 `<script nonce="...">` 必须一致
 *
 * 工作原理：
 *   - 浏览器只执行 nonce 匹配的内联脚本
 *   - 注入的 <script> 无法预知 nonce，故无法执行
 */

const crypto = require("crypto");

// 1. 使用 crypto.randomBytes 生成 nonce
function generateNonce(byteLen = 16) {
  return crypto.randomBytes(byteLen).toString("base64");
}

// 2. base64url 变体（部分场景使用）
function generateNonceUrlSafe(byteLen = 16) {
  return crypto.randomBytes(byteLen).toString("base64url");
}

// 3. 生成 CSP 头字符串
function buildCspHeader(nonce, extraPolicies = {}) {
  const policies = {
    "default-src": ["'self'"],
    "script-src": [
      `'self'`,
      `'nonce-${nonce}'`,
      ...(extraPolicies["script-src"] || []),
    ],
    "style-src": [
      `'self'`,
      `'nonce-${nonce}'`,
      ...(extraPolicies["style-src"] || []),
    ],
    "img-src": ["'self'", "data:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    ...extraPolicies,
  };
  return Object.entries(policies)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
}

// 4. 给 HTML 注入 nonce（演示）
function injectNonceToHtml(html, nonce) {
  return html.replace(/<script(?![^>]*nonce=)/g, `<script nonce="${nonce}"`);
}

// 5. 简易响应包装：同时返回 CSP 头与处理后的 HTML
function createCspResponse(html, options = {}) {
  const nonce = generateNonce(options.byteLen || 16);
  const cspHeader = buildCspHeader(nonce, options.extraPolicies || {});
  const htmlWithNonce = injectNonceToHtml(html, nonce);
  return {
    headers: { "Content-Security-Policy": cspHeader },
    body: htmlWithNonce,
    nonce,
  };
}

// ===== 测试 =====
console.log("=== 手写 CSP nonce 生成 ===");

// 1. 生成 nonce
const nonce1 = generateNonce();
const nonce2 = generateNonce();
console.log("nonce 1:", nonce1);
console.log("nonce 2:", nonce2);
console.log("两次生成不同:", nonce1 !== nonce2); // 预期: true
console.log("nonce 长度:", nonce1.length, "字符 (16 字节 base64 约 24 字符)");
// 预期: 24 字符

// 2. URL 安全版本
console.log("\nURL 安全 nonce:", generateNonceUrlSafe());
console.log("不含 + / =:", !/[+/=]/.test(generateNonceUrlSafe())); // 预期: true

// 3. 构造 CSP 头
const csp = buildCspHeader(nonce1);
console.log("\nCSP 头:");
console.log(csp);
// 预期: default-src 'self'; script-src 'self' 'nonce-<...>'; style-src 'self' 'nonce-<...>'; ...

// 4. HTML 注入
const html =
  '<html><body><script>alert(1)</script><script src="app.js"></script></body></html>';
const processed = injectNonceToHtml(html, nonce1);
console.log("\n原始 HTML:");
console.log(html);
console.log("注入 nonce 后:");
console.log(processed);
// 预期: 第一个 <script> 标签加上 nonce="..."，已带 src 的也加上

// 5. 完整响应构造
const resp = createCspResponse("<script>doSomething()</script>");
console.log("\n完整响应 headers:", resp.headers);
console.log("响应 body:", resp.body);
console.log("生成的 nonce:", resp.nonce);
// 预期: body 中 <script nonce="<nonce>">doSomething()</script>
