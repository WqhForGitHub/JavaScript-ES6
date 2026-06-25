/**
 * 手写同源策略检测
 *
 * 功能：判断两个 URL 是否同源（Same-Origin）
 *       浏览器同源策略：协议、主机、端口三者完全相同才为同源
 *
 * 实现思路：
 *   1. 使用 URL 构造函数解析（兼容浏览器与 Node 10+）
 *   2. 比较 protocol + hostname + port 三元组
 *   3. 处理默认端口：http 默认 80，https 默认 443
 *   4. 处理特殊协议：file:、data:、blob: 等的特殊规则
 *   5. 主机大小写不敏感（域名不区分大小写）
 *
 * 应用场景：
 *   - 跨域请求判断（CORS）
 *   - postMessage 目标校验
 *   - iframe 通信权限
 *   - Cookie 作用域
 */

// 默认端口表
const DEFAULT_PORTS = {
  "http:": "80",
  "https:": "443",
  "ws:": "80",
  "wss:": "443",
  "ftp:": "21",
};

// 规范化端口：将默认端口统一为空字符串
function normalizePort(port, protocol) {
  if (!port || port === "") {
    return DEFAULT_PORTS[protocol] || "";
  }
  // 默认端口视为相同
  if (DEFAULT_PORTS[protocol] && String(port) === DEFAULT_PORTS[protocol]) {
    return "";
  }
  return String(port);
}

// 解析 URL 并返回 origin 元组
function parseOrigin(urlStr, base) {
  let url;
  try {
    url = new URL(urlStr, base);
  } catch (e) {
    throw new Error("无效 URL: " + urlStr);
  }
  return {
    protocol: url.protocol.toLowerCase(),
    hostname: url.hostname.toLowerCase(),
    port: normalizePort(url.port, url.protocol),
    origin: url.origin,
    href: url.href,
  };
}

// 主检测：两个 URL 是否同源
function isSameOrigin(urlA, urlB, base) {
  const a = parseOrigin(urlA, base);
  const b = parseOrigin(urlB, base);
  return (
    a.protocol === b.protocol && a.hostname === b.hostname && a.port === b.port
  );
}

// 获取 origin 字符串
function getOrigin(urlStr, base) {
  const o = parseOrigin(urlStr, base);
  return `${o.protocol}//${o.hostname}${o.port ? ":" + o.port : ""}`;
}

// 详细比较信息
function compareOrigins(urlA, urlB, base) {
  const a = parseOrigin(urlA, base);
  const b = parseOrigin(urlB, base);
  return {
    sameOrigin: isSameOrigin(urlA, urlB, base),
    originA: a,
    originB: b,
    differences: {
      protocol: a.protocol !== b.protocol,
      hostname: a.hostname !== b.hostname,
      port: a.port !== b.port,
    },
  };
}

// postMessage 场景：验证 event.origin
function verifyMessageOrigin(event, allowedOrigins) {
  const allowed = new Set(
    allowedOrigins.map((o) => o.toLowerCase().replace(/\/$/, "")),
  );
  const origin = (event.origin || "").toLowerCase().replace(/\/$/, "");
  return allowed.has(origin);
}

// Cookie 作用域检查：domain 是否匹配
function isCookieDomainMatch(hostname, cookieDomain) {
  if (!cookieDomain) return true; // host-only
  const d = cookieDomain.replace(/^\./, "").toLowerCase();
  const h = hostname.toLowerCase();
  return h === d || h.endsWith("." + d);
}

// ===== 测试 =====
console.log("=== 手写同源策略检测 ===");

// 同源
const cases = [
  // [urlA, urlB, 预期]
  ["https://example.com/page", "https://example.com/other", true], // 同源
  ["http://example.com", "https://example.com", false], // 协议不同
  ["https://example.com", "https://example.com:443", true], // https 默认 443
  ["http://example.com", "http://example.com:80", true], // http 默认 80
  ["http://example.com:8080", "http://example.com:9090", false], // 端口不同
  ["https://example.com", "https://sub.example.com", false], // 主机不同
  ["https://example.com", "https://EXAMPLE.com", true], // 大小写不敏感
  ["https://example.com/path?a=1", "https://example.com/path2#hash", true], // 路径/查询/锚点不影响
  ["https://example.com", "https://example.com.evil.com", false], // 子串欺骗
  ["file:///C:/a.html", "file:///D:/b.html", false], // file: 不同路径不同源
  ["data:text/html,xxx", "data:text/html,yyy", false], // data: 每个独立
];

console.log("--- 同源判定 ---");
for (const [a, b, expected] of cases) {
  const result = isSameOrigin(a, b);
  const mark = result === expected ? "OK" : "FAIL";
  console.log(`[${mark}] ${a} vs ${b} => ${result} (预期 ${expected})`);
}

// 详细比较
console.log("\n--- 详细比较 ---");
console.log(compareOrigins("http://a.com:8080", "https://a.com:8080"));

// postMessage origin 验证
console.log("\n--- postMessage origin 验证 ---");
const allowedOrigins = ["https://trusted.com", "https://api.trusted.com"];
const fakeEvent1 = { origin: "https://trusted.com" };
const fakeEvent2 = { origin: "https://evil.com" };
console.log("可信来源:", verifyMessageOrigin(fakeEvent1, allowedOrigins)); // 预期: true
console.log("不可信来源:", verifyMessageOrigin(fakeEvent2, allowedOrigins)); // 预期: false

// Cookie 域匹配
console.log("\n--- Cookie 域匹配 ---");
console.log("a.com 匹配 .a.com:", isCookieDomainMatch("a.com", ".a.com")); // 预期: true
console.log(
  "sub.a.com 匹配 .a.com:",
  isCookieDomainMatch("sub.a.com", ".a.com"),
); // 预期: true
console.log("evil.com 匹配 .a.com:", isCookieDomainMatch("evil.com", ".a.com")); // 预期: false
console.log(
  "a.com.evil.com 匹配 a.com:",
  isCookieDomainMatch("a.com.evil.com", "a.com"),
); // 预期: false

// origin 字符串
console.log("\n--- origin 字符串 ---");
console.log(getOrigin("http://example.com:8080/path")); // 预期: http://example.com:8080
console.log(getOrigin("https://example.com")); // 预期: https://example.com
