/**
 * 手写文件上传处理
 *
 * 功能：解析 multipart/form-data 请求体，提取普通字段与上传文件
 * 实现思路：
 *   1. 从 Content-Type 头中提取 boundary 分隔符
 *   2. 按 "--boundary" 分割 Buffer，每段为一个 part
 *   3. 解析每段的 Content-Disposition 头得到字段名(name)/文件名(filename)
 *   4. 文本字段转为字符串，文件字段保留 Buffer 及元信息(文件名、MIME)
 *   5. 封装为流式 handleUpload，收集请求 data/end 事件
 */
const EventEmitter = require("events");

/** 从 Content-Type 提取 boundary */
function getBoundary(contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  return m ? (m[1] || m[2]).trim() : null;
}

/** 解析一段 header 文本为对象 */
function parseHeaders(headerBuf) {
  const headers = {};
  const text = headerBuf.toString("utf8");
  for (const line of text.split("\r\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    headers[line.slice(0, idx).trim().toLowerCase()] = line
      .slice(idx + 1)
      .trim();
  }
  return headers;
}

/** 从 Content-Disposition 提取 name / filename */
function parseDisposition(disposition) {
  const result = {};
  let m = /name="([^"]*)"/.exec(disposition);
  if (m) result.name = m[1];
  m = /filename="([^"]*)"/.exec(disposition);
  if (m) result.filename = m[1];
  return result;
}

/** 核心：解析 multipart Buffer */
function parseMultipart(buffer, boundary) {
  const parts = [];
  const sep = Buffer.from("--" + boundary);

  // 按 "--boundary" 切分
  const segments = [];
  let start = 0;
  let idx;
  while ((idx = buffer.indexOf(sep, start)) !== -1) {
    segments.push(buffer.slice(start, idx));
    start = idx + sep.length;
  }
  segments.push(buffer.slice(start));

  // segments[0] 为前导(通常为空)，segments[last] 为 "--\r\n" 结束标记
  for (let i = 1; i < segments.length - 1; i++) {
    let seg = segments[i];
    // 去掉段首 \r\n 与段尾 \r\n
    if (seg.slice(0, 2).toString() === "\r\n") seg = seg.slice(2);
    if (seg.slice(-2).toString() === "\r\n") seg = seg.slice(0, -2);

    const hsep = seg.indexOf(Buffer.from("\r\n\r\n"));
    if (hsep === -1) continue;

    const headerBuf = seg.slice(0, hsep);
    const bodyBuf = seg.slice(hsep + 4);
    const headers = parseHeaders(headerBuf);
    const disp = parseDisposition(headers["content-disposition"] || "");
    if (!disp.name) continue;

    if (disp.filename !== undefined) {
      // 文件 part
      parts.push({
        name: disp.name,
        filename: disp.filename,
        type: headers["content-type"] || "application/octet-stream",
        data: bodyBuf,
        size: bodyBuf.length,
      });
    } else {
      // 文本 part
      parts.push({ name: disp.name, value: bodyBuf.toString("utf8") });
    }
  }
  return parts;
}

/** 处理上传请求（流式收集） */
function handleUpload(req, callback) {
  const chunks = [];
  let size = 0;
  const limit = 50 * 1024 * 1024; // 50MB
  req.on("data", (c) => {
    size += c.length;
    if (size > limit) {
      req.destroy();
      return callback(new Error("payload too large"));
    }
    chunks.push(c);
  });
  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const boundary = getBoundary(req.headers["content-type"]);
    if (!boundary) return callback(new Error("missing boundary"));
    try {
      callback(null, parseMultipart(buffer, boundary));
    } catch (e) {
      callback(e);
    }
  });
  req.on("error", (err) => callback(err));
}

// ===== 测试 =====
console.log("=== 文件上传处理演示 ===");

// 1) 构造一个 multipart/form-data 请求体
const boundary = "----TestBoundary123";
const body = Buffer.concat([
  Buffer.from(`--${boundary}\r\n`),
  Buffer.from('Content-Disposition: form-data; name="username"\r\n\r\n'),
  Buffer.from("alice\r\n"),
  Buffer.from(`--${boundary}\r\n`),
  Buffer.from('Content-Disposition: form-data; name="age"\r\n\r\n'),
  Buffer.from("25\r\n"),
  Buffer.from(`--${boundary}\r\n`),
  Buffer.from(
    'Content-Disposition: form-data; name="avatar"; filename="hello.txt"\r\n',
  ),
  Buffer.from("Content-Type: text/plain\r\n\r\n"),
  Buffer.from("hello file content\r\n"),
  Buffer.from(`--${boundary}--\r\n`),
]);

const parts = parseMultipart(body, boundary);
console.log("解析到", parts.length, "个 part:");
console.log("  字段 username =", parts[0].value); // alice
console.log("  字段 age =", parts[1].value); // 25
console.log(
  "  文件 avatar:",
  parts[2].filename,
  "|",
  parts[2].type,
  "|",
  parts[2].size,
  "bytes",
);
console.log("  文件内容:", parts[2].data.toString()); // hello file content

// 2) handleUpload 流式测试
function mockReq(headers, buf) {
  const req = new EventEmitter();
  req.headers = headers;
  process.nextTick(() => {
    req.emit("data", buf);
    req.emit("end");
  });
  return req;
}

const req = mockReq(
  { "content-type": `multipart/form-data; boundary=${boundary}` },
  body,
);
handleUpload(req, (err, result) => {
  console.log("handleUpload 结果: 错误=", err, "| part 数量=", result.length); // 3
});
