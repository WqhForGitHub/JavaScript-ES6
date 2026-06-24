/**
 * 手写简易 HTTP 服务器
 *
 * 作用：用 Node.js http 模块创建一个简易 HTTP 服务器，支持：
 *         - 监听端口
 *         - 处理 GET/POST 请求
 *         - 读取请求头、请求体
 *         - 设置响应状态码、响应头、响应体
 *         - 路由分发（简易）
 *
 * 实现思路：
 *   1. 用 http.createServer((req, res) => {...}) 创建服务器
 *   2. 把请求处理逻辑封装为 createServer(handler) 工厂
 *   3. handler 接收 req（含 method/url/headers）和 res（可链式 write/end/setHeader）
 *   4. 提供一个简化版 MockRequest/MockResponse，便于在无网络环境测试
 */

const { EventEmitter } = require('events');

// ===== 简易 HTTP 服务器（基于 Node http 风格）=====
function createServer(requestHandler) {
  return {
    handler: requestHandler,
    listen(port, host, callback) {
      // 在真实环境用 http.createServer；这里仅模拟
      console.log(`[mock] Server listening on ${host || '0.0.0.0'}:${port}`);
      if (callback) callback();
      return this;
    },
    // 模拟接收请求（用于测试）
    handle(req, res) {
      return this.handler(req, res);
    },
  };
}

// ===== 模拟请求对象 =====
class MockRequest extends EventEmitter {
  constructor(method, url, headers = {}, body = '') {
    super();
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.httpVersion = '1.1';
    this._body = Buffer.from(body);
    // 解析 url
    const urlObj = parseUrl(url);
    this.pathname = urlObj.pathname;
    this.query = urlObj.query;
    this.search = urlObj.search;
  }

  // 模拟 socket 远程地址
  get socket() {
    return { remoteAddress: '127.0.0.1', remotePort: 12345 };
  }
}

// ===== 模拟响应对象 =====
class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.statusMessage = 'OK';
    this.headers = {};
    this._chunks = [];
    this._ended = false;
    this.headersSent = false;
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
    return this;
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }

  removeHeader(name) {
    delete this.headers[name.toLowerCase()];
  }

  writeHead(statusCode, statusMessage, headers) {
    if (typeof statusMessage === 'object') {
      headers = statusMessage;
      statusMessage = undefined;
    }
    this.statusCode = statusCode;
    if (statusMessage) this.statusMessage = statusMessage;
    if (headers) {
      for (const k of Object.keys(headers)) {
        this.headers[k.toLowerCase()] = headers[k];
      }
    }
    this.headersSent = true;
    return this;
  }

  write(chunk, encoding, callback) {
    if (this._ended) throw new Error('write after end');
    if (typeof chunk === 'string') chunk = Buffer.from(chunk, encoding || 'utf8');
    this._chunks.push(chunk);
    if (callback) callback();
    return true;
  }

  end(chunk, encoding, callback) {
    if (typeof chunk === 'function') {
      callback = chunk;
      chunk = undefined;
    } else if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }
    if (chunk !== undefined) this.write(chunk, encoding);
    this._ended = true;
    this.headersSent = true;
    this.emit('finish');
    if (callback) callback();
    return this;
  }

  // 获取响应体
  getBody() {
    return Buffer.concat(this._chunks);
  }

  getBodyString() {
    return this.getBody().toString();
  }
}

// URL 解析（简易）
function parseUrl(url) {
  const qIdx = url.indexOf('?');
  let pathname, search, query;
  if (qIdx === -1) {
    pathname = url;
    search = null;
    query = {};
  } else {
    pathname = url.slice(0, qIdx);
    search = url.slice(qIdx);
    query = {};
    const qs = search.slice(1);
    if (qs) {
      for (const pair of qs.split('&')) {
        const [k, v] = pair.split('=');
        query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
      }
    }
  }
  return { pathname, search, query };
}

// ===== 创建一个示例服务器 =====
function createAppServer() {
  return createServer((req, res) => {
    const { method, pathname } = req;

    // 简单路由
    if (pathname === '/' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Welcome to Simple HTTP Server</h1>');
      return;
    }

    if (pathname === '/api/hello' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Hello, World!' }));
      return;
    }

    if (pathname === '/api/echo' && method === 'POST') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: body }));
      });
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

// ===== 测试 =====

// 测试 1：GET /
const server = createAppServer();
const req1 = new MockRequest('GET', '/');
const res1 = new MockResponse();
server.handle(req1, res1);
console.log('test1 status:', res1.statusCode); // 200
console.log('test1 body:', res1.getBodyString()); // '<h1>Welcome to Simple HTTP Server</h1>'

// 测试 2：GET /api/hello
const req2 = new MockRequest('GET', '/api/hello');
const res2 = new MockResponse();
server.handle(req2, res2);
console.log('test2 status:', res2.statusCode); // 200
console.log('test2 body:', JSON.parse(res2.getBodyString())); // { message: 'Hello, World!' }

// 测试 3：POST /api/echo
const req3 = new MockRequest('POST', '/api/echo', { 'content-type': 'application/json' }, '{"name":"Tom"}');
const res3 = new MockResponse();
server.handle(req3, res3);
req3.emit('data', req3._body);
req3.emit('end');
console.log('test3 status:', res3.statusCode); // 200
console.log('test3 body:', JSON.parse(res3.getBodyString())); // { received: '{"name":"Tom"}' }

// 测试 4：404
const req4 = new MockRequest('GET', '/not-exists');
const res4 = new MockResponse();
server.handle(req4, res4);
console.log('test4 status:', res4.statusCode); // 404
console.log('test4 body:', res4.getBodyString()); // 'Not Found'

// 测试 5：带查询参数
const req5 = new MockRequest('GET', '/api/hello?name=Node&version=18');
console.log('test5 query:', req5.query); // { name: 'Node', version: '18' }

// 测试 6：listen
server.listen(3000, '127.0.0.1', () => {
  console.log('test6 listen callback called');
});
