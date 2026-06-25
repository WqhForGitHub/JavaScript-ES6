/**
 * 手写请求体解析中间件（JSON/URL-encoded）
 *
 * 功能：解析 HTTP 请求体，支持 application/json 与 application/x-www-form-urlencoded
 * 实现思路：
 *   1. 根据 Content-Type 选择解析策略，不匹配则直接 next
 *   2. 监听 req 的 data/end 事件，收集 chunks 合并为 Buffer
 *   3. JSON 用 JSON.parse；urlencoded 手写解析（支持 + 转空格、同名键转数组）
 *   4. 设置大小限制，超限销毁请求流；解析结果挂到 req.body
 */
const EventEmitter = require("events");

/** 解析 urlencoded 字符串为对象 */
function parseUrlEncoded(str) {
  const obj = {};
  if (!str) return obj;
  for (const pair of str.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawVal = eq === -1 ? "" : pair.slice(eq + 1);
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    let val;
    try {
      val = decodeURIComponent(rawVal.replace(/\+/g, " "));
    } catch (e) {
      val = rawVal.replace(/\+/g, " ");
    }
    if (key in obj) {
      if (Array.isArray(obj[key])) obj[key].push(val);
      else obj[key] = [obj[key], val];
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

/** body 解析中间件工厂 */
function bodyParser(options = {}) {
  const limit = options.limit || 1024 * 1024; // 默认 1MB
  return function (req, res, next) {
    if (req.body !== undefined) return next && next();
    const type = ((req.headers && req.headers["content-type"]) || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (
      type !== "application/json" &&
      type !== "application/x-www-form-urlencoded"
    ) {
      return next && next();
    }

    const chunks = [];
    let size = 0;
    let aborted = false;

    req.on("data", (c) => {
      if (aborted) return;
      size += c.length;
      if (size > limit) {
        aborted = true;
        req.destroy();
        if (next) next(new Error("request body too large"));
        return;
      }
      chunks.push(c);
    });

    req.on("end", () => {
      if (aborted) return;
      const text = Buffer.concat(chunks).toString("utf8");
      try {
        if (type === "application/json") {
          req.body = text ? JSON.parse(text) : {};
        } else {
          req.body = parseUrlEncoded(text);
        }
      } catch (e) {
        req.body = {};
        if (next) return next(e);
      }
      next && next();
    });

    req.on("error", (err) => {
      if (aborted) return;
      next && next(err);
    });
  };
}

// ===== 测试（使用 mock 流） =====
console.log("=== 请求体解析中间件演示 ===");

function mockReq(headers, body) {
  const req = new EventEmitter();
  req.headers = headers;
  req.destroy = function () {
    req.emit("error", new Error("stream destroyed"));
  };
  process.nextTick(() => {
    if (body) req.emit("data", Buffer.from(body));
    req.emit("end");
  });
  return req;
}

// 1) JSON 解析
const req1 = mockReq(
  { "content-type": "application/json" },
  '{"name":"alice","age":30}',
);
bodyParser()(req1, {}, () => {
  console.log("JSON 解析:", req1.body); // { name: 'alice', age: 30 }
});

// 2) URL-encoded 解析（含 + 与同名键）
const req2 = mockReq(
  { "content-type": "application/x-www-form-urlencoded" },
  "name=bob+smith&tag=a&tag=b&city=%E5%8C%97%E4%BA%AC",
);
bodyParser()(req2, {}, () => {
  console.log("urlencoded 解析:", req2.body); // { name: 'bob smith', tag: ['a','b'], city: '北京' }
});

// 3) 非 body 请求类型（应跳过解析）
const req3 = mockReq({ "content-type": "text/plain" }, "hello");
bodyParser()(req3, {}, () => {
  console.log("text/plain 跳过, body =", req3.body); // undefined
});

// 4) JSON 解析错误（应捕获并传 err）
const req4 = mockReq({ "content-type": "application/json" }, "{invalid json}");
bodyParser()(req4, {}, (err) => {
  console.log("非法 JSON 错误:", err ? err.message : "无错误"); // Unexpected token...
});

// 5) 大小限制
const big = "x".repeat(100);
const req5 = mockReq(
  { "content-type": "application/json" },
  '{"a":"' + big + '"}',
);
bodyParser({ limit: 10 })(req5, {}, (err) => {
  console.log("超限错误:", err ? err.message : "无错误"); // request body too large
});

// 6) parseUrlEncoded 单元演示
console.log("parseUrlEncoded 单元:", parseUrlEncoded("a=1&b=2&a=3")); // { a: ['1','3'], b: '2' }
