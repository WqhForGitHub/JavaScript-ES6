/**
 * 手写 Cookie 操作封装（增删改查）
 *
 * Cookie 是浏览器存储在客户端的小段数据，通过 Set-Cookie 响应头 / Cookie 请求头传输，
 * 也可用 document.cookie 读写。这里封装一套工具，提供：
 *   - get(name)            读取单个 cookie
 *   - set(name, value, options) 写入（支持 expires/path/domain/secure/sameSite）
 *   - remove(name, options)删除（通过设置过期）
 *   - getAll()             读取全部为对象
 *   - has(name)            是否存在
 *
 * 实现思路：
 *   1. document.cookie 读取返回所有，需自行按 "; " 分割解析
 *   2. 写入时拼接 "name=value; path=...; expires=..." 赋值给 document.cookie
 *   3. 删除时把 expires 设为过去时间
 *   4. Node 环境无 document，用内存 Map 模拟便于测试
 */

const cookieUtils = (function () {
  // 是否有真实 document
  const hasDoc = typeof document !== "undefined" && typeof document === "object";
  // 内存模拟存储（Node 环境测试用）
  const memStore = new Map();

  function readRaw() {
    if (hasDoc) return document.cookie;
    return Array.from(memStore.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  function writeRaw(str) {
    if (hasDoc) {
      document.cookie = str;
    } else {
      // 解析 "name=value; path=/; ..." 形式存入内存
      const parts = str.split(";").map((p) => p.trim());
      const [pair] = parts;
      const idx = pair.indexOf("=");
      if (idx !== -1) {
        const name = pair.slice(0, idx);
        const value = pair.slice(idx + 1);
        memStore.set(name, value);
      }
    }
  }

  function get(name) {
    const map = getAll();
    return map[name];
  }

  function getAll() {
    const raw = readRaw();
    const result = {};
    if (!raw) return result;
    raw.split(";").forEach((pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return;
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      result[name] = decodeURIComponent(value);
    });
    return result;
  }

  function set(name, value, options = {}) {
    const {
      maxAge,
      expires,
      path = "/",
      domain,
      secure,
      sameSite,
      httpOnly,
    } = options;

    let str = `${name}=${encodeURIComponent(value)}`;
    if (maxAge != null) str += `; Max-Age=${maxAge}`;
    if (expires) {
      const exp =
        expires instanceof Date ? expires.toUTCString() : String(expires);
      str += `; Expires=${exp}`;
    }
    if (path) str += `; Path=${path}`;
    if (domain) str += `; Domain=${domain}`;
    if (secure) str += "; Secure";
    if (sameSite) str += `; SameSite=${sameSite}`;
    if (httpOnly) str += "; HttpOnly";
    writeRaw(str);
    return cookieUtils;
  }

  function remove(name, options = {}) {
    // 通过把 expires 设为过去时间删除
    set(name, "", {
      ...options,
      expires: new Date(0),
      maxAge: 0,
    });
    if (!hasDoc) memStore.delete(name);
    return cookieUtils;
  }

  function has(name) {
    return Object.prototype.hasOwnProperty.call(getAll(), name);
  }

  return { get, getAll, set, remove, has };
})();

// ===== 测试（Node 环境用内存模拟） =====
cookieUtils.set("token", "abc-123", { path: "/", maxAge: 3600 });
cookieUtils.set("user", "张三", { path: "/" });
cookieUtils.set("theme", "dark");

console.log("get token:", cookieUtils.get("token")); // get token: abc-123
console.log("get user:", cookieUtils.get("user")); // get user: 张三
console.log("getAll:", cookieUtils.getAll()); // getAll: { token: 'abc-123', user: '张三', theme: 'dark' }
console.log("has user:", cookieUtils.has("user")); // has user: true
console.log("has xxx:", cookieUtils.has("xxx")); // has xxx: false

// 修改（同名覆盖）
cookieUtils.set("theme", "light");
console.log("修改后 theme:", cookieUtils.get("theme")); // 修改后 theme: light

// 删除
cookieUtils.remove("token");
console.log("删除 token 后:", cookieUtils.get("token")); // 删除 token 后: undefined
console.log("删除后 has token:", cookieUtils.has("token")); // 删除后 has token: false

// 带 expires
cookieUtils.set("temp", "v", { expires: new Date("2099-01-01") });
console.log("temp:", cookieUtils.get("temp")); // temp: v

// URL 中的特殊字符
cookieUtils.set("data", "a=1&b=2");
console.log("特殊字符:", cookieUtils.get("data")); // 特殊字符: a=1&b=2
