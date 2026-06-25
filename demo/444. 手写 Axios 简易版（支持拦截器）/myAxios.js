/**
 * 手写 Axios 简易版（支持拦截器）
 *
 * Axios 核心特性：请求/响应拦截器链式执行。这里实现简化版，包含：
 *   - interceptors.request.use / interceptors.response.use
 *   - request(config) 方法，返回 Promise
 *   - 拦截器按注册顺序执行，请求拦截器逆序执行（后注册先执行）
 *   - 内部用 dispatchRequest 真正发起请求（基于 fetch / xhr）
 *
 * 实现思路：
 *   1. 维护两个数组：requestInterceptors / responseInterceptors
 *   2. 构造一条 Promise 链：
 *      [req拦截器...] -> dispatchRequest -> [resp拦截器...]
 *   3. 请求拦截器从后往前 unshift，响应拦截器从前往后 push
 *   4. dispatchRequest 调用底层 adapter 发送请求并返回响应
 */

function createMyAxios(adapter) {
  const requestInterceptors = [];
  const responseInterceptors = [];

  function dispatchRequest(config) {
    return adapter(config).then(
      (response) => ({ ...response, config }),
      (error) => Promise.reject({ ...error, config }),
    );
  }

  function request(config) {
    // 请求拦截器逆序加入链首
    let chain = [dispatchRequest, undefined];
    requestInterceptors.forEach(({ fulfilled, rejected }) => {
      chain.unshift(fulfilled, rejected);
    });
    responseInterceptors.forEach(({ fulfilled, rejected }) => {
      chain.push(fulfilled, rejected);
    });

    let promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  }

  request.interceptors = {
    request: {
      use(fulfilled, rejected) {
        requestInterceptors.push({ fulfilled, rejected });
        return requestInterceptors.length - 1;
      },
      eject(id) {
        if (requestInterceptors[id]) requestInterceptors[id] = null;
      },
    },
    response: {
      use(fulfilled, rejected) {
        responseInterceptors.push({ fulfilled, rejected });
        return responseInterceptors.length - 1;
      },
      eject(id) {
        if (responseInterceptors[id]) responseInterceptors[id] = null;
      },
    },
  };

  // 快捷方法
  ["get", "post", "put", "delete"].forEach((method) => {
    request[method] = function (url, config = {}) {
      return request({ ...config, method, url });
    };
  });

  return request;
}

// ===== 测试 =====
// 模拟底层 adapter（真实场景用 xhr / fetch）
function mockAdapter(config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 200,
        statusText: "OK",
        data: { url: config.url, receivedToken: config.headers.Authorization },
      });
    }, 10);
  });
}

const axios = createMyAxios(mockAdapter);

// 请求拦截器：自动加 token
axios.interceptors.request.use(
  function (config) {
    console.log("[req interceptor] 加 token");
    config.headers = config.headers || {};
    config.headers.Authorization = "Bearer xxx-yyy";
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// 响应拦截器：只取 data
axios.interceptors.response.use(
  function (response) {
    console.log("[resp interceptor] 提取 data");
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axios.get("https://example.com/info").then((data) => {
  console.log("最终结果:", data);
  // 最终结果: { url: 'https://example.com/info', receivedToken: 'Bearer xxx-yyy' }
});

axios.post("https://example.com/save", { a: 1 }).then((data) => {
  console.log("POST 结果:", data.url); // POST 结果: https://example.com/save
});
