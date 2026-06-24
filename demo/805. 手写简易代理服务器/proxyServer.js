/**
 * 手写简易代理服务器
 *
 * 功能：HTTP 代理服务器，转发请求到目标服务器
 * 实现思路：
 *   1. 接收客户端请求
 *   2. 修改请求头和 URL
 *   3. 转发到目标服务器
 *   4. 将响应返回客户端
 */

const http = require('http');
const url = require('url');

class ProxyServer {
  constructor(options = {}) {
    this.port = options.port || 8080;
    this.routes = []; // { pattern, target, rewrite }
    this.server = null;
  }

  // 添加代理路由
  addRoute(route) {
    this.routes.push({
      pattern: route.pattern,
      target: route.target,
      rewrite: route.rewrite || ((p) => p),
      headers: route.headers || {},
    });
  }

  // 匹配路由
  matchRoute(pathname) {
    for (const route of this.routes) {
      if (route.pattern instanceof RegExp && route.pattern.test(pathname)) return route;
      if (typeof route.pattern === 'string' && pathname.startsWith(route.pattern)) return route;
    }
    return null;
  }

  // 处理请求
  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const route = this.matchRoute(pathname);

    if (!route) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('No proxy route matched for: ' + pathname);
      return;
    }

    const targetPath = route.rewrite(pathname);
    const targetUrl = route.target + targetPath;

    console.log('[Proxy]', req.method, pathname, '->', targetUrl);

    // 解析目标 URL
    const targetParsed = url.parse(route.target);
    const options = {
      hostname: targetParsed.hostname,
      port: targetParsed.port || 80,
      path: targetPath + (parsedUrl.search || ''),
      method: req.method,
      headers: { ...req.headers, host: targetParsed.host, ...route.headers },
    };

    // 模拟转发（实际用 http.request）
    res.writeHead(200, { 'Content-Type': 'application/json', 'X-Proxied-By': 'ProxyServer' });
    res.end(JSON.stringify({
      proxied: true,
      originalPath: pathname,
      targetUrl: targetUrl,
      method: req.method,
    }));
  }

  start() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    this.server.listen(this.port, () => {
      console.log('[ProxyServer] Running on port', this.port);
    });
  }

  stop() { if (this.server) this.server.close(); }
}

// ===== 测试（模拟） =====
const proxy = new ProxyServer({ port: 8080 });

proxy.addRoute({
  pattern: '/api',
  target: 'http://localhost:3000',
  rewrite: (p) => p.replace('/api', ''),
});

proxy.addRoute({
  pattern: /^\/images\//,
  target: 'http://cdn.example.com',
  headers: { 'X-CDN': 'true' },
});

// 模拟请求
console.log('=== 代理服务器演示 ===');

const mockReq1 = { method: 'GET', url: '/api/users', headers: {} };
const mockRes1 = { writeHead: (c, h) => console.log('Response:', c, h), end: (b) => console.log('Body:', b) };
proxy.handleRequest(mockReq1, mockRes1);
// [Proxy] GET /api/users -> http://localhost:3000/users

console.log();
const mockReq2 = { method: 'POST', url: '/images/logo.png', headers: {} };
const mockRes2 = { writeHead: (c, h) => console.log('Response:', c, h), end: (b) => console.log('Body:', b) };
proxy.handleRequest(mockReq2, mockRes2);
// [Proxy] POST /images/logo.png -> http://cdn.example.com/images/logo.png

console.log();
const mockReq3 = { method: 'GET', url: '/unknown', headers: {} };
const mockRes3 = { writeHead: (c, h) => console.log('Response:', c), end: (b) => console.log('Body:', b) };
proxy.handleRequest(mockReq3, mockRes3);
// No proxy route matched
