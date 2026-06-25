/**
 * 手写 Cookie 解析
 *
 * 功能：将 Cookie 请求头字符串解析为键值对对象，并提供 Express 风格中间件
 * 实现思路：
 *   1. Cookie 头格式为 "key1=val1; key2=val2; key3=val3"
 *   2. 按 ";" 分割每对，再按第一个 "=" 分割键值
 *   3. 对键值做 trim，对值做 decodeURIComponent（支持 URL 编码值）
 *   4. 同名键默认保留第一个；支持解析带属性的 Set-Cookie（可选）
 */

/** 解析 Cookie 字符串为对象 */
function parseCookie(cookieStr, options = {}) {
  const obj = {};
  if (!cookieStr || typeof cookieStr !== "string") return obj;

  for (const pair of cookieStr.split(";")) {
    const eq = pair.indexOf("=");
    let key, val;
    if (eq === -1) {
      key = pair.trim();
      val = "";
    } else {
      key = pair.slice(0, eq).trim();
      val = pair.slice(eq + 1).trim();
    }
    if (!key) continue;
    if (!options.duplicates && key in obj) continue; // 默认同名取第一个

    // 去掉值两端的引号
    if (val.length >= 2 && val[0] === '"' && val[val.length - 1] === '"') {
      val = val.slice(1, -1);
    }
    // 解码
    if (options.decode !== false) {
      try {
        val = decodeURIComponent(val);
      } catch (e) {
        // 解码失败保留原值
      }
    }
    if (options.duplicates) {
      if (key in obj) {
        obj[key] = Array.isArray(obj[key])
          ? obj[key].push(val) && obj[key]
          : [obj[key], val];
      } else {
        obj[key] = val;
      }
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

/** 序列化对象为 Cookie 字符串（便于 Set-Cookie） */
function serializeCookie(name, value, options = {}) {
  const pairs = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge != null) pairs.push(`Max-Age=${options.maxAge}`);
  if (options.domain) pairs.push(`Domain=${options.domain}`);
  if (options.path) pairs.push(`Path=${options.path}`);
  if (options.expires) pairs.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) pairs.push("HttpOnly");
  if (options.secure) pairs.push("Secure");
  if (options.sameSite) pairs.push(`SameSite=${options.sameSite}`);
  return pairs.join("; ");
}

/** Cookie 解析中间件 */
function cookieParser(options) {
  return function (req, res, next) {
    const header = req.headers && (req.headers.cookie || req.headers.Cookie);
    req.cookies = parseCookie(header, options);
    next && next();
  };
}

// ===== 测试 =====
console.log("=== Cookie 解析演示 ===");

// 1) 基本解析
const c1 = parseCookie("name=alice; age=30; city=beijing");
console.log("基本解析:", c1); // { name:'alice', age:'30', city:'beijing' }

// 2) URL 编码值
const c2 = parseCookie("token=hello%20world; data=%E4%BD%A0%E5%A5%BD");
console.log("URL 解码:", c2); // { token:'hello world', data:'你好' }

// 3) 带空格与引号
const c3 = parseCookie('key1 = "quoted value" ; key2=plain');
console.log("空格与引号:", c3); // { key1:'quoted value', key2:'plain' }

// 4) 同名键（默认取第一个 / duplicates 取数组）
const c4a = parseCookie("tag=a; tag=b; tag=c");
console.log("同名默认:", c4a); // { tag:'a' }
const c4b = parseCookie("tag=a; tag=b; tag=c", { duplicates: true });
console.log("同名数组:", c4b); // { tag:['a','b','c'] }

// 5) 无值 cookie
const c5 = parseCookie("flag; key=val");
console.log("无值键:", c5); // { flag:'', key:'val' }

// 6) 空字符串
console.log("空字符串:", parseCookie("")); // {}

// 7) 序列化
const ser = serializeCookie("session", "abc123", {
  maxAge: 3600,
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});
console.log("序列化 Set-Cookie:", ser); // session=abc123; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax

// 8) 中间件形式
const req = { headers: { cookie: "sid=xyz; theme=dark" } };
cookieParser()(req, null, () => {});
console.log("中间件结果:", req.cookies); // { sid:'xyz', theme:'dark' }
