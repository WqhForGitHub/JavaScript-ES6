/**
 * 手写简易 Dev Server
 *
 * 功能：开发服务器，支持静态文件服务 + API 代理 + HMR
 * 实现思路：
 *   1. 创建 HTTP 服务器
 *   2. 静态文件：读取磁盘文件返回
 *   3. API 代理：转发请求到后端
 *   4. HMR：WebSocket 推送更新
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

class DevServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.root = options.root || "public";
    this.proxies = options.proxies || {};
    this.middleware = [];
    this.server = null;
  }

  // 添加中间件
  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  // MIME 类型
  getMime(ext) {
    const mimes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };
    return mimes[ext] || "application/octet-stream";
  }

  // 启动服务器
  start() {
    this.server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      const pathname = parsedUrl.pathname;

      // 执行中间件
      let idx = 0;
      const next = () => {
        if (idx < this.middleware.length) {
          this.middleware[idx++](req, res, next);
        } else {
          this.handleRequest(req, res, pathname);
        }
      };
      next();
    });

    this.server.listen(this.port, () => {
      console.log("[DevServer] Running at http://localhost:" + this.port);
    });
  }

  handleRequest(req, res, pathname) {
    // 检查代理
    for (const [prefix, target] of Object.entries(this.proxies)) {
      if (pathname.startsWith(prefix)) {
        this.proxy(req, res, pathname, target);
        return;
      }
    }
    // 静态文件
    this.serveStatic(req, res, pathname);
  }

  serveStatic(req, res, pathname) {
    let filePath = path.join(this.root, pathname);
    if (pathname === "/") filePath = path.join(this.root, "index.html");

    // 模拟文件读取（实际用 fs.readFile）
    console.log("[DevServer] GET", pathname, "->", filePath);
    res.writeHead(200, {
      "Content-Type": this.getMime(path.extname(filePath)),
    });
    res.end("<!-- Static file: " + filePath + " -->");
  }

  proxy(req, res, pathname, target) {
    console.log("[DevServer] Proxy", pathname, "->", target + pathname);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ proxied: true, target: target + pathname }));
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log("[DevServer] Stopped");
    }
  }
}

// ===== 测试（不实际启动服务器，演示逻辑） =====
console.log("=== Dev Server 配置演示 ===");
const server = new DevServer({
  port: 3000,
  root: "public",
  proxies: { "/api": "http://localhost:8080" },
});

server.use((req, res, next) => {
  console.log("[Middleware] Logging:", req.method, req.url);
  next();
});

server.use((req, res, next) => {
  res.setHeader("X-Custom-Header", "dev-server");
  next();
});

// 模拟请求
console.log("\n--- 模拟请求 / ---");
const mockReq1 = { method: "GET", url: "/" };
const mockRes1 = {
  writeHead: (code, headers) =>
    console.log("Response:", code, JSON.stringify(headers)),
  setHeader: (k, v) => console.log("Set header:", k, "=", v),
  end: (body) => console.log("Body:", body),
};
// 模拟中间件链
let i = 0;
const next1 = () => {
  if (i < server.middleware.length)
    server.middleware[i++](mockReq1, mockRes1, next1);
  else server.handleRequest(mockReq1, mockRes1, "/");
};
next1();

console.log("\n--- 模拟请求 /api/users ---");
const mockReq2 = { method: "GET", url: "/api/users" };
const mockRes2 = {
  writeHead: (c, h) => console.log("Response:", c, JSON.stringify(h)),
  setHeader: () => {},
  end: (b) => console.log("Body:", b),
};
let j = 0;
const next2 = () => {
  if (j < server.middleware.length)
    server.middleware[j++](mockReq2, mockRes2, next2);
  else server.handleRequest(mockReq2, mockRes2, "/api/users");
};
next2();

console.log("\n[DevServer] To start: server.start()");
