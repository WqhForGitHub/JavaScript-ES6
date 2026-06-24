/**
 * 手写 Fetch API（简易版）
 *
 * 浏览器原生 fetch 基于 Promise，返回 Response 对象，可调用 .json()/.text()。
 * 这里基于 XMLHttpRequest 实现一个简化版 fetch，接口对齐原生：
 *   - fetch(url, options) 返回 Promise<Response>
 *   - Response 有 ok / status / statusText 属性
 *   - Response.json() / Response.text() 返回 Promise
 *
 * 实现思路：
 *   1. 创建 XHR，根据 options.method / headers / body 发送
 *   2. readyState === 4 时构造 Response 对象
 *   3. 网络错误 reject，HTTP 错误状态仍然 resolve（与原生 fetch 一致）
 */

function myFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      method = "GET",
      headers = {},
      body = null,
      signal = null,
    } = options;

    const xhr = new XMLHttpRequest();
    xhr.open(method.toUpperCase(), url, true);

    Object.entries(headers).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      const response = new MyResponse(xhr);
      resolve(response);
    };

    xhr.onerror = () => reject(new TypeError("Network request failed"));
    xhr.ontimeout = () => reject(new TypeError("Network request timed out"));

    // 支持 AbortController 取消
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    xhr.send(body);
  });
}

class MyResponse {
  constructor(xhr) {
    this._xhr = xhr;
    this.status = xhr.status;
    this.statusText = xhr.statusText;
    this.ok = xhr.status >= 200 && xhr.status < 300;
    this.headers = parseHeaders(xhr.getAllResponseHeaders());
    this._bodyText = xhr.responseText;
  }

  text() {
    return Promise.resolve(this._bodyText);
  }

  json() {
    return new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(this._bodyText));
      } catch (e) {
        reject(new SyntaxError("Unexpected token in JSON"));
      }
    });
  }
}

function parseHeaders(raw) {
  const obj = {};
  if (!raw) return obj;
  raw
    .trim()
    .split(/\r?\n/)
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > -1) obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
  return obj;
}

// ===== 测试（使用 mock XMLHttpRequest） =====
if (typeof XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = function () {
    this.open = function () {};
    this.setRequestHeader = function () {};
    this.getAllResponseHeaders = function () {
      return "Content-Type: application/json";
    };
    this.send = function () {
      this.readyState = 4;
      this.status = 200;
      this.statusText = "OK";
      this.responseText = '{"hello":"world","n":42}';
      this.onreadystatechange && this.onreadystatechange();
    };
  };
}

myFetch("https://example.com/api", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ a: 1 }),
})
  .then((res) => {
    console.log("status:", res.status); // status: 200
    console.log("ok:", res.ok); // ok: true
    console.log("headers:", res.headers); // headers: { 'Content-Type': 'application/json' }
    return res.json();
  })
  .then((data) => {
    console.log("json:", data); // json: { hello: 'world', n: 42 }
  })
  .catch((err) => console.log("err:", err.message));

myFetch("https://example.com/text")
  .then((res) => res.text())
  .then((txt) => console.log("text:", txt)); // text: {"hello":"world","n":42}
