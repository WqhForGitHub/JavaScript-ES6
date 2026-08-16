# 028 - 基于 XMLHttpRequest 实现 AJAX 请求

## 基础版：GET 请求

```js
const xhr = new XMLHttpRequest();

xhr.open('GET', 'https://api.example.com/user?id=1', true); // true 表示异步

// 监听状态变化
xhr.onreadystatechange = function () {
  // 4 表示请求完成
  if (xhr.readyState === 4) {
    if (xhr.status >= 200 && xhr.status < 300) {
      console.log('成功：', JSON.parse(xhr.responseText));
    } else {
      console.error('失败：', xhr.status);
    }
  }
};

xhr.send();
```

## 常用封装：通用 ajax 函数

```js
function ajax(options) {
  const {
    url,
    method = 'GET',
    data = null,
    headers = {},
    timeout = 10000,
    success,
    error,
  } = options;

  const xhr = new XMLHttpRequest();

  // 请求超时
  xhr.timeout = timeout;
  xhr.ontimeout = function () {
    error && error(new Error('请求超时'));
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      let res;
      try {
        res = JSON.parse(xhr.responseText);
      } catch (e) {
        res = xhr.responseText;
      }
      success && success(res, xhr);
    } else {
      error && error(new Error(`请求失败：${xhr.status}`), xhr);
    }
  };

  xhr.open(method, url, true);

  // 设置请求头
  for (const key in headers) {
    xhr.setRequestHeader(key, headers[key]);
  }

  // POST 请求：发送 JSON 需设置 Content-Type
  if (method.toUpperCase() === 'POST' && data && !headers['Content-Type']) {
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  }

  xhr.send(data ? JSON.stringify(data) : null);
}

// 使用示例
// GET
ajax({
  url: 'https://api.example.com/user?id=1',
  success(res) {
    console.log('GET 成功：', res);
  },
  error(err) {
    console.error(err);
  },
});

// POST
ajax({
  url: 'https://api.example.com/user',
  method: 'POST',
  data: { name: '张三', age: 18 },
  headers: { Authorization: 'Bearer tokenxxx' },
  success(res) {
    console.log('POST 成功：', res);
  },
});
```

## 补充：xhr.readyState 状态说明

| 值  | 含义                                  |
| --- | ------------------------------------- |
| 0   | 请求未初始化（未调用 open）           |
| 1   | 服务器连接已建立（已调用 open）       |
| 2   | 请求已接收（已调用 send，收到响应头） |
| 3   | 请求处理中（接收响应体中）            |
| 4   | 请求已完成，响应就绪                  |

> 现代浏览器更推荐使用 `fetch` API（基于 Promise），
> 但面试中手写 XHR 封装仍是高频题目，见下一个 demo：Promise 版 AJAX 封装。
