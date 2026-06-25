/**
 * 手写静态文件服务器
 *
 * 功能：基于 Node.js http 模块提供静态文件服务
 * 实现思路：
 *   1. 监听请求，将 URL 路径解析为文件系统路径
 *   2. 根据扩展名映射 MIME 类型
 *   3. 读取文件并返回；目录则尝试返回 index.html；不存在返回 404
 *   4. 防止目录穿越攻击（../ 越权访问）
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  return (
    MIME_TYPES[path.extname(filePath).toLowerCase()] ||
    "application/octet-stream"
  );
}

/**
 * 创建请求处理函数（便于测试与复用）
 * @param {string} rootDir 静态文件根目录
 * @returns {Function} (req, res) => void
 */
function createRequestHandler(rootDir) {
  const root = path.resolve(rootDir);
  return function handle(req, res) {
    // 去掉查询参数并解码
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(root, urlPath);

    // 防止目录穿越：解析后的路径必须仍在根目录内
    if (!filePath.startsWith(root)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403 Forbidden");
      return;
    }

    // 目录则追加 index.html
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
    } catch (e) {
      // 忽略 stat 错误，交给读取处理
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": getMimeType(filePath),
        "Content-Length": data.length,
      });
      res.end(data);
    });
  };
}

/** 创建并返回静态文件服务器实例 */
function createStaticServer(rootDir, options = {}) {
  const port = options.port || 3000;
  const handler = createRequestHandler(rootDir);
  const server = http.createServer(handler);
  return {
    server,
    listen(p) {
      server.listen(p || port, () => {
        console.log(`Static server running at http://localhost:${p || port}`);
      });
    },
  };
}

// ===== 测试（使用 mock，不真正监听端口） =====
console.log("=== 静态文件服务器演示 ===");

// 1) MIME 映射演示
console.log("MIME 类型示例:");
console.log("  .html ->", getMimeType("a.html")); // text/html; charset=utf-8
console.log("  .js   ->", getMimeType("a.js")); // text/javascript; charset=utf-8
console.log("  .png  ->", getMimeType("a.png")); // image/png
console.log("  .xyz  ->", getMimeType("a.xyz")); // application/octet-stream

// 2) 模拟请求处理（以当前目录为根，请求一个不存在的文件 -> 404）
function mockRes() {
  const r = { statusCode: 0, headers: {}, body: "" };
  r.writeHead = function (s, h) {
    r.statusCode = s;
    r.headers = h || {};
  };
  r.end = function (b) {
    r.body = b == null ? "" : b;
  };
  return r;
}

const handler = createRequestHandler(__dirname);
const res404 = mockRes();
handler({ url: "/this-file-does-not-exist.html" }, res404);
// fs.readFile 异步，等下一个 tick 输出
setTimeout(() => {
  console.log("不存在文件响应:", res404.statusCode, "|", res404.body); // 404 | 404 Not Found
}, 50);

// 3) 目录穿越防护演示
const res403 = mockRes();
handler({ url: "/../../etc/passwd" }, res403);
// 由于 startsWith 校验，path.join 会规范化路径；若越界则 403
setTimeout(() => {
  console.log(
    "目录穿越响应:",
    res403.statusCode,
    "|",
    String(res403.body).slice(0, 20),
  );
}, 60);
