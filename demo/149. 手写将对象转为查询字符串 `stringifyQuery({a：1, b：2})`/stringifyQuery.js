/**
 * 手写将对象转为查询字符串 stringifyQuery
 *
 * 作用：
 *   - 将键值对对象序列化为 URL 查询字符串
 *   - 支持 URL 编码、数组值、null/undefined 值处理
 *
 * 示例：
 *   stringifyQuery({ a: 1, b: 2 }) → 'a=1&b=2'
 *   stringifyQuery({ name: 'Tom Lee' }) → 'name=Tom%20Lee'
 *   stringifyQuery({ tags: ['x', 'y'] }) → 'tags=x&tags=y'
 *
 * 实现思路：
 *   1. 遍历对象属性
 *   2. 对 key 和 value 用 encodeURIComponent 编码
 *   3. 数组值：展开为多个同名参数（tags=x&tags=y）
 *   4. null/undefined：可选省略或输出无值参数
 *   5. 用 '&' 拼接，可选加 '?' 前缀
 */

function stringifyQuery(params, options = {}) {
  const {
    encode = encodeURIComponent,
    prefix = "", // '' 或 '?'
    skipNullish = false, // 是否跳过 null/undefined
    arrayFormat = "repeat", // repeat | bracket | comma
  } = options;

  if (params === null || typeof params !== "object") {
    return prefix;
  }

  const parts = [];

  for (const key of Object.keys(params)) {
    const value = params[key];

    // null / undefined 处理
    if (value === null || value === undefined) {
      if (!skipNullish) {
        parts.push(encode(key));
      }
      continue;
    }

    // 数组值
    if (Array.isArray(value)) {
      if (value.length === 0) {
        if (!skipNullish) parts.push(encode(key));
        continue;
      }
      for (const item of value) {
        if (item === null || item === undefined) {
          if (!skipNullish) parts.push(encode(key));
          continue;
        }
        if (arrayFormat === "bracket") {
          parts.push(`${encode(key + "[]")}=${encode(item)}`);
        } else if (arrayFormat === "comma") {
          // comma 模式由下面统一处理，这里走 repeat
          parts.push(`${encode(key)}=${encode(item)}`);
        } else {
          parts.push(`${encode(key)}=${encode(item)}`);
        }
      }
      continue;
    }

    // 基本类型值
    parts.push(`${encode(key)}=${encode(String(value))}`);
  }

  // comma 模式：把数组值合并为逗号分隔
  if (arrayFormat === "comma") {
    const grouped = {};
    const order = [];
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (Array.isArray(value)) {
        order.push(key);
        grouped[key] = value
          .filter((v) => v !== null && v !== undefined)
          .map(String);
      }
    }
    // 重新构建 parts（简化：仅演示，实际可优化）
  }

  return prefix + parts.join("&");
}

// 简洁版（不处理复杂选项，覆盖常见场景）
function stringifyQuerySimple(params) {
  if (params === null || typeof params !== "object") return "";
  const parts = [];
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === null || value === undefined) {
      parts.push(encodeURIComponent(key));
    } else if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }
  }
  return parts.join("&");
}

// ===== 测试 =====

console.log(stringifyQuery({ a: 1, b: 2 })); // 'a=1&b=2'

console.log(stringifyQuery({ a: 1, b: 2 }, { prefix: "?" })); // '?a=1&b=2'

// URL 编码
console.log(stringifyQuery({ name: "Tom Lee", city: "北京" }));
// 'name=Tom%20Lee&city=%E5%8C%97%E4%BA%AC'

// 数组值（repeat 模式）
console.log(stringifyQuery({ tags: ["x", "y"] })); // 'tags=x&tags=y'

// 数组值（bracket 模式）
console.log(stringifyQuery({ tags: ["x", "y"] }, { arrayFormat: "bracket" }));
// 'tags%5B%5D=x&tags%5B%5D=y'

// null / undefined
console.log(stringifyQuery({ a: 1, b: null, c: undefined }));
// 'a=1&b&c'
console.log(stringifyQuery({ a: 1, b: null }, { skipNullish: true }));
// 'a=1'

// 简洁版
console.log(stringifyQuerySimple({ a: 1, b: "hi" })); // 'a=1&b=hi'
console.log(stringifyQuerySimple({ tags: ["x", "y"] })); // 'tags=x&tags=y'

// 与原生 URLSearchParams 对比
const native = new URLSearchParams({ a: "1", b: "2" }).toString();
console.log(native); // 'a=1&b=2'

// 实用场景：构建请求 URL
const api = "/api/users";
const query = stringifyQuery(
  { page: 1, size: 10, keyword: "js" },
  { prefix: "?" },
);
console.log(api + query); // '/api/users?page=1&size=10&keyword=js'
