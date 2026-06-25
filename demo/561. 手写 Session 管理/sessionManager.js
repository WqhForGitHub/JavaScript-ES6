/**
 * 手写 Session 管理
 *
 * 功能：基于内存的会话管理，支持创建/读取/更新/销毁与过期清理
 * 实现思路：
 *   1. 用 Map 存储 sessionId -> { id, data, expires }
 *   2. 用 crypto.randomBytes 生成随机 sessionId
 *   3. 每次访问续期(ttl)；过期会话在 get 时惰性删除 + 定时器主动清理
 *   4. 提供中间件，通过 Cookie 中的 sid 关联会话，并下发 Set-Cookie
 */
const crypto = require("crypto");

class SessionStore {
  constructor(options = {}) {
    this.sessions = new Map();
    this.ttl = options.ttl || 1800; // 默认 30 分钟（秒）
    this.cleanupInterval = options.cleanupInterval || 60; // 清理间隔（秒）
    this._timer = setInterval(
      () => this.cleanup(),
      this.cleanupInterval * 1000,
    );
    if (this._timer.unref) this._timer.unref();
  }

  /** 生成 32 字节随机十六进制 sessionId */
  generateId() {
    return crypto.randomBytes(16).toString("hex");
  }

  /** 创建新会话 */
  create(data = {}) {
    const id = this.generateId();
    const session = {
      id,
      data: { ...data },
      expires: Date.now() + this.ttl * 1000,
    };
    this.sessions.set(id, session);
    return session;
  }

  /** 读取会话（自动续期，过期返回 null） */
  get(id) {
    if (!id) return null;
    const s = this.sessions.get(id);
    if (!s) return null;
    if (Date.now() > s.expires) {
      this.sessions.delete(id);
      return null;
    }
    s.expires = Date.now() + this.ttl * 1000; // 续期
    return s;
  }

  /** 更新会话数据 */
  set(id, data) {
    const s = this.sessions.get(id);
    if (!s) return null;
    s.data = { ...data };
    s.expires = Date.now() + this.ttl * 1000;
    return s;
  }

  /** 修改单个字段 */
  touch(id, patch) {
    const s = this.get(id);
    if (!s) return null;
    Object.assign(s.data, patch);
    return s;
  }

  /** 销毁会话 */
  destroy(id) {
    return this.sessions.delete(id);
  }

  /** 主动清理过期会话 */
  cleanup() {
    const now = Date.now();
    let count = 0;
    for (const [id, s] of this.sessions) {
      if (now > s.expires) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  /** 当前会话数量 */
  size() {
    return this.sessions.size;
  }

  /** 停止定时器 */
  close() {
    clearInterval(this._timer);
    this.sessions.clear();
  }
}

/** Session 中间件：通过 Cookie sid 关联会话 */
function sessionMiddleware(store, options = {}) {
  const cookieName = options.name || "sid";
  const cookieOptions = options.cookie || { httpOnly: true, path: "/" };
  return function (req, res, next) {
    const cookies = parseSimpleCookie(
      req.headers && (req.headers.cookie || ""),
    );
    let sid = cookies[cookieName];
    let session = store.get(sid);
    if (!session) {
      session = store.create({});
    }
    req.session = session;
    if (res.setHeader) {
      res.setHeader(
        "Set-Cookie",
        serializeSimpleCookie(cookieName, session.id, cookieOptions),
      );
    }
    next && next();
  };
}

// 辅助：极简 cookie 解析与序列化
function parseSimpleCookie(str) {
  const obj = {};
  if (!str) return obj;
  for (const pair of str.split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    obj[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  return obj;
}
function serializeSimpleCookie(name, value, opts) {
  const parts = [`${name}=${value}`];
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join("; ");
}

// ===== 测试 =====
console.log("=== Session 管理演示 ===");

const store = new SessionStore({ ttl: 3600 });

// 1) 创建与读取
const s1 = store.create({ user: "alice", role: "admin" });
console.log("创建会话 id 长度:", s1.id.length); // 32
console.log("创建会话数据:", s1.data); // { user:'alice', role:'admin' }

const got = store.get(s1.id);
console.log("读取会话:", got.data.user); // alice

// 2) 更新
store.set(s1.id, { user: "alice", loginCount: 2 });
console.log("更新后:", store.get(s1.id).data); // { user:'alice', loginCount:2 }

// 3) touch 局部更新
store.touch(s1.id, { last: "2026-01-01" });
console.log("touch 后:", store.get(s1.id).data); // 含 last

// 4) 销毁
store.destroy(s1.id);
console.log("销毁后 get:", store.get(s1.id)); // null
console.log("当前数量:", store.size()); // 0

// 5) 过期测试（手动置为过期）
const s2 = store.create({ x: 1 });
store.sessions.get(s2.id).expires = Date.now() - 1000;
console.log("过期会话 get:", store.get(s2.id)); // null
console.log("过期后数量:", store.size()); // 0

// 6) 非法 id
console.log("非法 id get:", store.get("not-exist")); // null

// 7) 中间件演示
const store2 = new SessionStore({ ttl: 3600 });
const mw = sessionMiddleware(store2, { name: "sid" });
const req = { headers: { cookie: "" } };
const res = {
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v;
  },
};
mw(req, res, () => {});
console.log("中间件创建 session:", !!req.session); // true
console.log("中间件 Set-Cookie:", res.headers["Set-Cookie"]); // sid=xxx; Path=/; HttpOnly

// 第二次请求带 sid
const sid = req.session.id;
const req2 = { headers: { cookie: `sid=${sid}` } };
const res2 = {
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v;
  },
};
mw(req2, res2, () => {});
console.log("复用同一会话:", req2.session.id === sid); // true
console.log("会话总数:", store2.size()); // 1

store.close();
store2.close();
