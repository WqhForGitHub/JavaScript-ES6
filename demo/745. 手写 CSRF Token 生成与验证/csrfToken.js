/**
 * 手写 CSRF Token 生成与验证
 *
 * 功能：生成与校验 CSRF（Cross-Site Request Forgery）令牌
 *       防止跨站请求伪造攻击
 *
 * 实现思路：
 *   1. 使用加密安全的随机源生成 token（优先 crypto.randomBytes / Web Crypto）
 *   2. 采用「同步令牌模式（Synchronizer Token Pattern）」：
 *      - 服务端会话中保存 token
 *      - 表单提交时携带 token
 *      - 服务端用恒定时间比较验证
 *   3. 采用「双重提交 Cookie 模式」：cookie 与请求头/请求体中的 token 一致即认为合法
 */

const crypto = require("crypto");

// 生成 token：32 字节随机数 + base64url 编码
function generateCsrfToken(byteLen = 32) {
  return crypto.randomBytes(byteLen).toString("base64url");
}

// 恒定时间字符串比较，避免计时攻击
function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // 即使长度不同也要做一次比较避免计时泄漏
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// 简易会话存储（演示用，生产环境用 redis/数据库）
class CsrfStore {
  constructor() {
    this.sessions = new Map();
  }

  // 登录时调用，为会话颁发 token
  issue(sessionId) {
    const token = generateCsrfToken();
    this.sessions.set(sessionId, { token, issuedAt: Date.now() });
    return token;
  }

  // 校验 token
  verify(sessionId, token) {
    const record = this.sessions.get(sessionId);
    if (!record) return false;
    // token 有效期 1 小时
    if (Date.now() - record.issuedAt > 3600 * 1000) {
      this.sessions.delete(sessionId);
      return false;
    }
    return timingSafeEqualStr(record.token, token);
  }

  // 旋转 token（一次性令牌使用后重新颁发）
  rotate(sessionId) {
    return this.issue(sessionId);
  }
}

// 双重提交 Cookie 模式：比较 cookie 与 header 中的 token
function verifyDoubleSubmit(cookieToken, headerToken) {
  if (!cookieToken || !headerToken) return false;
  return timingSafeEqualStr(cookieToken, headerToken);
}

// ===== 测试 =====
console.log("=== 手写 CSRF Token 生成与验证 ===");

const store = new CsrfStore();
const sessionId = "session-abc";

// 1. 颁发
const token = store.issue(sessionId);
console.log("颁发的 token:", token);
console.log("token 长度:", token.length, "(>= 43 表示 32 字节 base64url)");
// 预期: token 长度 43

// 2. 验证正确
console.log("正确 token 校验:", store.verify(sessionId, token)); // 预期: true

// 3. 验证错误
console.log("错误 token 校验:", store.verify(sessionId, "wrong-token")); // 预期: false
console.log("不存在会话校验:", store.verify("no-session", token)); // 预期: false

// 4. 双重提交 cookie 模式
const cookieToken = generateCsrfToken();
console.log("双提交一致:", verifyDoubleSubmit(cookieToken, cookieToken)); // 预期: true
console.log("双提交不一致:", verifyDoubleSubmit(cookieToken, "other")); // 预期: false

// 5. 旋转 token
const newToken = store.rotate(sessionId);
console.log("旋转后旧 token 失效:", !store.verify(sessionId, token)); // 预期: false (旧失效)
console.log("旋转后新 token 有效:", store.verify(sessionId, newToken)); // 预期: false (因为 issue 覆盖)
// 注意：上面预期 false 是因为 rotate 后旧 session 已被新 token 覆盖，旧 token 失效
