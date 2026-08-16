# 029 - 基于 Promise 的 AJAX 请求封装

## 完整代码

```js
function request(options) {
  const { url, method = 'GET', data = null, headers = {}, timeout = 10000 } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // GET 请求：参数拼到 url 上
    let requestUrl = url;
    let body = null;
    if (data && method.toUpperCase() === 'GET') {
      const qs = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      requestUrl += (url.includes('?') ? '&' : '?') + qs;
    } else if (data) {
      body = JSON.stringify(data);
    }

    xhr.open(method, requestUrl, true);
    xhr.timeout = timeout;

    // 请求头
    if (body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        let res;
        try {
          res = JSON.parse(xhr.responseText);
        } catch (e) {
          res = xhr.responseText;
        }
        resolve(res);
      } else {
        reject(new Error(`请求失败：${xhr.status} ${xhr.statusText}`));
      }
    };

    // 网络错误 / 超时
    xhr.onerror = function () {
      reject(new TypeError('网络错误'));
    };
    xhr.ontimeout = function () {
      reject(new Error(`请求超时（${timeout}ms）`));
    };

    xhr.send(body);
  });
}
```

## 使用示例

```js
// GET 请求
request({
  url: 'https://api.example.com/user',
  data: { id: 1 },
})
  .then((res) => console.log('成功：', res))
  .catch((err) => console.error('失败：', err.message));

// POST 请求
request({
  url: 'https://api.example.com/user',
  method: 'POST',
  data: { name: '张三', age: 18 },
  headers: { Authorization: 'Bearer tokenxxx' },
})
  .then((res) => console.log('创建成功：', res))
  .catch((err) => console.error(err.message));

// async/await 用法
async function getUser(id) {
  try {
    const res = await request({
      url: 'https://api.example.com/user',
      data: { id },
    });
    return res;
  } catch (err) {
    console.error('请求出错：', err.message);
    throw err;
  }
}
```

## 简化版（面试快速手写）

```js
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(JSON.parse(xhr.responseText))
        : reject(new Error(xhr.status));
    xhr.onerror = () => reject(new TypeError('网络错误'));
    xhr.send();
  });
}

fetchJson('https://api.example.com/user?id=1')
  .then((data) => console.log(data))
  .catch((e) => console.error(e.message));
```
