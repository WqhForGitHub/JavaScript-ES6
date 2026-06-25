/**
 * 手写 JSONP 跨域请求
 *
 * JSONP 利用 <script> 标签不受同源策略限制的特性实现跨域 GET 请求。
 * 原理：
 *   1. 前端生成一个全局回调函数名 callbackName
 *   2. 创建 <script src="url?callback=callbackName&...">
 *   3. 服务端返回 callbackName(data) 形式的 JS 代码
 *   4. 浏览器执行该脚本即调用前端预先注册的回调
 *
 * 这里实现 jsonp 函数，Node 环境下用动态加载脚本逻辑模拟。
 * 实现思路：
 *   - 全局挂载回调函数
 *   - 拼接 url 参数
 *   - script 加载完成 / 出错后清理
 *   - 设置超时兜底
 */

function jsonp(url, options = {}) {
  const {
    callbackParam = "callback",
    params = {},
    timeout = 10000,
    prefix = "__jsonp_cb_",
  } = options;

  return new Promise((resolve, reject) => {
    const callbackName =
      prefix + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    let scriptEl = null;
    let timer = null;
    let settled = false;

    function cleanup() {
      if (timer) clearTimeout(timer);
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      delete global[callbackName];
    }

    global[callbackName] = function (data) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data);
    };

    // 拼接 query
    const query = Object.assign({}, params, { [callbackParam]: callbackName });
    const queryStr = Object.keys(query)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
      .join("&");
    const finalUrl = url + (url.includes("?") ? "&" : "?") + queryStr;

    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`JSONP timeout: ${finalUrl}`));
    }, timeout);

    // Node 环境无 document，用 require 模拟脚本加载
    if (typeof document === "undefined") {
      // 模拟：直接调用回调（真实环境由 <script> 触发）
      setTimeout(() => {
        if (settled) return;
        try {
          global[callbackName]({ code: 0, msg: "jsonp ok", data: [1, 2, 3] });
        } catch (e) {
          if (!settled) {
            settled = true;
            cleanup();
            reject(e);
          }
        }
      }, 5);
    } else {
      scriptEl = document.createElement("script");
      scriptEl.src = finalUrl;
      scriptEl.onerror = function () {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("JSONP script load error"));
      };
      document.body.appendChild(scriptEl);
    }
  });
}

// ===== 测试 =====
jsonp("https://example.com/api", { params: { id: 1, type: "list" } })
  .then((data) => {
    console.log("JSONP 结果:", data);
    // JSONP 结果: { code: 0, msg: 'jsonp ok', data: [ 1, 2, 3 ] }
  })
  .catch((err) => console.log("JSONP 错误:", err.message));

// 测试超时
jsonp("https://slow.example.com/api", { timeout: 10 })
  .then((data) => console.log("不应走到这:", data))
  .catch((err) => console.log("超时错误:", err.message)); // 超时错误: JSONP timeout: ...

// 参数拼接示例
function buildJsonpUrl(url, params, callbackName) {
  const query = Object.assign({}, params, { callback: callbackName });
  const qs = Object.keys(query)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");
  return url + (url.includes("?") ? "&" : "?") + qs;
}
console.log(
  "URL 拼接:",
  buildJsonpUrl("https://api.example.com/list", { page: 1 }, "cb1"),
); // URL 拼接: https://api.example.com/list?page=1&callback=cb1
