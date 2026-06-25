/**
 * 手写 CORS 预检请求处理
 *
 * 功能：处理浏览器跨域请求中的 CORS 预检（Preflight）请求
 *       对 OPTIONS 方法返回正确的预检响应头
 *
 * CORS 流程：
 *   1. 简单请求：GET/HEAD/POST + 简单头部，浏览器直接发送
 *   2. 预检请求：浏览器先发 OPTIONS，询问服务器是否允许真实请求
 *      触发条件：方法为 PUT/DELETE/PATCH 等，或自定义头，或 Content-Type 非简单类型
 *
 * 关键头部：
 *   - 请求：Origin, Access-Control-Request-Method, Access-Control-Request-Headers
 *   - 响应：Access-Control-Allow-Origin, Allow-Methods, Allow-Headers,
 *           Max-Age, Allow-Credentials, Expose-Headers
 */

// 是否为「简单」请求（不触发预检）
function isSimpleRequest(req) {
  const method = (req.method || "GET").toUpperCase();
  const SIMPLE_METHODS = ["GET", "HEAD", "POST"];
  if (!SIMPLE_METHODS.includes(method)) return false;

  const SIMPLE_CONTENT_TYPES = [
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain",
  ];
  const contentType = (req.headers["content-type"] || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (contentType && !SIMPLE_CONTENT_TYPES.includes(contentType)) return false;

  const SIMPLE_HEADERS = [
    "accept",
    "accept-language",
    "content-language",
    "content-type",
    "range",
    "origin",
    "dpr",
    "downlink",
    "save-data",
    "viewport-width",
    "width",
  ];
  const customHeaders = Object.keys(req.headers || {}).filter(
    (h) => !SIMPLE_HEADERS.includes(h.toLowerCase()),
  );
  if (customHeaders.length > 0) return false;

  return true;
}

// CORS 配置
const DEFAULT_CONFIG = {
  allowedOrigins: ["*"], // 允许的源，['*'] 或具体域名列表
  allowCredentials: false, // 是否允许带 cookie
  allowedMethods: ["GET", "POST", "HEAD", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["X-Total-Count", "X-Request-Id"],
  maxAge: 86400, // 预检结果缓存秒数
};

// 计算 Access-Control-Allow-Origin
function computeAllowOrigin(origin, config) {
  if (!origin) return null;
  if (config.allowedOrigins.includes("*")) {
    // 允许凭证时不能用 *，必须回显具体 origin
    return config.allowCredentials ? origin : "*";
  }
  if (config.allowedOrigins.includes(origin)) return origin;
  // 支持通配子域：*.example.com
  for (const pattern of config.allowedOrigins) {
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1);
      if (new URL(origin).hostname.endsWith(suffix)) return origin;
    }
  }
  return null;
}

// 处理预检请求 OPTIONS
function handlePreflight(req, config = DEFAULT_CONFIG) {
  const origin = req.headers.origin;
  const allowOrigin = computeAllowOrigin(origin, config);

  if (!allowOrigin) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "text/plain" },
      body: "CORS: Origin not allowed",
    };
  }

  // 读取预检请求头
  const reqMethod = req.headers["access-control-request-method"];
  const reqHeaders = (req.headers["access-control-request-headers"] || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  // 校验请求方法是否被允许
  if (reqMethod && !config.allowedMethods.includes(reqMethod.toUpperCase())) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "text/plain" },
      body: `CORS: Method ${reqMethod} not allowed`,
    };
  }

  // 校验请求头是否被允许
  const allowedLower = config.allowedHeaders.map((h) => h.toLowerCase());
  const disallowedHeaders = reqHeaders.filter((h) => !allowedLower.includes(h));
  if (disallowedHeaders.length > 0) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "text/plain" },
      body: `CORS: Headers not allowed: ${disallowedHeaders.join(", ")}`,
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": config.allowedMethods.join(", "),
    "Access-Control-Allow-Headers": config.allowedHeaders.join(", "),
    "Access-Control-Max-Age": String(config.maxAge),
    "Access-Control-Expose-Headers": config.exposedHeaders.join(", "),
    "Content-Length": "0",
  };
  if (config.allowCredentials && allowOrigin !== "*") {
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  if (allowOrigin !== "*") {
    headers["Vary"] = "Origin";
  }

  return { statusCode: 204, headers, body: "" };
}

// 为实际请求添加 CORS 响应头
function applyCorsHeaders(req, responseHeaders, config = DEFAULT_CONFIG) {
  const origin = req.headers.origin;
  if (!origin) return responseHeaders;
  const allowOrigin = computeAllowOrigin(origin, config);
  if (allowOrigin) {
    responseHeaders["Access-Control-Allow-Origin"] = allowOrigin;
    if (config.allowCredentials && allowOrigin !== "*") {
      responseHeaders["Access-Control-Allow-Credentials"] = "true";
    }
    if (config.exposedHeaders.length) {
      responseHeaders["Access-Control-Expose-Headers"] =
        config.exposedHeaders.join(", ");
    }
    if (allowOrigin !== "*") {
      responseHeaders["Vary"] = "Origin";
    }
  }
  return responseHeaders;
}

// 统一中间件
function corsMiddleware(config = DEFAULT_CONFIG) {
  return function (req) {
    // 预检请求
    if ((req.method || "").toUpperCase() === "OPTIONS") {
      return handlePreflight(req, config);
    }
    // 普通请求：附加 CORS 头
    const headers = applyCorsHeaders(req, {}, config);
    return { statusCode: 200, headers, body: "OK" };
  };
}

// ===== 测试 =====
console.log("=== 手写 CORS 预检请求处理 ===");

// 1. 判断是否需要预检
console.log("\n--- 简单 vs 预检 ---");
console.log("GET 无自定义头:", isSimpleRequest({ method: "GET", headers: {} })); // 预期: true
console.log(
  "POST application/json:",
  isSimpleRequest({
    method: "POST",
    headers: { "content-type": "application/json" },
  }),
); // 预期: false
console.log("PUT 方法:", isSimpleRequest({ method: "PUT", headers: {} })); // 预期: false
console.log(
  "GET 带 Authorization:",
  isSimpleRequest({ method: "GET", headers: { authorization: "Bearer xxx" } }),
); // 预期: false
console.log(
  "POST text/plain:",
  isSimpleRequest({
    method: "POST",
    headers: { "content-type": "text/plain" },
  }),
); // 预期: true

// 2. 处理预检请求 - 允许
console.log("\n--- 预检请求处理（允许） ---");
const preflightReq = {
  method: "OPTIONS",
  headers: {
    origin: "https://app.example.com",
    "access-control-request-method": "PUT",
    "access-control-request-headers": "Content-Type, Authorization",
  },
};
const result = handlePreflight(preflightReq);
console.log("状态码:", result.statusCode); // 预期: 204
console.log("响应头:", result.headers);
// 预期: Access-Control-Allow-Origin: https://app.example.com
//        Access-Control-Allow-Methods: GET, POST, ...
//        Access-Control-Allow-Headers: Content-Type, Authorization, ...
//        Access-Control-Max-Age: 86400

// 3. 预检请求 - 禁止的 origin
console.log("\n--- 预检请求处理（禁止 origin） ---");
const blockedReq = {
  ...preflightReq,
  headers: { ...preflightReq.headers, origin: "https://evil.com" },
};
const blockedResult = handlePreflight(blockedReq, {
  ...DEFAULT_CONFIG,
  allowedOrigins: ["https://app.example.com"],
});
console.log("状态码:", blockedResult.statusCode); // 预期: 403
console.log("响应:", blockedResult.body);

// 4. 预检请求 - 禁止的方法
console.log("\n--- 预检请求处理（禁止方法） ---");
const methodReq = {
  method: "OPTIONS",
  headers: {
    origin: "https://app.example.com",
    "access-control-request-method": "TRACE",
    "access-control-request-headers": "",
  },
};
const methodResult = handlePreflight(methodReq, {
  ...DEFAULT_CONFIG,
  allowedOrigins: ["https://app.example.com"],
});
console.log("状态码:", methodResult.statusCode); // 预期: 403

// 5. 带凭证场景
console.log("\n--- 带 Cookie 凭证 ---");
const credConfig = {
  ...DEFAULT_CONFIG,
  allowedOrigins: ["https://app.example.com"],
  allowCredentials: true,
};
const credResult = handlePreflight(preflightReq, credConfig);
console.log(
  "Allow-Credentials:",
  credResult.headers["Access-Control-Allow-Credentials"],
); // 预期: true
console.log(
  "Allow-Origin (非 *):",
  credResult.headers["Access-Control-Allow-Origin"],
); // 预期: https://app.example.com

// 6. 通配子域
console.log("\n--- 通配子域 ---");
const subDomainConfig = {
  ...DEFAULT_CONFIG,
  allowedOrigins: ["*.example.com"],
  allowCredentials: true,
};
const subReq = {
  method: "OPTIONS",
  headers: {
    origin: "https://login.sub.example.com",
    "access-control-request-method": "POST",
  },
};
const subResult = handlePreflight(subReq, subDomainConfig);
console.log("状态码:", subResult.statusCode); // 预期: 204
console.log("Allow-Origin:", subResult.headers["Access-Control-Allow-Origin"]); // 预期: https://login.sub.example.com

// 7. 实际请求附加头
console.log("\n--- 实际请求附加 CORS 头 ---");
const actualReq = {
  method: "GET",
  headers: { origin: "https://app.example.com" },
};
const actualHeaders = applyCorsHeaders(actualReq, {
  "Content-Type": "application/json",
});
console.log("附加后:", actualHeaders);

// 8. 中间件统一处理
console.log("\n--- 中间件统一处理 ---");
const mw = corsMiddleware({
  ...DEFAULT_CONFIG,
  allowedOrigins: ["https://app.example.com"],
});
console.log("OPTIONS ->", mw(preflightReq).statusCode); // 预期: 204
console.log("GET ->", mw(actualReq).statusCode); // 预期: 200
