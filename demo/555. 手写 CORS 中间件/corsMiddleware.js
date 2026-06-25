/**
 * 手写 CORS 中间件
 *
 * 功能：为 HTTP 响应添加跨域资源共享(CORS)响应头，并处理预检请求
 * 实现思路：
 *   1. 设置 Access-Control-Allow-Origin 等响应头
 *   2. OPTIONS 预检请求返回 204，附加 Allow-Methods / Allow-Headers / Max-Age
 *   3. 支持配置：origin 可为 通配/字符串/数组/函数、credentials、allowedHeaders、exposedHeaders、maxAge
 *   4. 凭证模式下不允许使用通配 '*'，需回显具体 Origin
 */
function cors(options = {}) {
  const {
    origin = "*",
    methods = "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders,
    credentials = false,
    maxAge = 86400,
    exposedHeaders,
  } = options;

  /** 计算允许的 Origin 值，返回字符串或 null */
  function resolveOrigin(reqOrigin) {
    if (origin === "*") return "*";
    if (typeof origin === "boolean") return origin ? reqOrigin || "*" : null;
    if (typeof origin === "function") return origin(reqOrigin);
    if (Array.isArray(origin))
      return reqOrigin && origin.includes(reqOrigin) ? reqOrigin : null;
    return origin === reqOrigin ? reqOrigin : null;
  }

  return function corsMiddleware(req, res, next) {
    const reqOrigin = req.headers && req.headers.origin;
    const allow = resolveOrigin(reqOrigin);

    if (allow) {
      // 凭证模式下不能用 '*'，必须回显具体 origin
      const originValue =
        allow === "*" && credentials ? reqOrigin || "*" : allow;
      res.setHeader("Access-Control-Allow-Origin", originValue);
      if (credentials)
        res.setHeader("Access-Control-Allow-Credentials", "true");
      if (exposedHeaders) {
        res.setHeader("Access-Control-Expose-Headers", exposedHeaders);
      }
    }

    // 预检请求处理
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", methods);
      const headers =
        allowedHeaders || req.headers["access-control-request-headers"];
      if (headers) res.setHeader("Access-Control-Allow-Headers", headers);
      res.setHeader("Access-Control-Max-Age", String(maxAge));
      res.writeHead(204);
      res.end();
      return;
    }

    next && next();
  };
}

// ===== 测试（使用 mock req/res） =====
console.log("=== CORS 中间件演示 ===");

function mockRes() {
  const r = { statusCode: 200, headers: {}, ended: false, body: "" };
  // 模拟 Node http 行为：setHeader 会把 key 转为小写
  r.setHeader = function (k, v) {
    r.headers[String(k).toLowerCase()] = v;
  };
  r.writeHead = function (s) {
    r.statusCode = s;
  };
  r.end = function (b) {
    r.ended = true;
    r.body = b == null ? "" : b;
  };
  return r;
}

// 1) 通配 origin
const mw1 = cors();
const res1 = mockRes();
mw1({ method: "GET", headers: { origin: "https://a.com" } }, res1, () => {});
console.log(
  "通配模式 Allow-Origin:",
  res1.headers["access-control-allow-origin"],
); // *

// 2) 指定 origin 白名单 + 凭证
const mw2 = cors({
  origin: ["https://a.com", "https://b.com"],
  credentials: true,
  exposedHeaders: "X-Total",
});
const res2 = mockRes();
mw2({ method: "GET", headers: { origin: "https://a.com" } }, res2, () => {});
console.log(
  "白名单 Allow-Origin:",
  res2.headers["access-control-allow-origin"],
); // https://a.com
console.log(
  "Allow-Credentials:",
  res2.headers["access-control-allow-credentials"],
); // true
console.log("Expose-Headers:", res2.headers["access-control-expose-headers"]); // X-Total

const res2b = mockRes();
mw2(
  { method: "GET", headers: { origin: "https://evil.com" } },
  res2b,
  () => {},
);
console.log(
  "非法 origin Allow-Origin:",
  res2b.headers["access-control-allow-origin"],
); // undefined

// 3) 预检请求 OPTIONS
const mw3 = cors({
  origin: "https://a.com",
  allowedHeaders: "Content-Type, Authorization",
  maxAge: 600,
});
const res3 = mockRes();
mw3(
  {
    method: "OPTIONS",
    headers: {
      origin: "https://a.com",
      "access-control-request-headers": "X-Custom",
    },
  },
  res3,
  () => console.log("不该进 next"),
);
console.log("预检状态码:", res3.statusCode); // 204
console.log(
  "预检 Allow-Methods:",
  res3.headers["access-control-allow-methods"],
);
console.log(
  "预检 Allow-Headers:",
  res3.headers["access-control-allow-headers"],
); // Content-Type, Authorization
console.log("预检 Max-Age:", res3.headers["access-control-max-age"]); // 600
console.log("预检是否结束:", res3.ended); // true

// 4) function 形式 origin
const mw4 = cors({
  origin: (o) => (o && o.endsWith(".allowed.com") ? o : null),
});
const res4 = mockRes();
mw4({ method: "GET", headers: { origin: "app.allowed.com" } }, res4, () => {});
console.log("函数 origin 校验:", res4.headers["access-control-allow-origin"]); // app.allowed.com
