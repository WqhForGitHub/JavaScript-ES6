/**
 * 手写 Binary 与 String 互转
 *
 * 将字符串转换为二进制位串表示，以及反向转换。
 * 支持 ASCII 字符（单字节）和 Unicode 字符（通过 UTF-8 多字节编码）。
 *
 * 实现思路：
 * - 编码：将字符串 UTF-8 编码为字节数组，每个字节转为 8 位二进制字符串
 * - 解码：将二进制位串按 8 位分组还原为字节，再 UTF-8 解码为字符串
 *
 * 另提供按 Unicode 码点（不经过 UTF-8）查看二进制表示的辅助函数。
 */

/**
 * 将字符串进行 UTF-8 编码，返回字节数组
 * @param {string} str - 输入字符串
 * @returns {number[]} UTF-8 字节数组
 */
function utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
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
    if (code < 0x10000) result += String.fromCharCode(code);
    else {
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
 * 将单个字节转换为 8 位二进制字符串
 * @param {number} byte - 字节值（0-255）
 * @returns {string} 8 位二进制字符串，如 "01000001"
 */
function byteToBinary(byte) {
  let bits = "";
  for (let i = 7; i >= 0; i--) {
    bits += (byte >> i) & 1;
  }
  return bits;
}

/**
 * 将二进制字符串转换为字节值
 * @param {string} bits - 二进制字符串（如 "01000001"）
 * @returns {number} 字节值
 */
function binaryToByte(bits) {
  let value = 0;
  for (let i = 0; i < bits.length; i++) {
    value = (value << 1) | (bits[i] === "1" ? 1 : 0);
  }
  return value;
}

/**
 * 将字符串转换为二进制表示（基于 UTF-8 编码）
 * 每个字节转换为 8 位二进制，字节之间用分隔符分隔
 * @param {string} str - 输入字符串
 * @param {string} [separator=' '] - 字节间分隔符
 * @returns {string} 二进制字符串
 */
function stringToBinary(str, separator = " ") {
  const bytes = utf8Encode(str);
  return bytes.map(byteToBinary).join(separator);
}

/**
 * 将二进制字符串转换回字符串（基于 UTF-8 解码）
 * 支持空白分隔的字节（如 "01001000 01101001"），
 * 也支持无分隔符的连续二进制串（自动按 8 位分组，如 "0100100001101001"）
 * @param {string} binary - 二进制字符串
 * @returns {string} 解码后的字符串
 */
function binaryToString(binary) {
  const trimmed = binary.trim();
  let parts;
  if (/\s/.test(trimmed)) {
    // 有分隔符：按空白拆分
    parts = trimmed.split(/\s+/).filter((p) => p.length > 0);
  } else {
    // 无分隔符：按 8 位一组拆分
    parts = [];
    for (let i = 0; i < trimmed.length; i += 8) {
      parts.push(trimmed.slice(i, i + 8));
    }
  }
  const bytes = parts.map(binaryToByte);
  return utf8Decode(bytes);
}

/**
 * 将字符串中每个字符按 Unicode 码点转换为二进制表示（不经过 UTF-8）
 * 用于查看字符的原始码点二进制
 * @param {string} str - 输入字符串
 * @returns {string} 每个字符的二进制码点表示（16 位或 21 位）
 */
function stringToBinaryCodePoints(str) {
  const parts = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    parts.push(code.toString(2).padStart(code < 0x10000 ? 16 : 21, "0"));
  }
  return parts.join(" ");
}

// ===================== 测试用例 =====================
console.log("===== Binary 与 String 互转 测试 =====");

const testCases = ["Hello", "A", "AB", "中文", "🎉", "Hi 世界"];

for (const tc of testCases) {
  const bin = stringToBinary(tc);
  const restored = binaryToString(bin);
  console.log(`原文: "${tc}"`);
  console.log(`二进制: ${bin}`);
  console.log(`解码: "${restored}"`);
  console.log(`往返一致: ${restored === tc}`);
  console.log("---");
}

// 字符 Unicode 码点二进制表示
console.log("===== 字符 Unicode 码点二进制表示 =====");
const chars = ["A", "中", "🎉", "€"];
for (const ch of chars) {
  const cp = ch.codePointAt(0);
  console.log(
    `"${ch}" (U+${cp.toString(16).toUpperCase().padStart(4, "0")}): ${stringToBinaryCodePoints(ch)}`,
  );
}

// 不同分隔符测试
console.log("\n===== 不同分隔符测试 =====");
const sample = "Hi";
console.log(`默认空格: ${stringToBinary(sample)}`);
console.log(`无分隔符: ${stringToBinary(sample, "")}`);
console.log(`"|" 分隔: ${stringToBinary(sample, "|")}`);
console.log(`无分隔符解码: "${binaryToString(stringToBinary(sample, ""))}"`);
