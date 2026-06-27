/**
 * 手写 encodeURIComponent 实现
 *
 * 规则：
 * - 不编码的字符（unreserved）：A-Z a-z 0-9 - _ . ! ~ * ' ( )
 * - 其他所有字符编码为 %XX（每个 UTF-8 字节的十六进制大写表示）
 * - 非 ASCII 字符先进行 UTF-8 编码，再对每个字节进行 %XX 编码
 *
 * 注意：本实现不使用内置 encodeURIComponent。
 *
 * 不编码字符集（与规范一致）：
 *   数字 0-9 (0x30-0x39)
 *   字母 A-Z (0x41-0x5A)、a-z (0x61-0x7A)
 *   - _ . ! ~ * ' ( )
 */

const HEX = "0123456789ABCDEF";

/**
 * 将字符串进行 UTF-8 编码，返回字节数组
 * @param {string} str - 输入字符串
 * @returns {number[]} UTF-8 字节数组
 */
function utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    // 处理代理对
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
 * 判断字节是否为不编码字符（unreserved）
 * @param {number} code - 字节值
 * @returns {boolean}
 */
function isUnreserved(code) {
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a) || // a-z
    code === 0x2d || // -
    code === 0x5f || // _
    code === 0x2e || // .
    code === 0x21 || // !
    code === 0x7e || // ~
    code === 0x2a || // *
    code === 0x27 || // '
    code === 0x28 || // (
    code === 0x29 // )
  );
}

/**
 * 手写 encodeURIComponent
 * 将字符串编码为 URL 安全形式，不编码字符保持原样，
 * 其余字符转为 %XX（UTF-8 字节的十六进制大写）
 * @param {string} str - 要编码的字符串
 * @returns {string} 编码后的字符串
 */
function myEncodeURIComponent(str) {
  const bytes = utf8Encode(str);
  let result = "";
  for (const b of bytes) {
    if (isUnreserved(b)) {
      result += String.fromCharCode(b);
    } else {
      result += "%" + HEX[b >> 4] + HEX[b & 0x0f];
    }
  }
  return result;
}

// ===================== 测试用例 =====================
console.log("===== 手写 encodeURIComponent 测试 =====");

const testCases = [
  "Hello World",
  "a/b?c=d&e=f",
  "中文测试",
  "🎉 emoji",
  "100% pure",
  "a&b<c>d",
  "key=value&name=test",
  " !*'()",
  "用户=张三&年龄=18",
  "https://example.com/path?q=hello world",
];

for (const tc of testCases) {
  const mine = myEncodeURIComponent(tc);
  const builtin = encodeURIComponent(tc);
  console.log(`原文: "${tc}"`);
  console.log(`手写: "${mine}"`);
  console.log(`内置: "${builtin}"`);
  console.log(`一致: ${mine === builtin}`);
  console.log("---");
}
