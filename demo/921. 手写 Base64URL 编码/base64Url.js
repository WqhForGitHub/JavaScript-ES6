/**
 * 手写 Base64URL 编码与解码
 *
 * Base64URL 是 Base64 的 URL 安全变体：
 * - '+' 替换为 '-'
 * - '/' 替换为 '_'
 * - 去除末尾的 '=' 填充
 *
 * 应用场景：JWT (JSON Web Token)、URL 参数传递二进制数据等。
 *
 * 算法原理：
 * 1. 将输入字符串进行 UTF-8 编码，得到字节数组
 * 2. 每 3 个字节（24 位）拆分为 4 组 6 位，每组映射到 Base64 字母表
 * 3. 不足 3 字节时用 0 补齐并添加 '=' 填充
 * 4. 将结果中的 '+' -> '-'，'/' -> '_'，去除 '=' 即得到 Base64URL
 */

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * 将字符串进行 UTF-8 编码，返回字节数组
 * @param {string} str - 输入字符串
 * @returns {number[]} UTF-8 字节数组
 */
function utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    // 处理代理对（surrogate pairs），用于超过 U+FFFF 的字符（如部分 emoji）
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
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

/**
 * 将 UTF-8 字节数组解码为字符串
 * @param {number[]} bytes - UTF-8 字节数组
 * @returns {string} 解码后的字符串
 */
function utf8Decode(bytes) {
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i];
    let code;
    if (b1 < 0x80) {
      code = b1;
      i++;
    } else if (b1 < 0xe0) {
      code = ((b1 & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
      i += 2;
    } else if (b1 < 0xf0) {
      code =
        ((b1 & 0x0f) << 12) |
        ((bytes[i + 1] & 0x3f) << 6) |
        (bytes[i + 2] & 0x3f);
      i += 3;
    } else {
      code =
        ((b1 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      i += 4;
    }
    // 超出 BMP 的码点需要转换为代理对
    if (code < 0x10000) {
      result += String.fromCharCode(code);
    } else {
      code -= 0x10000;
      result += String.fromCharCode(
        0xd800 + (code >> 10),
        0xdc00 + (code & 0x3ff),
      );
    }
  }
  return result;
}

/**
 * 将字节数组编码为标准 Base64 字符串
 * @param {number[]} bytes - 字节数组
 * @returns {string} 标准 Base64 字符串（含 +/=）
 */
function base64Encode(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    // 将 3 个字节合并为 24 位整数
    const triple = (b1 << 16) | (b2 << 8) | b3;
    result += BASE64_ALPHABET[(triple >> 18) & 0x3f];
    result += BASE64_ALPHABET[(triple >> 12) & 0x3f];
    // 不足字节的位置用 '=' 填充
    result +=
      i + 1 < bytes.length ? BASE64_ALPHABET[(triple >> 6) & 0x3f] : "=";
    result += i + 2 < bytes.length ? BASE64_ALPHABET[triple & 0x3f] : "=";
  }
  return result;
}

/**
 * 将标准 Base64 字符串解码为字节数组
 * @param {string} str - 标准 Base64 字符串
 * @returns {number[]} 字节数组
 */
function base64Decode(str) {
  // 构建字符到索引的反查表
  const lookup = {};
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    lookup[BASE64_ALPHABET[i]] = i;
  }
  // 移除填充字符
  const clean = str.replace(/=+$/, "");
  const bytes = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = clean[i] in lookup ? lookup[clean[i]] : 0;
    const c2 =
      i + 1 < clean.length && clean[i + 1] in lookup ? lookup[clean[i + 1]] : 0;
    const c3 =
      i + 2 < clean.length && clean[i + 2] in lookup ? lookup[clean[i + 2]] : 0;
    const c4 =
      i + 3 < clean.length && clean[i + 3] in lookup ? lookup[clean[i + 3]] : 0;
    const triple = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
    bytes.push((triple >> 16) & 0xff);
    if (i + 2 < clean.length) bytes.push((triple >> 8) & 0xff);
    if (i + 3 < clean.length) bytes.push(triple & 0xff);
  }
  return bytes;
}

/**
 * Base64URL 编码
 * @param {string} str - 要编码的字符串
 * @returns {string} Base64URL 编码字符串
 */
function base64UrlEncode(str) {
  const standard = base64Encode(utf8Encode(str));
  // 替换 URL 不安全字符并去除填充
  return standard.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Base64URL 解码
 * @param {string} str - Base64URL 编码字符串
 * @returns {string} 解码后的字符串
 */
function base64UrlDecode(str) {
  // 将 Base64URL 还原为标准 Base64
  let standard = str.replace(/-/g, "+").replace(/_/g, "/");
  // 补齐 4 的倍数长度所需的 '=' 填充
  while (standard.length % 4 !== 0) {
    standard += "=";
  }
  return utf8Decode(base64Decode(standard));
}

// ===================== 测试用例 =====================
console.log("===== Base64URL 编码/解码 测试 =====");

const tests = [
  "Hello, World!",
  "hello",
  "foobar",
  "中文测试",
  "🎉 Emoji 表情",
  "a",
  "ab",
  "abc",
  "a+b/c= 数据",
];

for (const test of tests) {
  const encoded = base64UrlEncode(test);
  const decoded = base64UrlDecode(encoded);
  console.log(`原文: "${test}"`);
  console.log(`编码: "${encoded}"`);
  console.log(`解码: "${decoded}"`);
  console.log(`往返一致: ${decoded === test}`);
  console.log("---");
}
