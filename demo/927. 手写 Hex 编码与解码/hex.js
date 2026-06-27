/**
 * 手写 Hex 编码与解码
 *
 * 将字节数组转换为十六进制字符串（小写或大写），以及反向转换。
 * 支持字符串输入（先 UTF-8 编码）和可选的 "0x" 前缀。
 *
 * 十六进制映射：
 *   每个字节（8 位）拆分为高 4 位和低 4 位，各映射到一个十六进制字符
 *   0-9 -> '0'-'9'，10-15 -> 'A'-'F' 或 'a'-'f'
 */

const HEX_LOWER = "0123456789abcdef";
const HEX_UPPER = "0123456789ABCDEF";

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
 * 将十六进制字符转换为数值
 * @param {string} c - 十六进制字符（大小写不敏感）
 * @returns {number} 0-15，无效返回 -1
 */
function hexValue(c) {
  const code = c.charCodeAt(0);
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  if (code >= 0x41 && code <= 0x46) return code - 0x41 + 10;
  if (code >= 0x61 && code <= 0x66) return code - 0x61 + 10;
  return -1;
}

/**
 * 将字节数组编码为十六进制字符串
 * @param {number[]|Uint8Array} bytes - 字节数组
 * @param {Object} [options]
 * @param {boolean} [options.uppercase=false] - 是否使用大写字母
 * @param {boolean} [options.prefix=false] - 是否添加 0x 前缀
 * @returns {string} 十六进制字符串
 */
function bytesToHex(bytes, options = {}) {
  const { uppercase = false, prefix = false } = options;
  const table = uppercase ? HEX_UPPER : HEX_LOWER;
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] & 0xff;
    result += table[b >> 4] + table[b & 0x0f];
  }
  return (prefix ? "0x" : "") + result;
}

/**
 * 将十六进制字符串解码为字节数组
 * @param {string} hex - 十六进制字符串（可含空格、0x 前缀，大小写不敏感）
 * @returns {number[]} 字节数组
 * @throws {Error} 遇到非法十六进制字符时抛出错误
 */
function hexToBytes(hex) {
  // 去除 0x/0X 前缀和所有空白字符
  let clean = hex.replace(/\s+/g, "");
  if (clean.toLowerCase().startsWith("0x")) {
    clean = clean.slice(2);
  }
  // 奇数长度时补前导 0
  if (clean.length % 2 !== 0) {
    clean = "0" + clean;
  }
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) {
    const h1 = hexValue(clean[i]);
    const h2 = hexValue(clean[i + 1]);
    if (h1 < 0 || h2 < 0) {
      throw new Error(
        `Invalid hex character at position ${i}: "${clean[i]}${clean[i + 1] || ""}"`,
      );
    }
    bytes.push((h1 << 4) | h2);
  }
  return bytes;
}

/**
 * 将字符串编码为十六进制（先 UTF-8 编码）
 * @param {string} str - 输入字符串
 * @param {Object} [options] - 编码选项（uppercase、prefix）
 * @returns {string} 十六进制字符串
 */
function stringToHex(str, options = {}) {
  return bytesToHex(utf8Encode(str), options);
}

/**
 * 将十六进制字符串解码为字符串（UTF-8）
 * @param {string} hex - 十六进制字符串
 * @returns {string} 解码后的字符串
 */
function hexToString(hex) {
  return utf8Decode(hexToBytes(hex));
}

// ===================== 测试用例 =====================
console.log("===== Hex 编码/解码 测试 =====");

// 字节数组测试
const byteTests = [
  { bytes: [0x00, 0xff, 0x10, 0xab], desc: "混合字节" },
  { bytes: [0xde, 0xad, 0xbe, 0xef], desc: "DEADBEEF" },
  { bytes: [], desc: "空数组" },
];

for (const { bytes, desc } of byteTests) {
  const lower = bytesToHex(bytes);
  const upper = bytesToHex(bytes, { uppercase: true });
  const prefixed = bytesToHex(bytes, { prefix: true });
  const decoded = hexToBytes(lower);
  console.log(`${desc}: ${JSON.stringify(bytes)}`);
  console.log(`  小写: ${lower}`);
  console.log(`  大写: ${upper}`);
  console.log(`  带前缀: ${prefixed}`);
  console.log(
    `  往返一致: ${JSON.stringify(decoded) === JSON.stringify(bytes.map((b) => b))}`,
  );
  console.log("---");
}

// 字符串测试
console.log("===== 字符串 Hex 互转测试 =====");
const stringTests = ["Hello", "中文测试", "🎉", "ABC123", ""];
for (const s of stringTests) {
  const hex = stringToHex(s, { uppercase: true });
  const decoded = hexToString(hex);
  console.log(`"${s}" -> ${hex} -> "${decoded}" | 一致: ${decoded === s}`);
}

// 带 0x 前缀和空格的解码测试
console.log("\n===== 前缀与空格测试 =====");
console.log("0xDE AD BE EF ->", hexToBytes("0xDE AD BE EF"));
console.log("0xdeadbeef ->", hexToBytes("0xdeadbeef"));
console.log("DEADBEEF ->", hexToBytes("DEADBEEF"));
console.log("0xabc (奇数长度) ->", hexToBytes("0xabc"));

// 错误处理测试
console.log("\n===== 错误处理测试 =====");
try {
  hexToBytes("0xGGHH");
} catch (e) {
  console.log(`非法输入 "0xGGHH" -> 错误: ${e.message}`);
}
