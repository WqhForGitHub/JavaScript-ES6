# 030 - 实现 JSONP 请求

> JSONP 原理：`<script>` 标签的 `src` 不受同源策略限制。
> 前端把回调函数名通过查询参数告诉服务端，服务端返回「调用该函数」的 JS 代码，实现跨域请求。
> **只支持 GET 请求**。

## 客户端实现

```js
function jsonp(url, params = {}, callbackName = 'callback') {
  return new Promise((resolve, reject) => {
    // 1. 生成全局唯一的回调函数名
    const fnName = `jsonp_cb_${Date.now()}_${Math.random().toString().slice(2)}`;

    // 2. 把回调函数挂到 window 上，等待服务端返回的脚本执行它
    window[fnName] = function (data) {
      resolve(data);
      cleanup(); // 请求成功后清理
    };

    // 3. 拼接查询参数
    const query = Object.entries({ ...params, [callbackName]: fnName })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    // 4. 动态创建 script 标签
    const script = document.createElement('script');
    script.src = `${url}?${query}`;

    // 5. 清理函数：删除 script 标签和全局回调
    function cleanup() {
      delete window[fnName];
      document.head.removeChild(script);
    }

    // 6. 失败处理
    script.onerror = function () {
      reject(new Error('JSONP 请求失败'));
      cleanup();
    };

    // 超时处理
    const timer = setTimeout(() => {
      reject(new Error('JSONP 请求超时'));
      cleanup();
      clearTimeout(timer);
    }, 10000);

    script.onload = () => clearTimeout(timer);

    document.head.appendChild(script);
  });
}

// 使用示例
jsonp('https://api.example.com/user', { id: 1 })
  .then((data) => console.log('收到数据：', data))
  .catch((err) => console.error(err.message));
```

## 服务端需要返回的内容

```js
// 假设请求 URL 为：
// https://api.example.com/user?id=1&callback=jsonp_cb_1699999999_123456
// 服务端返回的响应体必须是可执行的 JS 代码：
// jsonp_cb_1699999999_123456({"id":1,"name":"张三"})

// Node.js (Express) 示例：
const express = require('express');
const app = express();

app.get('/user', (req, res) => {
  const { callback, id } = req.query;
  const data = { id, name: '张三' };
  // 返回 callback(数据) 形式的 JS 代码
  res.send(`${callback}(${JSON.stringify(data)})`);
});

app.listen(3000);
```

## 完整 HTML 演示

```html
<!DOCTYPE html>
<html>
<body>
  <script>
    // 最原始的 JSONP 写法
    function handleData(data) {
      console.log('收到数据：', data);
    }
  </script>
  <!-- 服务端返回：handleData({...})，加载完成后自动执行 -->
  <script src="https://api.example.com/user?id=1&callback=handleData"></script>
</body>
</html>
```

> 现代跨域方案首选 **CORS**（服务端设置响应头），JSONP 多见于老系统或
> 不支持 CORS 的场景。
