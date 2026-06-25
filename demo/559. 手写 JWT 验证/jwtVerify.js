/**
 * 手写 JWT 验证
 *
 * 功能：验证 JWT 签名并解码 payload，校验过期/生效时间等声明
 * 实现思路：
 *   1. 按 "." 分割为三段，重新计算 HMAC-SHA256 签名并与第三段比对
 *   2. 使用 crypto.timingSafeEqual 做恒定时间比较，防止时序攻击
 *   3. base64url 解码 payload，校验 exp(过期) / nbf(生效) / iss(签发者)
 *   4. 校验通过返回 payload，失败抛出对应错误
 */
const crypto = require("crypto");

/** base64url 解码为 Buffer */
function base64urlDecode(str) {
  if (typeof str !== "string") throw new Error("invalid token");
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  return Buffer.from(s + "=".repeat(pad), "base64");
}

/** 恒定时间相等比较 */
function safeEqual(a, b) {
  const ab = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const bb = Buffer.isBuffer(b) ? b : Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** 重新计算签名（与生成保持一致） */
function computeSignature(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

/**
 * 验证 JWT
 * @param {string} token   JWT 字符串
 * @param {string} secret  密钥
 * @param {object} options { issuer, audience, ignoreExpiration, clockTolerance }
 * @returns {object} payload
 */
function verify(token, secret, options = {}) {
  if (typeof token !== "string") throw new Error("jwt must be a string");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("jwt malformed: expected 3 segments");

  const [headerSeg, payloadSeg, sigSeg] = parts;
  const data = headerSeg + "." + payloadSeg;
  const expected = computeSignature(data, secret);
  const actual = base64urlDecode(sigSeg);

  if (!safeEqual(expected, actual)) {
    throw new Error("invalid signature");
  }

  // 解析 header，校验算法
  let header;
  try {
    header = JSON.parse(base64urlDecode(headerSeg).toString("utf8"));
  } catch (e) {
    throw new Error("invalid header");
  }
  if (header.alg !== "HS256") throw new Error("unexpected alg: " + header.alg);

  // 解析 payload
  let payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadSeg).toString("utf8"));
  } catch (e) {
    throw new Error("invalid payload");
  }

  const now = Math.floor(Date.now() / 1000);
  const tol = options.clockTolerance || 0;

  // 过期校验
  if (!options.ignoreExpiration && payload.exp !== undefined) {
    if (now >= payload.exp + tol) throw new Error("jwt expired");
  }
  // 生效时间校验
  if (payload.nbf !== undefined) {
    if (now + tol < payload.nbf) throw new Error("jwt not active yet");
  }
  // 签发者校验
  if (options.issuer && payload.iss !== options.issuer) {
    throw new Error("jwt issuer invalid");
  }
  // 受众校验
  if (options.audience && payload.aud !== options.audience) {
    throw new Error("jwt audience invalid");
  }

  return payload;
}

// ===== 测试 =====
console.log("=== JWT 验证演示 ===");

const secret = "my-secret-key";

// 复用 558 的生成逻辑（这里内联一份，保持文件独立可运行）
function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
function signRaw(payload, sec, header) {
  const h = { alg: "HS256", typ: "JWT", ...(header || {}) };
  const headerSeg = base64url(JSON.stringify(h));
  const payloadSeg = base64url(JSON.stringify(payload));
  const data = headerSeg + "." + payloadSeg;
  const sig = crypto.createHmac("sha256", sec).update(data).digest();
  return data + "." + base64url(sig);
}

// 1) 正常验证
const now = Math.floor(Date.now() / 1000);
const token1 = signRaw(
  { userId: 1, iat: now, exp: now + 3600, iss: "demo" },
  secret,
);
const payload1 = verify(token1, secret, { issuer: "demo" });
console.log("正常验证 payload:", payload1); // { userId:1, iat, exp, iss:'demo' }

// 2) 签名错误
const tampered = token1.slice(0, token1.lastIndexOf(".") + 1) + "AAAA";
try {
  verify(tampered, secret);
  console.log("签名错误: 未抛异常(异常)");
} catch (e) {
  console.log("签名错误捕获:", e.message); // invalid signature
}

// 3) 密钥错误
try {
  verify(token1, "wrong-secret");
} catch (e) {
  console.log("密钥错误捕获:", e.message); // invalid signature
}

// 4) 过期 token
const expired = signRaw(
  { userId: 2, iat: now - 7200, exp: now - 3600 },
  secret,
);
try {
  verify(expired, secret);
} catch (e) {
  console.log("过期捕获:", e.message); // jwt expired
}
// 忽略过期
const expiredPayload = verify(expired, secret, { ignoreExpiration: true });
console.log("忽略过期验证:", expiredPayload.userId); // 2

// 5) nbf 未生效
const future = signRaw({ userId: 3, nbf: now + 3600 }, secret);
try {
  verify(future, secret);
} catch (e) {
  console.log("未生效捕获:", e.message); // jwt not active yet
}

// 6) 签发者不匹配
try {
  verify(token1, secret, { issuer: "other" });
} catch (e) {
  console.log("签发者不匹配捕获:", e.message); // jwt issuer invalid
}

// 7) 格式错误
try {
  verify("not.a.jwt.extra", secret);
} catch (e) {
  console.log("格式错误捕获:", e.message); // jwt malformed
}

// 8) 算法攻击（伪造 none 算法）
const noneHeader = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
const nonePayload = base64url(JSON.stringify({ userId: 99 }));
const noneToken = noneHeader + "." + nonePayload + ".";
try {
  verify(noneToken, secret);
} catch (e) {
  console.log("none 算法攻击捕获:", e.message); // invalid signature 或 unexpected alg
}
