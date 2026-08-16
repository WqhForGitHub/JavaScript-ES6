# 024 - 解析 URL 参数为对象

## 方式一：URLSearchParams（Web API，推荐）

```js
function parseParams(url) {
  const queryString = url.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

console.log(parseParams('https://example.com?page=1&size=10&keyword=js'));
// { page: '1', size: '10', keyword: 'js' }
```

> Node.js 中可通过 `const { URLSearchParams } = require('url')` 使用。

## 方式二：正则匹配（经典手写）

```js
function parseParams(url) {
  const reg = /([^?&=]+)=([^?&=]*)/g;
  const result = {};
  url.replace(reg, (_, key, value) => {
    // decodeURIComponent 解码中文和特殊字符
    result[decodeURIComponent(key)] = decodeURIComponent(value);
    return '';
  });
  return result;
}

console.log(parseParams('https://example.com?name=%E5%BC%A0%E4%B8%89&age=18&from=beijing'));
// { name: '张三', age: '18', from: 'beijing' }
```

## 方式三：split 手动解析（支持重复 key 收集为数组）

```js
function parseParams(url, collectRepeated = false) {
  const result = {};
  const queryString = url.split('#')[0].split('?')[1];
  if (!queryString) return result;

  for (const pair of queryString.split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);

    if (collectRepeated && key in result) {
      // 重复 key：收集为数组
      result[key] = [].concat(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

console.log(parseParams('https://example.com?a=1&b=2&a=3#hash', true));
// { a: ['1', '3'], b: '2' }
```

## 反向操作：对象序列化为查询字符串

```js
function stringifyParams(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

console.log(stringifyParams({ name: '张三', age: 18 }));
// name=%E5%BC%A0%E4%B8%89&age=18
```
