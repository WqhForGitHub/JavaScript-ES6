/**
 * 手写 ArrayBuffer 与 String 互转
 *
 * 不使用 TextEncoder/TextDecoder，手动进行 UTF-8 字节操作。
 * 支持中文等多字节字符。
 *
 * 实现思路：
 * - stringToArrayBuffer：先计算 UTF-8 编码所需字节数，创建 ArrayBuffer，
 *   再用 Uint8Array 视图逐字节写入 UTF-8 编码
 * - arrayBufferToString：用 Uint8Array 视图读取字节，按 UTF-8 规则
 *   解码多字节序列，还原为字符串
 *
 * UTF-8 编码规则：
 * - U+0000 ~ U+007F    -> 1 字节: 0xxxxxxx
 * - U+0080 ~ U+07FF    -> 2 字节: 110xxxxx 10xxxxxx
 * - U+0800 ~ U+FFFF    -> 3 字节: 1110xxxx 10xxxxxx 10xxxxxx
 * - U+10000 ~ U+10FFFF -> 4 字节: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
 */

/**
 * 将字符串编码为 UTF-8 字节并存入 ArrayBuffer
 * @param {string} str - 输入字符串
 * @returns {ArrayBuffer} 包含 UTF-8 字节的 ArrayBuffer
 */
function stringToArrayBuffer(str) {
  // 第一步：计算所需字节数
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) byteLength += 1;
    else if (code < 0x800) byteLength += 2;
    else if (code < 0x10000) byteLength += 3;
    else byteLength += 4;
  }

  // 第二步：创建 ArrayBuffer 并写入字节
  const buffer = new ArrayBuffer(byteLength);
  const view = new Uint8Array(buffer);
  let offset = 0;

  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) {
      view[offset++] = code;
    } else if (code < 0x800) {
      view[offset++] = 0xc0 | (code >> 6);
      view[offset++] = 0x80 | (code & 0x3f);
    } else if (code < 0x10000) {
      view[offset++] = 0xe0 | (code >> 12);
      view[offset++] = 0x80 | ((code >> 6) & 0x3f);
      view[offset++] = 0x80 | (code & 0x3f);
    } else {
      view[offset++] = 0xf0 | (code >> 18);
      view[offset++] = 0x80 | ((code >> 12) & 0x3f);
      view[offset++] = 0x80 | ((code >> 6) & 0x3f);
      view[offset++] = 0x80 | (code & 0x3f);
    }
  }
  return buffer;
}

/**
 * 将 ArrayBuffer（UTF-8 字节）解码为字符串
 * @param {ArrayBuffer} buffer - 包含 UTF-8 字节的 ArrayBuffer
 * @returns {string} 解码后的字符串
 */
function arrayBufferToString(buffer) {
  const view = new Uint8Array(buffer);
  let result = "";
  let i = 0;
  while (i < view.length) {
    const b1 = view[i];
    let code;
    if (b1 < 0x80) {
      code = b1;
      i += 1;
    } else if (b1 < 0xe0) {
      code = ((b1 & 0x1f) << 6) | (view[i + 1] & 0x3f);
      i += 2;
    } else if (b1 < 0xf0) {
      code =
        ((b1 & 0x0f) << 12) |
        ((view[i + 1] & 0x3f) << 6) |
        (view[i + 2] & 0x3f);
      i += 3;
    } else {
      code =
        ((b1 & 0x07) << 18) |
        ((view[i + 1] & 0x3f) << 12) |
        ((view[i + 2] & 0x3f) << 6) |
        (view[i + 3] & 0x3f);
      i += 4;
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
console.log("===== ArrayBuffer 与 String 互转 测试 =====");

const testCases = [
  "Hello, World!",
  "中文测试 UTF-8",
  "混合 Mixed 文字 123",
  "🎉 Emoji 表情 😀🚀",
  "Àéîõü 特殊字符",
  "", // 空字符串
  "a", // 单字节
];

for (const tc of testCases) {
  const buffer = stringToArrayBuffer(tc);
  const restored = arrayBufferToString(buffer);
  console.log(`原文: "${tc}"`);
  console.log(`ArrayBuffer 字节长度: ${buffer.byteLength}`);
  console.log(`字节内容: [${Array.from(new Uint8Array(buffer)).join(", ")}]`);
  console.log(`解码: "${restored}"`);
  console.log(`往返一致: ${restored === tc}`);
  console.log("---");
}

// 验证不使用 TextEncoder/TextDecoder 也能正确处理
console.log("===== 与内置 TextEncoder 对比（验证正确性）=====");
const sample = "你好，世界！Hello World 🌍";
const myBuffer = stringToArrayBuffer(sample);
const builtinBuffer = new TextEncoder().encode(sample);
const myBytes = Array.from(new Uint8Array(myBuffer));
const builtinBytes = Array.from(builtinBuffer);
console.log(`手写字节长度: ${myBuffer.byteLength}`);
console.log(`内置字节长度: ${builtinBuffer.byteLength}`);
console.log(`字节内容一致: ${myBytes.join(",") === builtinBytes.join(",")}`);

// 验证使用内置 TextDecoder 解码手写的 ArrayBuffer
const decodedByBuiltin = new TextDecoder().decode(myBuffer);
console.log(`内置 TextDecoder 解码手写 ArrayBuffer: "${decodedByBuiltin}"`);
console.log(`与原文一致: ${decodedByBuiltin === sample}`);
