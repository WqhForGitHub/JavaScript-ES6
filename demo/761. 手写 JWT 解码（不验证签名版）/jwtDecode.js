/**
 * 手写 JWT 解码（不验证签名版）
 *
 * 功能：解析 JWT（JSON Web Token）的 header 与 payload
 *       仅做解码，不验证签名（适合调试/展示，不能用于授权判断）
 *
 * JWT 结构：header.payload.signature
 *   - header:    base64url 编码的 JSON，包含 alg/typ
 *   - payload:   base64url 编码的 JSON，包含 claims
 *   - signature: base64url 编码的签名（本示例不验证）
 *
 * 实现思路：
 *   1. 用 . 切分三段
 *   2. base64url -> base64（- -> +, _ -> /, 补 =）
 *   3. base64 解码为 UTF-8 字符串
 *   4. JSON.parse 得到对象
 *
 * 重要警告：未验证签名的 JWT 可被篡改，仅用于客户端展示用户信息
 */

// base64url 解码（Node Buffer 自动处理 padding，但仍需转换字符）
function base64UrlDecode(str) {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // 补齐 padding
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Buffer.from(b64, "base64").toString("utf8");
}

// base64url 编码
function base64UrlEncode(str) {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// 解码单段 JSON
function decodeSegment(segment) {
  try {
    return JSON.parse(base64UrlDecode(segment));
  } catch (e) {
    throw new Error("段解码失败: " + e.message);
  }
}

// 主解码函数
function jwtDecode(token) {
  if (typeof token !== "string") throw new Error("token 必须为字符串");
  const parts = token.split(".");
  if (parts.length < 2)
    throw new Error("JWT 格式错误，至少需要 header.payload 两段");

  const header = decodeSegment(parts[0]);
  const payload = decodeSegment(parts[1]);
  const signature = parts[2] || null;

  return { header, payload, signature };
}

// 仅取 payload（最常用场景）
function jwtPayload(token) {
  return jwtDecode(token).payload;
}

// 仅取 header
function jwtHeader(token) {
  return jwtDecode(token).header;
}

// ===== 测试 =====
console.log("=== 手写 JWT 解码（不验证签名版） ===");

// 1. 真实 JWT 示例（来自 jwt.io）
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

console.log("JWT:", token);
const decoded = jwtDecode(token);
console.log("\nheader:", JSON.stringify(decoded.header));
// 预期: { alg: "HS256", typ: "JWT" }
console.log("payload:", JSON.stringify(decoded.payload));
// 预期: { sub: "1234567890", name: "John Doe", iat: 1516239022 }
console.log(
  "signature:",
  decoded.signature ? decoded.signature.slice(0, 16) + "..." : null,
);

// 2. 简便方法
console.log("\n仅 payload:", jwtPayload(token));
// 预期: { sub: '1234567890', name: 'John Doe', iat: 1516239022 }

// 3. 自己构造 JWT 测试（不签名）
const header = { alg: "none", typ: "JWT" };
const payload = { user: "alice", role: "admin", exp: 1893456000 };
const fakeJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.`;
console.log("\n构造的 JWT:", fakeJwt);
console.log("解码:", jwtDecode(fakeJwt).payload);
// 预期: { user: 'alice', role: 'admin', exp: 1893456000 }

// 4. 中文/特殊字符
const cnPayload = { 名字: "张三", 角色: "管理员" };
const cnJwt = `${base64UrlEncode(JSON.stringify({ alg: "HS256" }))}.${base64UrlEncode(JSON.stringify(cnPayload))}.sig`;
console.log("\n含中文 payload:", jwtPayload(cnJwt));
// 预期: { '名字': '张三', '角色': '管理员' }

// 5. 异常处理
console.log("\n错误 token 测试:");
try {
  jwtDecode("invalid");
} catch (e) {
  console.log("  报错:", e.message);
}
try {
  jwtDecode("a.b");
} catch (e) {
  console.log("  报错:", e.message);
}

// 6. 检查过期
function isExpired(payload, now = Date.now() / 1000) {
  if (payload.exp == null) return false;
  return payload.exp < now;
}
console.log("\n过期检测:", isExpired({ exp: 1000 })); // 预期: true (exp 远在过去)
console.log("未过期:", isExpired({ exp: 9999999999 })); // 预期: false
