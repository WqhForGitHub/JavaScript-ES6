/**
 * 手写 XMLHttpRequest 封装
 *
 * 原生 XMLHttpRequest 通过 onreadystatechange 监听状态变化，使用繁琐。
 * 这里封装成一个基于 Promise 的 request 函数，支持：
 *   - GET / POST / PUT / DELETE 等方法
 *   - query 参数序列化
 *   - 请求头设置
 *   - JSON 请求体与 JSON 响应解析
 *   - 超时控制（timeout）
 *   - 统一错误处理
 *
 * 实现思路：
 *   1. 创建 XHR 实例，调用 open(method, url, async)
 *   2. 遍历 headers 调用 setRequestHeader
 *   3. 监听 onreadystatechange，readyState === 4 时处理响应
 *   4. 根据状态码 resolve / reject
 *   5. 监听 onerror、ontimeout 进行异常拒绝
 */

function request(options) {
  const {
    method = "GET",
    url,
    params = null,
    data = null,
    headers = {},
    timeout = 10000,
    responseType = "json",
  } = options;

  return new Promise((resolve, reject) => {
    // 1. 拼接 query 参数
    let finalUrl = url;
    if (params && typeof params === "object") {
      const queryStr = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      if (queryStr) finalUrl += (url.includes("?") ? "&" : "?") + queryStr;
    }

    // 2. 创建 XHR
    const xhr = new XMLHttpRequest();
    xhr.open(method.toUpperCase(), finalUrl, true);
    xhr.timeout = timeout;

    // 3. 设置请求头
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // 4. 处理响应
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      const response = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders()),
        data:
          responseType === "json"
            ? safeJsonParse(xhr.responseText)
            : xhr.response,
      };
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject(new Error(`Request failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error"));
    };
    xhr.ontimeout = function () {
      reject(new Error(`Request timeout after ${timeout}ms`));
    };

    // 5. 发送请求体
    let body = data;
    if (data && typeof data === "object" && !(data instanceof FormData)) {
      xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
      body = JSON.stringify(data);
    }
    xhr.send(body);
  });
}

function parseHeaders(raw) {
  const result = {};
  if (!raw) return result;
  raw
    .trim()
    .split(/\r?\n/)
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      result[key] = value;
    });
  return result;
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

// ===== 测试（Node 环境下 XMLHttpRequest 不存在，仅做逻辑校验） =====
// Node.js 18+ 没有内置 XMLHttpRequest，以下用 mock 验证封装逻辑
if (typeof XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = function () {
    this.open = function () {};
    this.send = function () {
      // 模拟立即完成
      this.readyState = 4;
      this.status = 200;
      this.statusText = "OK";
      this.responseText = JSON.stringify({ code: 0, msg: "ok" });
      this.getAllResponseHeaders = function () {
        return "Content-Type: application/json\r\nX-Custom: demo";
      };
      this.onreadystatechange && this.onreadystatechange();
    };
    this.setRequestHeader = function () {};
  };
}

request({
  method: "GET",
  url: "https://example.com/api/list",
  params: { page: 1, size: 10 },
  headers: { "X-Token": "abc123" },
})
  .then((res) => {
    console.log("status:", res.status); // status: 200
    console.log("data:", res.data); // data: { code: 0, msg: 'ok' }
    console.log("headers:", res.headers); // headers: { 'Content-Type': 'application/json', 'X-Custom': 'demo' }
  })
  .catch((err) => console.log("err:", err.message));

console.log("query 拼接示例:", buildQuery({ a: 1, b: "中文" })); // a=1&b=%E4%B8%AD%E6%96%87

function buildQuery(params) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}
