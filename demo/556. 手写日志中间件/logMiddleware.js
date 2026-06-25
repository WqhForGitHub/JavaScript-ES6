/**
 * 手写日志中间件
 *
 * 功能：记录每个 HTTP 请求的方法、路径、状态码与响应耗时
 * 实现思路：
 *   1. 进入中间件时记录高精度起始时间(process.hrtime.bigint)
 *   2. 在响应对象的 finish 事件触发时计算耗时（此时状态码已确定）
 *   3. 支持自定义 logger 与格式化函数，便于接入日志系统
 *   4. 同时输出请求开始日志，便于追踪长请求
 */
const EventEmitter = require("events");

function logMiddleware(options = {}) {
  const { logger = console.log, format, logStart = false } = options;

  return function (req, res, next) {
    const start = process.hrtime.bigint();
    const { method, url } = req;
    const startTs = new Date();

    if (logStart) {
      logger(`[${startTs.toISOString()}] --> ${method} ${url}`);
    }

    // 标准响应对象会在 finish 时触发；mock 时可手动 emit
    res.on("finish", () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      const status = res.statusCode;
      const line = format
        ? format({ method, url, status, ms, start: startTs })
        : `[${startTs.toISOString()}] ${method} ${url} ${status} ${ms.toFixed(2)}ms`;
      logger(line);
    });

    next && next();
  };
}

// ===== 测试（使用 mock req/res） =====
console.log("=== 日志中间件演示 ===");

function mockReq(method, url) {
  return { method, url, headers: {} };
}

function mockRes(statusCode = 200) {
  const r = new EventEmitter();
  r.statusCode = statusCode;
  r.setHeader = () => {};
  r.writeHead = function (s) {
    r.statusCode = s;
  };
  r.end = function () {
    r.emit("finish");
  };
  return r;
}

// 1) 默认格式
const logs1 = [];
const mw1 = logMiddleware({ logger: (s) => logs1.push(s) });
const req1 = mockReq("GET", "/api/users");
const res1 = mockRes(200);
mw1(req1, res1, () => {});
res1.end(); // 触发 finish
console.log("默认格式:", logs1[0]); // [ISO] GET /api/users 200 xx.xxms

// 2) 自定义格式
const logs2 = [];
const mw2 = logMiddleware({
  logger: (s) => logs2.push(s),
  format: ({ method, url, status, ms }) =>
    `${method} ${url} -> ${status} (${ms.toFixed(0)}ms)`,
});
const res2 = mockRes(404);
mw2(mockReq("POST", "/login"), res2, () => {});
res2.end();
console.log("自定义格式:", logs2[0]); // POST /login -> 404 (xxms)

// 3) logStart 模式
const logs3 = [];
const mw3 = logMiddleware({ logger: (s) => logs3.push(s), logStart: true });
const res3 = mockRes(500);
mw3(mockReq("PUT", "/items/1"), res3, () => {});
res3.end();
console.log("logStart 模式输出:");
logs3.forEach((l, i) => console.log("  " + i + ":", l));
// 0: --> PUT /items/1 ; 1: [ISO] PUT /items/1 500 xxms

// 4) 真实耗时演示（模拟 10ms 延迟）
const logs4 = [];
const mw4 = logMiddleware({ logger: (s) => logs4.push(s) });
const res4 = mockRes(200);
mw4(mockReq("GET", "/slow"), res4, () => {});
setTimeout(() => res4.end(), 20);
setTimeout(() => {
  console.log("延迟请求日志:", logs4[0]);
}, 40);
