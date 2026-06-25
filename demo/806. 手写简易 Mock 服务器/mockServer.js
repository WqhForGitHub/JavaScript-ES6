/**
 * 手写简易 Mock 服务器
 *
 * 功能：根据路由配置返回模拟数据
 * 实现思路：
 *   1. 注册路由 { method, path, response, delay }
 *   2. 匹配请求，返回模拟响应
 *   3. 支持动态参数 /:id
 *   4. 支持响应延迟模拟网络
 */

const http = require("http");
const url = require("url");

class MockServer {
  constructor() {
    this.routes = [];
  }

  // 注册路由
  mock(method, path, handler, options = {}) {
    this.routes.push({
      method: method.toUpperCase(),
      path,
      handler: typeof handler === "function" ? handler : () => handler,
      delay: options.delay || 0,
      status: options.status || 200,
    });
  }

  // 路径参数匹配
  matchRoute(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      // 将 /api/users/:id 转为正则
      const paramNames = [];
      const regexStr = route.path.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      });
      const regex = new RegExp("^" + regexStr + "$");
      const match = pathname.match(regex);
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  // 处理请求
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const match = this.matchRoute(req.method, pathname);

    if (!match) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found", path: pathname }));
      return;
    }

    const { route, params } = match;
    const ctx = {
      params,
      query: parsedUrl.query,
      method: req.method,
      path: pathname,
    };

    // 模拟延迟
    if (route.delay) {
      console.log("[Mock] Delaying", route.delay, "ms for", pathname);
      await new Promise((r) => setTimeout(r, route.delay));
    }

    const response = route.handler(ctx);
    console.log("[Mock]", req.method, pathname, "->", route.status);

    res.writeHead(route.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  }

  start(port = 3000) {
    const server = http.createServer((req, res) =>
      this.handleRequest(req, res),
    );
    server.listen(port, () =>
      console.log("[MockServer] Running on port", port),
    );
    return server;
  }
}

// ===== 测试（模拟请求处理） =====
const mock = new MockServer();

// 注册 mock 路由
mock.mock("GET", "/api/users", () => ({
  code: 0,
  data: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
}));

mock.mock("GET", "/api/users/:id", (ctx) => ({
  code: 0,
  data: { id: parseInt(ctx.params.id), name: "User " + ctx.params.id },
}));

mock.mock("POST", "/api/users", (ctx) => ({
  code: 0,
  message: "User created",
  data: { id: 3, ...ctx.query },
}));

mock.mock("GET", "/api/slow", () => ({ data: "slow response" }), {
  delay: 100,
});

// 模拟请求
console.log("=== Mock 服务器演示 ===");

const mockRes = {
  writeHead: (c, h) => console.log("Status:", c),
  end: (b) => console.log("Response:", b),
};

console.log("\nGET /api/users:");
mock.handleRequest({ method: "GET", url: "/api/users" }, mockRes);

console.log("\nGET /api/users/42:");
mock.handleRequest({ method: "GET", url: "/api/users/42" }, mockRes);

console.log("\nPOST /api/users?name=Charlie:");
mock.handleRequest({ method: "POST", url: "/api/users?name=Charlie" }, mockRes);

console.log("\nGET /api/unknown:");
mock.handleRequest({ method: "GET", url: "/api/unknown" }, mockRes);
