/**
 * 手写 decodeURIComponent 实现
 *
 * 规则：
 * - 解析 %XX 转义序列，将其还原为对应字节
 * - 收集所有字节后进行 UTF-8 解码（处理多字节序列）
 * - 非 % 开头的字符直接保留
 *
 * 注意：本实现不使用内置 decodeURIComponent。
 *
 * UTF-8 解码规则：
 * - 0xxxxxxx                    -> 1 字节，码点 0-0x7F
 * - 110xxxxx 10xxxxxx           -> 2 字节，码点 0x80-0x7FF
 * - 1110xxxx 10xxxxxx 10xxxxxx  -> 3 字节，码点 0x800-0xFFFF
 * - 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx -> 4 字节，码点 0x10000+
 */

/**
 * 将十六进制字符转换为对应数值
 * @param {string} c - 十六进制字符
 * @returns {number} 0-15，无效时返回 -1
 */
function hexValue(c) {
  const code = c.charCodeAt(0);
  if (code >= 0x30 && code <= 0x39) return code - 0x30; // 0-9
  if (code >= 0x41 && code <= 0x46) return code - 0x41 + 10; // A-F
  if (code >= 0x61 && code <= 0x66) return code - 0x61 + 10; // a-f
  return -1;
}

/**
 * 手写 decodeURIComponent
 * 解析 %XX 转义序列并解码 UTF-8 字节
 * @param {string} str - 要解码的字符串
 * @returns {string} 解码后的字符串
 * @throws {URIError} 遇到无效的转义序列时抛出错误
 */
function myDecodeURIComponent(str) {
  // 第一步：将字符串转换为字节数组（%XX 转义 + 普通字符）
  const bytes = [];
  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (c === "%") {
      const h1 = i + 1 < str.length ? hexValue(str[i + 1]) : -1;
      const h2 = i + 2 < str.length ? hexValue(str[i + 2]) : -1;
      if (h1 < 0 || h2 < 0) {
        throw new URIError(
          "URI malformed: invalid escape sequence at position " + i,
        );
      }
      bytes.push((h1 << 4) | h2);
      i += 3;
    } else {
      bytes.push(str.charCodeAt(i));
      i++;
    }
  }

  // 第二步：UTF-8 解码字节数组为字符串
  let result = "";
  let j = 0;
  while (j < bytes.length) {
    const b1 = bytes[j];
    let code;
    if (b1 < 0x80) {
      code = b1;
      j++;
    } else if (b1 < 0xe0) {
      code = ((b1 & 0x1f) << 6) | (bytes[j + 1] & 0x3f);
      j += 2;
    } else if (b1 < 0xf0) {
      code =
        ((b1 & 0x0f) << 12) |
        ((bytes[j + 1] & 0x3f) << 6) |
        (bytes[j + 2] & 0x3f);
      j += 3;
    } else {
      code =
        ((b1 & 0x07) << 18) |
        ((bytes[j + 1] & 0x3f) << 12) |
        ((bytes[j + 2] & 0x3f) << 6) |
        (bytes[j + 3] & 0x3f);
      j += 4;
    }
    // 超出 BMP 的码点转换为代理对
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

// ===================== 测试用例 =====================
console.log("===== 手写 decodeURIComponent 测试 =====");

const testCases = [
  "Hello%20World",
  "a%2Fb%3Fc%3Dd%26e%3Df",
  "%E4%B8%AD%E6%96%87%E6%B5%8B%E8%AF%95",
  "%F0%9F%8E%89%20emoji",
  "100%25%20pure",
  "key%3Dvalue%26name%3Dtest",
  "Hello%2C%20%E4%B8%96%E7%95%8C%F0%9F%8C%8D",
  "%E7%94%A8%E6%88%B7%3D%E5%BC%A0%E4%B8%89%26%E5%B9%B4%E9%BE%84%3D18",
];

for (const tc of testCases) {
  try {
    const mine = myDecodeURIComponent(tc);
    const builtin = decodeURIComponent(tc);
    console.log(`编码: "${tc}"`);
    console.log(`手写解码: "${mine}"`);
    console.log(`内置解码: "${builtin}"`);
    console.log(`一致: ${mine === builtin}`);
  } catch (e) {
    console.log(`编码: "${tc}"`);
    console.log(`错误: ${e.message}`);
  }
  console.log("---");
}

// 往返测试
console.log("===== 往返测试（编码后解码）=====");
const originals = [
  "Hello World",
  "a/b?c=d",
  "中文测试 🎉",
  "100% pure",
  "key=value&name=test",
  "用户=张三&年龄=18",
];
for (const orig of originals) {
  const encoded = encodeURIComponent(orig);
  const decoded = myDecodeURIComponent(encoded);
  console.log(
    `"${orig}" -> "${encoded}" -> "${decoded}" | 一致: ${decoded === orig}`,
  );
}

// 错误处理测试
console.log("\n===== 错误处理测试 =====");
const invalidCases = ["%ZZ", "%2", "%"];
for (const tc of invalidCases) {
  try {
    myDecodeURIComponent(tc);
    console.log(`"${tc}" -> 未抛出错误`);
  } catch (e) {
    console.log(`"${tc}" -> 抛出错误: ${e.message}`);
  }
}
