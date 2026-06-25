/**
 * 手写提取 URL 参数
 *
 * 功能：从 URL 字符串中解析查询参数，返回键值对对象
 * 实现思路：
 *   1. 从 URL 中截取 ? 后面的查询字符串（支持 hash 之前的部分）
 *   2. 按 & 分割成键值对，再按 = 分割键和值
 *   3. 使用 decodeURIComponent 对键和值进行 URL 解码
 *   4. 处理无值参数（如 ?flag）、重复参数（聚合为数组）、空值等边界情况
 */

/**
 * 提取 URL 中的查询参数
 * @param {string} url 完整 URL 或查询字符串
 * @returns {Object} 参数对象，重复 key 聚合为数组
 */
function extractUrlParams(url) {
  const result = {};

  if (typeof url !== "string" || url.length === 0) return result;

  // 截取 ? 之后、# 之前的查询串
  let query = url;
  const hashIndex = query.indexOf("#");
  if (hashIndex !== -1) query = query.slice(0, hashIndex);

  const qIndex = query.indexOf("?");
  if (qIndex !== -1) {
    // 含 ?：取 ? 之后的查询串
    query = query.slice(qIndex + 1);
  } else if (!/[=&]/.test(query)) {
    // 无 ? 且无查询特征（= 或 &）：视为无参数的普通 URL
    return result;
  }
  // 否则把整个字符串当作查询串处理（如 'a=1&b=2'）

  if (query.length === 0) return result;

  // 按 & 分割键值对
  const pairs = query.split("&");

  for (const pair of pairs) {
    if (pair === "") continue;

    let key, value;
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) {
      key = pair;
      value = "";
    } else {
      key = pair.slice(0, eqIndex);
      value = pair.slice(eqIndex + 1);
    }

    // URL 解码
    try {
      key = decodeURIComponent(key.replace(/\+/g, " "));
      value = decodeURIComponent(value.replace(/\+/g, " "));
    } catch (e) {
      // 非法编码保持原样
    }

    if (Object.prototype.hasOwnProperty.call(result, key)) {
      // 已存在该 key，聚合为数组
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ===== 测试用例 =====
console.log("=== 提取 URL 参数 ===");

// 1. 基本参数
console.log(extractUrlParams("https://example.com?a=1&b=2"));
// 期望输出: { a: '1', b: '2' }

// 2. 带中文与编码
console.log(
  extractUrlParams("https://example.com?name=%E5%BC%A0%E4%B8%89&age=18"),
);
// 期望输出: { name: '张三', age: '18' }

// 3. 含 + 号作为空格（form-urlencoded 风格）
console.log(extractUrlParams("https://example.com?q=hello+world"));
// 期望输出: { q: 'hello world' }

// 4. 无值参数
console.log(extractUrlParams("https://example.com?flag&debug="));
// 期望输出: { flag: '', debug: '' }

// 5. 重复参数聚合成数组
console.log(
  extractUrlParams("https://example.com?color=red&color=blue&color=green"),
);
// 期望输出: { color: ['red', 'blue', 'green'] }

// 6. 带 hash 的 URL
console.log(extractUrlParams("https://example.com?a=1&b=2#section"));
// 期望输出: { a: '1', b: '2' }

// 7. 只有查询串
console.log(extractUrlParams("a=1&b=2&c=3"));
// 期望输出: { a: '1', b: '2', c: '3' }

// 8. 空字符串与非法输入
console.log(extractUrlParams(""));
// 期望输出: {}
console.log(extractUrlParams("https://example.com"));
// 期望输出: {}

// 9. 特殊字符编码
console.log(
  extractUrlParams("https://example.com?url=https%3A%2F%2Ftest.com%2Fpath"),
);
// 期望输出: { url: 'https://test.com/path' }
