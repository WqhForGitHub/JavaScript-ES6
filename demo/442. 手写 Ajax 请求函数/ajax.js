/**
 * 手写 Ajax 请求函数
 *
 * Ajax 核心是通过 XMLHttpRequest（或 fetch）实现异步请求局部刷新。
 * 这里实现一个简洁的 ajax 函数，支持：
 *   - 链式 .then()/.catch() 的 Promise 调用
 *   - 自动 JSON 序列化
 *   - 表单 / JSON 两种 contentType
 *
 * 实现思路：
 *   1. 默认配置合并（method / async / headers）
 *   2. GET 请求参数拼到 url，其他方法放到 body
 *   3. 监听 xhr.onload / onerror 区分成功失败
 *   4. 2xx 走 resolve，否则走 reject 并返回错误信息
 */

function ajax(options) {
  const config = Object.assign(
    {
      method: "GET",
      url: "",
      data: null,
      headers: {},
      async: true,
      dataType: "json", // 响应数据类型
    },
    options,
  );

  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    const method = config.method.toUpperCase();

    // 处理 GET 参数
    let url = config.url;
    let body = null;
    if (method === "GET" && config.data) {
      url += "?" + serialize(config.data);
    } else if (config.data) {
      body = serialize(config.data);
    }

    xhr.open(method, url, config.async);

    // 默认表单编码
    if (body && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] =
        "application/x-www-form-urlencoded;charset=utf-8";
    }
    Object.keys(config.headers).forEach(function (key) {
      xhr.setRequestHeader(key, config.headers[key]);
    });

    xhr.onload = function () {
      let response;
      if (config.dataType === "json") {
        response = safeParse(xhr.responseText);
      } else {
        response = xhr.responseText;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject({ status: xhr.status, message: xhr.statusText, response });
      }
    };

    xhr.onerror = function () {
      reject({ status: 0, message: "Network Error" });
    };

    xhr.send(body);
  });
}

function serialize(data) {
  if (typeof data === "string") return data;
  return Object.keys(data)
    .map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    })
    .join("&");
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

// ===== 测试（使用 mock XMLHttpRequest） =====
if (typeof XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = function () {
    this.open = function () {};
    this.setRequestHeader = function () {};
    this.send = function () {
      this.status = 200;
      this.statusText = "OK";
      this.responseText = '{"name":"ajax","age":2}';
      this.onload && this.onload();
    };
  };
}

ajax({
  method: "GET",
  url: "https://example.com/user",
  data: { id: 1 },
}).then(function (res) {
  console.log("GET 结果:", res); // GET 结果: { name: 'ajax', age: 2 }
});

ajax({
  method: "POST",
  url: "https://example.com/user",
  data: { name: "tom" },
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
})
  .then(function (res) {
    console.log("POST 结果:", res); // POST 结果: { name: 'ajax', age: 2 }
  })
  .catch(function (err) {
    console.log("err:", err.message);
  });

console.log("serialize 测试:", serialize({ a: 1, b: "x y" })); // a=1&b=x%20y
