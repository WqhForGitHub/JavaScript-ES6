/**
 * 手写将查询字符串解析为对象 parseQuery
 *
 * 作用：
 *   - 将 URL 查询字符串解析为键值对对象
 *   - 支持 '?' 前缀、URL 编码、多值参数、无值参数
 *
 * 示例：
 *   parseQuery('?a=1&b=2')        → { a: '1', b: '2' }
 *   parseQuery('a=1&b=2&b=3')     → { a: '1', b: ['2', '3'] }
 *   parseQuery('?name=Tom%20Lee') → { name: 'Tom Lee' }
 *   parseQuery('?a&b=2')          → { a: '', b: '2' }
 *
 * 实现思路：
 *   1. 去掉开头的 '?' 或 '#'
 *   2. 用 '&' 分割为参数对
 *   3. 每对用 '=' 分割为 key 和 value（首次出现的 '=' 才算分隔符）
 *   4. 用 decodeURIComponent 解码
 *   5. 重复 key 收集为数组
 */

function parseQuery(queryString, options = {}) {
  const {
    decode = decodeURIComponent,
    arrayForMulti = true, // 多值是否转为数组
  } = options;

  if (typeof queryString !== "string") {
    return {};
  }

  // 去掉开头的 ? 或 #
  let str = queryString;
  if (str[0] === "?" || str[0] === "#") {
    str = str.slice(1);
  }

  if (str === "") return {};

  const result = {};
  const pairs = str.split("&");

  for (const pair of pairs) {
    if (pair === "") continue; // 忽略空段

    // 用第一个 '=' 分割（value 中可能含 '='）
    const eqIndex = pair.indexOf("=");
    let key;
    let value;

    if (eqIndex === -1) {
      // 无 '='：只有 key，value 视为空字符串
      key = pair;
      value = "";
    } else {
      key = pair.slice(0, eqIndex);
      value = pair.slice(eqIndex + 1);
    }

    key = decode(key);
    value = decode(value);

    if (key === "") continue;

    if (key in result) {
      // 已存在：转为数组（或追加）
      const existing = result[key];
      if (arrayForMulti) {
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          result[key] = [existing, value];
        }
      } else {
        result[key] = value; // 后者覆盖
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ===== 测试 =====

console.log(parseQuery("?a=1&b=2"));
// { a: '1', b: '2' }

console.log(parseQuery("a=1&b=2"));
// { a: '1', b: '2' }（不带 ? 也支持）

// URL 编码
console.log(parseQuery("?name=Tom%20Lee&city=%E5%8C%97%E4%BA%AC"));
// { name: 'Tom Lee', city: '北京' }

// 多值参数转数组
console.log(parseQuery("?a=1&b=2&b=3&b=4"));
// { a: '1', b: ['2', '3', '4'] }

// 无值参数
console.log(parseQuery("?a&b=2"));
// { a: '', b: '2' }

// value 含 '='
console.log(parseQuery("?url=http://x.com?a=1&b=2"));
// { url: 'http://x.com?a=1', b: '2' }

// 空字符串
console.log(parseQuery("")); // {}
console.log(parseQuery("?")); // {}

// 不转数组模式
console.log(parseQuery("?a=1&b=2&b=3", { arrayForMulti: false }));
// { a: '1', b: '3' }（后者覆盖）

// 与原生 URLSearchParams 对比
const native = Object.fromEntries(new URLSearchParams("a=1&b=2"));
console.log(native); // { a: '1', b: '2' }

// 实用场景：解析 location.search
const fakeSearch = "?keyword=js&page=1&tag=frontend&tag=backend";
const parsed = parseQuery(fakeSearch);
console.log(parsed);
// { keyword: 'js', page: '1', tag: ['frontend', 'backend'] }
