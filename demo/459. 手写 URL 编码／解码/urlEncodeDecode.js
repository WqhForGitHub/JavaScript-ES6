/**
 * 手写 URL 编码/解码
 *
 * URL 中部分字符（如空格、中文、&、=、# 等）有特殊含义或非 ASCII，
 * 传输前需进行百分号编码（percent-encoding）。
 *
 * 原生 encodeURIComponent / decodeURIComponent 已能处理大部分场景，
 * 但它们不会编码 ! ' ( ) * - . _ ~ 等"保留字符"。这里手写实现：
 *   - urlEncode(str)：把所有非"非保留字符 unreserved"（A-Za-z0-9-_.~）编码
 *   - urlDecode(str)：还原 %XX 序列，按 UTF-8 解码（支持中文）
 *   - encodeParams(obj) / decodeParams(str)：对象 <-> query 互转
 *
 * 实现思路：
 *   1. 字符串转 UTF-8 字节
 *   2. 每个字节转成 %XX（大写十六进制）
 *   3. 解码时按 %XX 解析字节，再用 TextDecoder 转 UTF-8
 */

const UNRESERVED = /[A-Za-z0-9\-_.~]/;

function utf8ToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
      i++;
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18));
      bytes.push(0x80 | ((code >> 12) & 0x3f));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

function urlEncode(str) {
  const bytes = utf8ToBytes(String(str));
  let result = "";
  for (const b of bytes) {
    const ch = String.fromCharCode(b);
    if (UNRESERVED.test(ch)) {
      result += ch;
    } else {
      result += "%" + b.toString(16).toUpperCase().padStart(2, "0");
    }
  }
  return result;
}

function urlDecode(str) {
  const bytes = [];
  let i = 0;
  const s = String(str);
  while (i < s.length) {
    const ch = s[i];
    if (ch === "%") {
      const hex = s.slice(i + 1, i + 3);
      bytes.push(parseInt(hex, 16));
      i += 3;
    } else if (ch === "+") {
      // 兼容 application/x-www-form-urlencoded 的 + 表示空格
      bytes.push(0x20);
      i++;
    } else {
      bytes.push(s.charCodeAt(i));
      i++;
    }
  }
  return bytesToUtf8String(bytes);
}

function bytesToUtf8String(bytes) {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  }
  // 降级
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) {
      result += String.fromCharCode(b);
      i++;
    } else if (b < 0xe0) {
      result += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (b < 0xf0) {
      result += String.fromCharCode(
        ((b & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else {
      const cp =
        ((b & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      const adj = cp - 0x10000;
      result += String.fromCharCode(
        0xd800 + (adj >> 10),
        0xdc00 + (adj & 0x3ff),
      );
      i += 4;
    }
  }
  return result;
}

function encodeParams(obj) {
  return Object.keys(obj)
    .filter((k) => obj[k] !== undefined && obj[k] !== null)
    .map((k) => `${urlEncode(k)}=${urlEncode(obj[k])}`)
    .join("&");
}

function decodeParams(query) {
  const result = {};
  const clean = query.replace(/^[?#]/, "");
  if (!clean) return result;
  clean.split("&").forEach((pair) => {
    if (!pair) return;
    const idx = pair.indexOf("=");
    let key, value;
    if (idx === -1) {
      key = pair;
      value = "";
    } else {
      key = pair.slice(0, idx);
      value = pair.slice(idx + 1);
    }
    result[urlDecode(key)] = urlDecode(value);
  });
  return result;
}

// ===== 测试 =====
console.log(urlEncode("hello world")); // hello%20world
console.log(urlEncode("中文/a&b=1")); // %E4%B8%AD%E6%96%87%2Fa%26b%3D1
console.log(urlEncode("a-b_c.d~e")); // a-b_c.d~e（非保留字符不编码）
console.log(urlDecode("hello%20world")); // hello world
console.log(urlDecode("%E4%B8%AD%E6%96%87")); // 中文
console.log(urlDecode("a+b")); // a b（+ 视作空格）

// 对比原生（原生不编码 !*'() 等）
console.log("原生 encodeURIComponent:", encodeURIComponent("a b&c")); // a%20b%26c
console.log("自实现:", urlEncode("a b&c")); // a%20b%26c

// query 互转
console.log(encodeParams({ name: "张三", age: 20, city: "北京" }));
// name=%E5%BC%A0%E4%B8%89&age=20&city=%E5%8C%97%E4%BA%AC
console.log(
  decodeParams("name=%E5%BC%A0%E4%B8%89&age=20&city=%E5%8C%97%E4%BA%AC"),
);
// { name: '张三', age: '20', city: '北京' }

console.log(decodeParams("?a=1&b=2")); // { a: '1', b: '2' }
console.log(encodeParams({ x: 1, y: undefined })); // x=1
