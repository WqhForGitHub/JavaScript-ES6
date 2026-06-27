/**
 * 手写 UTF-8 编码（从 Unicode 码点到字节序列）
 *
 * UTF-8 编码规则（RFC 3629）：
 * ┌─────────────────────┬──────────┬───────────────────────────────────────┐
 * │  Unicode 码点范围    │ 字节数   │  第 1 字节    后续字节                 │
 * ├─────────────────────┼──────────┼───────────────────────────────────────┤
 * │ U+0000  ~ U+007F    │   1      │ 0xxxxxxx                              │
 * │ U+0080  ~ U+07FF    │   2      │ 110xxxxx 10xxxxxx                     │
 * │ U+0800  ~ U+FFFF    │   3      │ 1110xxxx 10xxxxxx 10xxxxxx            │
 * │ U+10000 ~ U+10FFFF  │   4      │ 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx   │
 * └─────────────────────┴──────────┴───────────────────────────────────────┘
 *
 * 注意：JavaScript 字符串以 UTF-16 存储。
 * - BMP 内字符占 1 个 code unit。
 * - 辅助平面字符（U+10000 以上，如 emoji）用"代理对"表示：2 个 code unit。
 *   高代理范围 0xD800~0xDBFF，低代理范围 0xDC00~0xDFFF。
 *   解码代理对公式：
 *     codePoint = 0x10000 + (high - 0xD800) * 0x400 + (low - 0xDC00)
 *
 * 本实现不使用 TextEncoder，纯手工按位运算完成编码。
 */

/**
 * 判断一个 UTF-16 code unit 是否为高代理项。
 * @param {number} code - charCode。
 * @returns {boolean}
 */
function isHighSurrogate(code) {
  return code >= 0xd800 && code <= 0xdbff;
}

/**
 * 判断一个 UTF-16 code unit 是否为低代理项。
 * @param {number} code - charCode。
 * @returns {boolean}
 */
function isLowSurrogate(code) {
  return code >= 0xdc00 && code <= 0xdfff;
}

/**
 * 把单个 Unicode 码点编码为 UTF-8 字节数组。
 * @param {number} codePoint - Unicode 码点（0 ~ 0x10FFFF）。
 * @returns {number[]} UTF-8 字节数组。
 * @throws {Error} 码点超出合法范围。
 */
function encodeCodePoint(codePoint) {
  if (codePoint < 0 || codePoint > 0x10ffff) {
    throw new Error(`非法码点: U+${codePoint.toString(16).toUpperCase()}`);
  }
  // 处理代理对区间（不应作为单独码点出现）
  if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
    throw new Error(
      `码点处于代理区间，不能单独编码: U+${codePoint.toString(16).toUpperCase()}`,
    );
  }

  const bytes = [];

  if (codePoint <= 0x7f) {
    // 1 字节：0xxxxxxx
    bytes.push(codePoint);
  } else if (codePoint <= 0x7ff) {
    // 2 字节：110xxxxx 10xxxxxx
    bytes.push(0xc0 | (codePoint >> 6));
    bytes.push(0x80 | (codePoint & 0x3f));
  } else if (codePoint <= 0xffff) {
    // 3 字节：1110xxxx 10xxxxxx 10xxxxxx
    bytes.push(0xe0 | (codePoint >> 12));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
    bytes.push(0x80 | (codePoint & 0x3f));
  } else {
    // 4 字节：11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    bytes.push(0xf0 | (codePoint >> 18));
    bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
    bytes.push(0x80 | (codePoint & 0x3f));
  }

  return bytes;
}

/**
 * 把 JavaScript 字符串编码为 UTF-8 字节数组。
 * 会自动处理代理对（emoji 等）。
 * @param {string} str - 输入字符串。
 * @returns {number[]} UTF-8 字节数组（每个元素 0-255）。
 */
function utf8Encode(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (isHighSurrogate(code) && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (isLowSurrogate(next)) {
        // 组合代理对得到完整码点
        code = 0x10000 + (code - 0xd800) * 0x400 + (next - 0xdc00);
        i++; // 跳过低代理
      } else {
        // 孤立高代理：用替换字符 U+FFFD 代替
        code = 0xfffd;
      }
    } else if (isLowSurrogate(code)) {
      // 孤立低代理：用替换字符代替
      code = 0xfffd;
    }
    const bytes = encodeCodePoint(code);
    for (const b of bytes) result.push(b);
  }
  return result;
}

/**
 * 把字节数组格式化为十六进制字符串，便于查看。
 * @param {number[]} bytes
 * @returns {string}
 */
function bytesToHex(bytes) {
  return bytes
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：ASCII 字符（1 字节） =====");
const ascii = utf8Encode("Hello");
console.log(`'Hello' -> ${bytesToHex(ascii)}`);
console.log("期望:     48 65 6C 6C 6F");

console.log("\n===== 测试 2：含拉丁扩展字符（2 字节） =====");
const latin = utf8Encode("café");
console.log(`'café'   -> ${bytesToHex(latin)}`);
console.log("é(U+00E9) 应为 C3 A9");

console.log("\n===== 测试 3：中文字符（3 字节） =====");
const chinese = utf8Encode("你好");
console.log(`'你好'   -> ${bytesToHex(chinese)}`);
console.log("你(U+4F60) 应为 E4 BD A0");
console.log("好(U+597D) 应为 E5 A5 BD");

console.log("\n===== 测试 4：Emoji 表情（4 字节，代理对） =====");
const emoji = utf8Encode("😀");
console.log(`'😀'     -> ${bytesToHex(emoji)}`);
console.log("期望:     F0 9F 98 80  (U+1F600)");

console.log("\n===== 测试 5：混合字符串 =====");
const mixed = utf8Encode("A中😀z");
console.log(`'A中😀z' -> ${bytesToHex(mixed)}`);
console.log("分解:");
console.log("  A   -> 41");
console.log("  中  -> E4 B8 AD");
console.log("  😀  -> F0 9F 98 80");
console.log("  z   -> 7A");

console.log("\n===== 测试 6：空字符串 =====");
console.log("空字符串 ->", utf8Encode(""), "(期望 [])");

console.log("\n===== 测试 7：与原生 TextEncoder 对比验证 =====");
if (typeof TextEncoder !== "undefined") {
  const encoder = new TextEncoder();
  const cases = ["Hello", "café", "你好", "😀", "A中😀z", "𝄞音乐"];
  let allPass = true;
  for (const c of cases) {
    const mine = utf8Encode(c);
    const native = Array.from(encoder.encode(c));
    const pass = JSON.stringify(mine) === JSON.stringify(native);
    if (!pass) allPass = false;
    console.log(
      `'${c}' -> 我的: ${bytesToHex(mine)} | 原生: ${bytesToHex(native)} | ${pass ? "PASS" : "FAIL"}`,
    );
  }
  console.log(allPass ? "\n全部与原生 TextEncoder 一致！" : "\n存在不一致！");
} else {
  console.log("当前环境无 TextEncoder，跳过对比。");
}

console.log("\n===== 测试 8：非法码点抛错 =====");
try {
  encodeCodePoint(0x110000);
} catch (e) {
  console.log("捕获异常:", e.message);
}
