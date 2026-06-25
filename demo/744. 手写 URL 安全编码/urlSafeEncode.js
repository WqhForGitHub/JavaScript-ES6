/**
 * 手写 URL 安全编码
 *
 * 功能：对字符串进行 URL 编码（percent-encoding），
 *       并提供 base64 的 URL 安全变体（base64url）转换
 *
 * 实现思路：
 *   1. encodeURIComponent 的增强版：保留必要的预留字符
 *   2. base64url：将 + 替换为 -，/ 替换为 _，去除 = 填充
 *      这种变体可直接放入 URL 路径或查询参数中无需再次编码
 */

// 通用 URL 编码（自定义保留字符集）
function urlEncode(str, keepUnreserved = true) {
  if (str == null) return "";
  const text = String(str);
  let result = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    // 不转义：A-Z a-z 0-9 - _ . ~
    if (keepUnreserved && /[A-Za-z0-9\-_.~]/.test(ch)) {
      result += ch;
    } else {
      // 用 UTF-8 字节序列做 %HH 编码
      const bytes = Buffer.from(ch, "utf8");
      for (const b of bytes) {
        result += "%" + b.toString(16).toUpperCase().padStart(2, "0");
      }
    }
  }
  return result;
}

// base64 -> base64url
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// base64url -> base64
function base64UrlToBase64(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  // 补齐 padding
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return b64;
}

// 对任意字符串进行 base64url 编码
function toBase64Url(str) {
  if (str == null) return "";
  return base64ToBase64Url(Buffer.from(String(str), "utf8").toString("base64"));
}

// 从 base64url 解码
function fromBase64Url(b64url) {
  if (b64url == null) return "";
  return Buffer.from(base64UrlToBase64(String(b64url)), "base64").toString(
    "utf8",
  );
}

// ===== 测试 =====
console.log("=== 手写 URL 安全编码 ===");

console.log(urlEncode("hello world & foo=bar"));
// 预期: hello%20world%20%26%20foo%3Dbar

console.log(urlEncode("中文/测试?"));
// 预期: %E4%B8%AD%E6%96%87%2F%E6%B5%8B%E8%AF%95%3F

console.log(toBase64Url("Hello? World/中文"));
// 预期: SGVsbG8_IFdvcmxkL+S4reaWhw (无 + / = 字符)

const encoded = toBase64Url("user?id=1&name=tom");
console.log(encoded);
console.log(fromBase64Url(encoded)); // 预期: user?id=1&name=tom

// base64 与 base64url 互转
const b64 = Buffer.from("??>>").toString("base64");
console.log(b64, "->", base64ToBase64Url(b64));
console.log(base64UrlToBase64(base64ToBase64Url(b64)) === b64); // 预期: true
