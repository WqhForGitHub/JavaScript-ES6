/**
 * 手写 JWT 生成
 *
 * 功能：根据 payload 与密钥生成符合 RFC7519 的 JWT 字符串（HS256 算法）
 * 实现思路：
 *   1. 构造 header（alg/typ）与 payload，标准声明(iat/exp/iss/sub)自动填充
 *   2. 对 header、payload 做 base64url 编码
 *   3. 用 HMAC-SHA256 对 "header.payload" 计算签名，再做 base64url 编码
 *   4. 拼接为 "header.payload.signature"
 * 注：底层哈希使用 Node crypto 的 HMAC 原语，JWT 结构与编码逻辑手写
 */
const crypto = require("crypto");

/** base64url 编码（去除填充，使用 - 与 _） */
function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * 生成 JWT
 * @param {object} payload 业务负载
 * @param {string} secret  密钥
 * @param {object} options { expiresIn(秒), issuer, subject, audience, header, notBefore }
 * @returns {string} JWT 字符串
 */
function sign(payload, secret, options = {}) {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("payload must be a plain object");
  }
  if (!secret) throw new Error("secret is required");

  const header = { alg: "HS256", typ: "JWT", ...(options.header || {}) };
  const now = Math.floor(Date.now() / 1000);

  const body = { iat: now, ...payload };
  if (options.expiresIn) body.exp = now + Number(options.expiresIn);
  if (options.notBefore) body.nbf = now + Number(options.notBefore);
  if (options.issuer) body.iss = options.issuer;
  if (options.subject) body.sub = options.subject;
  if (options.audience) body.aud = options.audience;

  const headerSeg = base64url(JSON.stringify(header));
  const payloadSeg = base64url(JSON.stringify(body));
  const data = headerSeg + "." + payloadSeg;

  const signature = crypto.createHmac("sha256", secret).update(data).digest();

  return data + "." + base64url(signature);
}

// 不带 exp 的签发（便于测试任意 payload）
function signRaw(payload, secret, header) {
  const h = { alg: "HS256", typ: "JWT", ...(header || {}) };
  const headerSeg = base64url(JSON.stringify(h));
  const payloadSeg = base64url(JSON.stringify(payload));
  const data = headerSeg + "." + payloadSeg;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return data + "." + base64url(sig);
}

// ===== 测试 =====
console.log("=== JWT 生成演示 ===");

const secret = "my-secret-key";

// 1) 基本生成
const token1 = sign({ userId: 1001, role: "admin" }, secret, {
  expiresIn: 3600,
  issuer: "demo",
});
const parts1 = token1.split(".");
console.log("Token 段数:", parts1.length); // 3
console.log(
  "Header:",
  JSON.parse(Buffer.from(parts1[0], "base64url").toString()),
); // { alg:'HS256', typ:'JWT' }
const payload1 = JSON.parse(Buffer.from(parts1[1], "base64url").toString());
console.log("Payload:", payload1); // { iat, userId:1001, role:'admin', exp, iss:'demo' }
console.log("包含 iat:", payload1.iat !== undefined); // true
console.log(
  "包含 exp:",
  payload1.exp !== undefined && payload1.exp > payload1.iat,
); // true
console.log("iss:", payload1.iss); // demo

// 2) 不带过期时间
const token2 = sign({ sub: "abc" }, secret);
const payload2 = JSON.parse(
  Buffer.from(token2.split(".")[1], "base64url").toString(),
);
console.log("无 exp 的 payload:", payload2); // { iat, sub:'abc' }

// 3) 签名确定性（相同输入相同输出）
const a = signRaw({ x: 1 }, secret);
const b = signRaw({ x: 1 }, secret);
console.log("相同输入签名一致:", a === b); // true

// 4) 不同密钥签名不同
const c = signRaw({ x: 1 }, "other-secret");
console.log("不同密钥签名不同:", a !== c); // true

// 5) base64url 不含 = + /
console.log("base64url 无填充/特殊字符:", /^[A-Za-z0-9_-]+$/.test(parts1[2])); // true

// 暴露 signRaw 供 jwtVerify 测试复用思路
module.exports = { sign, signRaw, base64url };
