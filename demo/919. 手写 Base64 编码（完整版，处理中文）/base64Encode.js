/**
 * 手写 Base64 编码（完整版，处理中文）
 *
 * Base64 编码原理：
 * 1. 把输入数据按字节（8 位）看待。
 * 2. 每 3 个字节（24 位）分成 4 组，每组 6 位。
 * 3. 每 6 位的值（0-63）查 Base64 字母表得到一个字符。
 * 4. 若最后剩 1 个字节：补 4 位 0，编出 2 个字符，再加 2 个 '=' 填充。
 * 5. 若最后剩 2 个字节：补 2 位 0，编出 3 个字符，再加 1 个 '=' 填充。
 *
 * 标准 Base64 字母表（RFC 4648）：
 *   A-Z (0-25), a-z (26-51), 0-9 (52-61), + (62), / (63)
 *
 * 处理中文的关键：先把字符串按 UTF-8 编码成字节，再对这些字节做 Base64。
 * 这样能正确处理中文、emoji 等多字节字符。
 * 不使用 btoa（btoa 只能处理 Latin1，遇到中文会报错）。
 */

/**
 * 标准 Base64 字母表。
 * @type {string}
 */
const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * 手写 UTF-8 编码：把字符串转为字节数组。
 * 处理代理对（emoji 等）。
 * @param {string} str
 * @returns {number[]} 0-255 字节列表。
 */
function utf8Encode(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    const isHigh = code >= 0xd800 && code <= 0xdbff;
    if (isHigh && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + (code - 0xd800) * 0x400 + (next - 0xdc00);
        i++;
      }
    }
    if (code <= 0x7f) {
      result.push(code);
    } else if (code <= 0x7ff) {
      result.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      if (code >= 0xd800 && code <= 0xdfff) code = 0xfffd;
      result.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    } else {
      result.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return result;
}

/**
 * 对字节数组进行 Base64 编码。
 * @param {number[]} bytes - 0-255 字节列表。
 * @returns {string} Base64 字符串。
 */
function base64EncodeBytes(bytes) {
  let result = "";
  const len = bytes.length;
  // 每次处理 3 个字节
  let i = 0;
  for (; i + 3 <= len; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    // 24 位大整数
    const triple = (b1 << 16) | (b2 << 8) | b3;
    // 拆成 4 个 6 位
    result += BASE64_ALPHABET[(triple >> 18) & 0x3f];
    result += BASE64_ALPHABET[(triple >> 12) & 0x3f];
    result += BASE64_ALPHABET[(triple >> 6) & 0x3f];
    result += BASE64_ALPHABET[triple & 0x3f];
  }
  // 处理剩余字节
  const remain = len - i;
  if (remain === 1) {
    const b1 = bytes[i];
    const triple = b1 << 16; // 后 16 位补 0
    result += BASE64_ALPHABET[(triple >> 18) & 0x3f];
    result += BASE64_ALPHABET[(triple >> 12) & 0x3f];
    result += "==";
  } else if (remain === 2) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const triple = (b1 << 16) | (b2 << 8); // 后 8 位补 0
    result += BASE64_ALPHABET[(triple >> 18) & 0x3f];
    result += BASE64_ALPHABET[(triple >> 12) & 0x3f];
    result += BASE64_ALPHABET[(triple >> 6) & 0x3f];
    result += "=";
  }
  return result;
}

/**
 * 对字符串进行 Base64 编码（自动 UTF-8 编码，支持中文）。
 * @param {string} str - 输入字符串。
 * @returns {string} Base64 字符串。
 */
function base64Encode(str) {
  const bytes = utf8Encode(str);
  return base64EncodeBytes(bytes);
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：ASCII 字符串 =====");
console.log(
  "base64Encode('Hello') =",
  base64Encode("Hello"),
  "(期望 SGVsbG8=)",
);
console.log("base64Encode('Man')   =", base64Encode("Man"), "(期望 TWFu)");
console.log("base64Encode('Ma')    =", base64Encode("Ma"), "(期望 TWE=)");
console.log("base64Encode('M')     =", base64Encode("M"), "(期望 TQ==)");

console.log("\n===== 测试 2：中文字符串 =====");
console.log("base64Encode('你好') =", base64Encode("你好"), "(期望 5L2g5aW9)");
console.log(
  "base64Encode('中文测试') =",
  base64Encode("中文测试"),
  "(期望 5Lit5paH5rWL6K+V)",
);

console.log("\n===== 测试 3：含 emoji =====");
console.log("base64Encode('😀') =", base64Encode("😀"), "(期望 8J+YgA==)");
console.log("base64Encode('Hello 世界!') =", base64Encode("Hello 世界!"));

console.log("\n===== 测试 4：空字符串 =====");
console.log(
  "base64Encode('') =",
  JSON.stringify(base64Encode("")),
  '(期望 "")',
);

console.log("\n===== 测试 5：与原生 btoa/atob 对比（仅 Latin1） =====");
if (typeof btoa !== "undefined") {
  const latinCases = ["Hello", "Man", "Ma", "M", "abc", "ABCD"];
  let pass = true;
  for (const c of latinCases) {
    const mine = base64Encode(c);
    const native = btoa(c);
    const ok = mine === native;
    if (!ok) pass = false;
    console.log(
      `'${c}' -> 我的: ${mine} | 原生: ${native} | ${ok ? "PASS" : "FAIL"}`,
    );
  }
  console.log(pass ? "\nLatin1 全部一致！" : "\n存在不一致！");
} else {
  console.log("当前环境无 btoa，跳过对比。");
}

console.log("\n===== 测试 6：与原生 Buffer 对比（中文） =====");
if (typeof Buffer !== "undefined") {
  const cnCases = ["你好", "中文测试", "Hello 世界！", "😀😁", "𝄞音乐"];
  let pass = true;
  for (const c of cnCases) {
    const mine = base64Encode(c);
    const native = Buffer.from(c, "utf-8").toString("base64");
    const ok = mine === native;
    if (!ok) pass = false;
    console.log(
      `'${c}' -> 我的: ${mine} | 原生: ${native} | ${ok ? "PASS" : "FAIL"}`,
    );
  }
  console.log(pass ? "\n中文编码全部与 Buffer 一致！" : "\n存在不一致！");
} else {
  console.log("当前环境无 Buffer，跳过对比。");
}

console.log('\n===== 测试 7：编码细节演示（"Man" 的位运算过程） =====');
// 'M' = 0x4D = 01001101
// 'a' = 0x61 = 01100001
// 'n' = 0x6E = 01101110
// 24 位: 01001101 01100001 01101110
// 6 位组: 010011 010110 000101 101110 = 19 22 5 46 -> T W F u
console.log("期望 'Man' -> 'TWFu'");
console.log("实际 'Man' -> '" + base64Encode("Man") + "'");
console.log(
  "索引: 19=" +
    BASE64_ALPHABET[19] +
    ", 22=" +
    BASE64_ALPHABET[22] +
    ", 5=" +
    BASE64_ALPHABET[5] +
    ", 46=" +
    BASE64_ALPHABET[46],
);
