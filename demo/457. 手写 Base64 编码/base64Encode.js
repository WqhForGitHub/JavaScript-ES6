/**
 * 手写 Base64 编码
 *
 * Base64 把任意二进制按 6 bit 一组映射到 64 个可打印字符（A-Z a-z 0-9 + /），
 * 不足 3 字节用 = 补位。常用于在文本协议中传输二进制数据。
 *
 * 实现思路：
 *   1. 字符串转 UTF-8 字节序列（支持中文，不能直接用 charCodeAt，否则中文乱码）
 *   2. 每 3 字节拼成 24 bit，拆成 4 个 6 bit
 *   3. 6 bit 作索引查表
 *   4. 末尾不足 3 字节补 0，输出对应个数的 =
 *
 * 注意：直接 charCodeAt 会把中文按 UTF-16 处理，必须先转 UTF-8。
 */

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function utf8ToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      // 处理代理对（emoji 等）
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

function base64Encode(str) {
  const bytes = utf8ToBytes(str);
  let result = "";
  let i = 0;

  while (i < bytes.length) {
    const b0 = bytes[i] || 0;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    const triplet = (b0 << 16) | ((b1 || 0) << 8) | (b2 || 0);

    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += b1 === undefined ? "=" : BASE64_CHARS[(triplet >> 6) & 0x3f];
    result += b2 === undefined ? "=" : BASE64_CHARS[triplet & 0x3f];

    i += 3;
  }

  return result;
}

// ===== 测试 =====
console.log(base64Encode("")); // （空字符串）
console.log(base64Encode("f")); // Zg==
console.log(base64Encode("fo")); // Zm8=
console.log(base64Encode("foo")); // Zm9v
console.log(base64Encode("foobar")); // Zm9vYmFy
console.log(base64Encode("Hello World")); // SGVsbG8gV29ybGQ=
console.log(base64Encode("中文测试")); // 5Lit5paH5rWL6K+V
console.log(base64Encode("a")); // YQ==
console.log(base64Encode("ab")); // YWI=

// 与 Node 原生对比验证正确性
console.log("原生对比 foo:", Buffer.from("foo").toString("base64")); // Zm9v
console.log("原生对比 中文:", Buffer.from("中文测试").toString("base64")); // 5Lit5paH5rWL6K+V
console.log(
  "自实现 === 原生:",
  base64Encode("Hello World") === Buffer.from("Hello World").toString("base64"), // true
);
