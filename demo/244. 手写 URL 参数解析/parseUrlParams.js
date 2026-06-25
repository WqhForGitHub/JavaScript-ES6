/**
 * 手写 URL 参数解析
 *
 * 将 URL 中的查询字符串解析为对象，或将对象序列化为查询字符串。
 * 支持多种场景：
 *   - 完整 URL
 *   - 仅查询字符串
 *   - 重复参数（数组）
 *   - 编码/解码
 */

/**
 * 解析 URL 查询参数为对象
 * @param {string} url - 完整 URL 或查询字符串
 * @returns {Object} 参数对象
 */
function parseUrlParams(url) {
  if (!url) return {};

  // 提取查询部分
  var query = url;
  // 如果是完整 URL，取 ? 后面的部分
  var queryIndex = url.indexOf("?");
  if (queryIndex !== -1) {
    query = url.slice(queryIndex + 1);
  }
  // 去掉 hash 部分
  var hashIndex = query.indexOf("#");
  if (hashIndex !== -1) {
    query = query.slice(0, hashIndex);
  }

  if (!query) return {};

  var params = {};
  var pairs = query.split("&");

  pairs.forEach(function (pair) {
    if (!pair) return;
    var eqIndex = pair.indexOf("=");
    var key, value;
    if (eqIndex === -1) {
      key = pair;
      value = "";
    } else {
      key = pair.slice(0, eqIndex);
      value = pair.slice(eqIndex + 1);
    }
    // 解码
    key = decodeURIComponent(key.replace(/\+/g, " "));
    value = decodeURIComponent(value.replace(/\+/g, " "));

    // 处理重复参数（转为数组）
    if (key in params) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });

  return params;
}

/**
 * 将对象序列化为查询字符串
 * @param {Object} params - 参数对象
 * @param {boolean} [encode=true] - 是否编码
 * @returns {string} 查询字符串（不含 ?）
 */
function stringifyUrlParams(params, encode) {
  if (!params || typeof params !== "object") return "";
  encode = encode !== false;

  var pairs = [];
  Object.keys(params).forEach(function (key) {
    var value = params[key];
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach(function (v) {
        var k = encode ? encodeURIComponent(key) : key;
        var val = encode ? encodeURIComponent(v) : v;
        pairs.push(k + "=" + val);
      });
    } else {
      var k = encode ? encodeURIComponent(key) : key;
      var val = encode ? encodeURIComponent(value) : String(value);
      pairs.push(k + "=" + val);
    }
  });

  return pairs.join("&");
}

/**
 * 获取 URL 中的指定参数
 * @param {string} url
 * @param {string} name
 * @returns {string|null}
 */
function getUrlParam(url, name) {
  var params = parseUrlParams(url);
  var value = params[name];
  return value == null ? null : Array.isArray(value) ? value[0] : value;
}

/**
 * 使用 URLSearchParams 解析（现代浏览器/Node）
 * @param {string} url
 * @returns {Object}
 */
function parseByURLSearchParams(url) {
  if (typeof URLSearchParams === "undefined") {
    return parseUrlParams(url);
  }
  var query = url;
  var idx = url.indexOf("?");
  if (idx !== -1) query = url.slice(idx + 1);
  var hashIdx = query.indexOf("#");
  if (hashIdx !== -1) query = query.slice(0, hashIdx);

  var usp = new URLSearchParams(query);
  var params = {};
  usp.forEach(function (value, key) {
    if (key in params) {
      if (Array.isArray(params[key])) params[key].push(value);
      else params[key] = [params[key], value];
    } else {
      params[key] = value;
    }
  });
  return params;
}

// ===== 测试用例 =====
console.log(parseUrlParams("https://example.com?a=1&b=2"));
// => { a: '1', b: '2' }

console.log(parseUrlParams("?name=hello&age=20"));
// => { name: 'hello', age: '20' }

console.log(parseUrlParams("a=1&b=2&c=3"));
// => { a: '1', b: '2', c: '3' }

console.log(parseUrlParams("https://example.com?tags=js&tags=css&tags=html"));
// => { tags: ['js', 'css', 'html'] }

console.log(parseUrlParams("https://example.com?q=hello%20world&lang=zh"));
// => { q: 'hello world', lang: 'zh' }

console.log(parseUrlParams("https://example.com?name=张三&city=北京"));
// => { name: '张三', city: '北京' }

console.log(parseUrlParams("https://example.com?a=1#hash"));
// => { a: '1' }

console.log(stringifyUrlParams({ a: 1, b: "hello", c: [1, 2, 3] }));
// => 'a=1&b=hello&c=1&c=2&c=3'

console.log(getUrlParam("https://example.com?id=123&type=article", "id"));
// => '123'

console.log(getUrlParam("https://example.com?id=123", "notexist"));
// => null

// 解码测试
console.log(
  stringifyUrlParams({ url: "https://test.com?a=1", name: "hello world" }),
);
// => 'url=https%3A%2F%2Ftest.com%3Fa%3D1&name=hello%20world'
