/**
 * 手写 Base64 解码
 *
 * Base64 解码是编码的逆过程：
 *   1. 去除空白与非法字符，按 4 字符一组
 *   2. 每个字符查表得到 6 bit，4 个拼成 24 bit
 *   3. 24 bit 拆成 3 字节
 *   4. 根据末尾 = 个数决定丢弃多少字节
 *   5. 字节序列再按 UTF-8 解码回字符串（支持中文）
 *
 * 实现思路：
 *   - 建立反向查表 Map
 *   - 处理 padding 后逐组还原字节
 *   - 用 TextDecoder（Node 11+ / 浏览器）将 UTF-8 字节转字符串
 */

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const REVERSE_MAP = new Map(
  BASE64_CHARS.split("").map((ch, idx) => [ch, idx])
);

function base64Decode(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }

  // 去除空白
  const cleaned = str.replace(/[^A-Za-z0-9+/=]/g, "");

  if (cleaned.length % 4 !== 0) {
    throw new Error("Invalid base64 string length");
  }

  const bytes = [];
  let i = 0;

  while (i < cleaned.length) {
    const c0 = cleaned[i];
    const c1 = cleaned[i + 1];
    const c2 = cleaned[i + 2];
    const c3 = cleaned[i + 3];

    const v0 = REVERSE_MAP.get(c0) ?? 0;
    const v1 = REVERSE_MAP.get(c1) ?? 0;
    const v2 = c2 === "=" ? 0 : REVERSE_MAP.get(c2) ?? 0;
    const v3 = c3 === "=" ? 0 : REVERSE_MAP.get(c3) ?? 0;

    const triplet = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;

    bytes.push((triplet >> 16) & 0xff);
    if (c2 !== "=") bytes.push((triplet >> 8) & 0xff);
    if (c3 !== "=") bytes.push(triplet & 0xff);

    i += 4;
  }

  return utf8BytesToString(bytes);
}

function utf8BytesToString(bytes) {
  // 优先用 TextDecoder
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  }
  // 降级：手动 UTF-8 解码
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
        ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f)
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
        0xdc00 + (adj & 0x3ff)
      );
      i += 4;
    }
  }
  return result;
}

// ===== 测试 =====
console.log(base64Decode("Zg==")); // f
console.log(base64Decode("Zm8=")); // fo
console.log(base64Decode("Zm9v")); // foo
console.log(base64Decode("Zm9vYmFy")); // foobar
console.log(base64Decode("SGVsbG8gV29ybGQ=")); // Hello World
console.log(base64Decode("5Lit5paH5rWL6K+V")); // 中文测试
console.log(base64Decode("YQ==")); // a
console.log(base64Decode("YWI=")); // ab

// 与 Node 原生对比
console.log("原生解码:", Buffer.from("SGVsbG8gV29ybGQ=", "base64").toString()); // Hello World
console.log(
  "中文解码一致:",
  base64Decode("5Lit5paH5rWL6K+V") ===
    Buffer.from("5Lit5paH5rWL6K+V", "base64").toString() // true
);

// 忽略空白字符
console.log(base64Decode("Z m9v\n")); // foo

// 异常输入
try {
  base64Decode("abc"); // 长度非 4 倍数
} catch (e) {
  console.log("捕获错误:", e.message); // 捕获错误: Invalid base64 string length
}
