/**
 * 手写 UTF-8 解码（字节序列 -> Unicode 字符串）
 *
 * 解码规则：根据首字节的前导 1 的个数判断该字符占几个字节：
 *   0xxxxxxx                       -> 1 字节
 *   110xxxxx                       -> 2 字节
 *   1110xxxx                       -> 3 字节
 *   11110xxx                       -> 4 字节
 * 后续字节必须以 10xxxxxx 开头（即 0x80 ~ 0xBF）。
 *
 * 把还原出的码点转回 UTF-16：
 *   - 码点 <= 0xFFFF：直接用 String.fromCharCode。
 *   - 码点 > 0xFFFF：拆成代理对（高代理 + 低代理）。
 *
 * 本实现不使用 TextDecoder，纯手工完成解码，并做合法性校验。
 */

/**
 * 判断一个字节是否为合法的 UTF-8 后续字节（10xxxxxx）。
 * @param {number} b
 * @returns {boolean}
 */
function isContinuationByte(b) {
  return (b & 0xc0) === 0x80;
}

/**
 * 把一个码点转成 UTF-16 字符串。
 * 码点 > 0xFFFF 时拆成代理对。
 * @param {number} codePoint
 * @returns {string}
 */
function fromCodePointUtf16(codePoint) {
  if (codePoint <= 0xffff) {
    return String.fromCharCode(codePoint);
  }
  // 拆代理对
  const adjusted = codePoint - 0x10000;
  const high = 0xd800 + (adjusted >> 10); // 高代理
  const low = 0xdc00 + (adjusted & 0x3ff); // 低代理
  return String.fromCharCode(high, low);
}

/**
 * 把 UTF-8 字节数组解码为 JavaScript 字符串。
 * @param {number[]|Uint8Array} bytes - UTF-8 字节序列。
 * @returns {string} 解码后的字符串。
 * @throws {Error} 遇到非法 UTF-8 序列时抛出。
 */
function utf8Decode(bytes) {
  let result = "";
  let i = 0;

  while (i < bytes.length) {
    const b0 = bytes[i];

    let codePoint;
    let byteLen;

    if ((b0 & 0x80) === 0x00) {
      // 1 字节：0xxxxxxx
      codePoint = b0 & 0x7f;
      byteLen = 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      // 2 字节：110xxxxx 10xxxxxx
      byteLen = 2;
      if (i + 1 >= bytes.length || !isContinuationByte(bytes[i + 1])) {
        throw new Error(`位置 ${i}: 2 字节序列不完整或后续字节非法`);
      }
      codePoint = ((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
      // 检查最短形式：2 字节编码的码点必须 >= 0x80
      if (codePoint < 0x80) {
        throw new Error(`位置 ${i}: 非最短编码（应使用 1 字节）`);
      }
    } else if ((b0 & 0xf0) === 0xe0) {
      // 3 字节：1110xxxx 10xxxxxx 10xxxxxx
      byteLen = 3;
      if (
        i + 2 >= bytes.length ||
        !isContinuationByte(bytes[i + 1]) ||
        !isContinuationByte(bytes[i + 2])
      ) {
        throw new Error(`位置 ${i}: 3 字节序列不完整或后续字节非法`);
      }
      codePoint =
        ((b0 & 0x0f) << 12) |
        ((bytes[i + 1] & 0x3f) << 6) |
        (bytes[i + 2] & 0x3f);
      // 最短形式校验：3 字节码点必须 >= 0x800
      if (codePoint < 0x800) {
        throw new Error(`位置 ${i}: 非最短编码（应使用更少字节）`);
      }
      // 代理区间不允许出现在 UTF-8 中
      if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
        throw new Error(`位置 ${i}: 码点位于代理区间，非法 UTF-8`);
      }
    } else if ((b0 & 0xf8) === 0xf0) {
      // 4 字节：11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      byteLen = 4;
      if (
        i + 3 >= bytes.length ||
        !isContinuationByte(bytes[i + 1]) ||
        !isContinuationByte(bytes[i + 2]) ||
        !isContinuationByte(bytes[i + 3])
      ) {
        throw new Error(`位置 ${i}: 4 字节序列不完整或后续字节非法`);
      }
      codePoint =
        ((b0 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      // 最短形式 + 上界校验
      if (codePoint < 0x10000 || codePoint > 0x10ffff) {
        throw new Error(`位置 ${i}: 4 字节码点越界或非最短编码`);
      }
    } else {
      throw new Error(`位置 ${i}: 非法首字节 0x${b0.toString(16)}`);
    }

    result += fromCodePointUtf16(codePoint);
    i += byteLen;
  }

  return result;
}

/**
 * 把字节数组格式化为十六进制字符串。
 * @param {number[]} bytes
 * @returns {string}
 */
function bytesToHex(bytes) {
  return bytes
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

// 引入上一节的编码函数（内联实现，保证本文件可独立运行）
function utf8Encode(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    const isHigh = code >= 0xd800 && code <= 0xdbff;
    const isLow = code >= 0xdc00 && code <= 0xdfff;
    if (isHigh && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + (code - 0xd800) * 0x400 + (next - 0xdc00);
        i++;
      }
    }
    if (code <= 0x7f) result.push(code);
    else if (code <= 0x7ff)
      result.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code <= 0xffff) {
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

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：解码 ASCII =====");
const b1 = [0x48, 0x65, 0x6c, 0x6c, 0x6f];
console.log(`字节 ${bytesToHex(b1)} -> '${utf8Decode(b1)}'  (期望 'Hello')`);

console.log("\n===== 测试 2：解码中文（3 字节） =====");
const b2 = [0xe4, 0xbd, 0xa0, 0xe5, 0xa5, 0xbd];
console.log(`字节 ${bytesToHex(b2)} -> '${utf8Decode(b2)}'  (期望 '你好')`);

console.log("\n===== 测试 3：解码 Emoji（4 字节） =====");
const b3 = [0xf0, 0x9f, 0x98, 0x80];
console.log(`字节 ${bytesToHex(b3)} -> '${utf8Decode(b3)}'  (期望 '😀')`);

console.log("\n===== 测试 4：解码空字节 =====");
console.log(`'' -> '${utf8Decode([])}'  (期望 '')`);

console.log("\n===== 测试 5：往返测试（encode -> decode） =====");
const cases = ["Hello", "café", "你好世界", "😀😁😂", "A中😀z𝄞音乐"];
let allPass = true;
for (const c of cases) {
  const encoded = utf8Encode(c);
  const decoded = utf8Decode(encoded);
  const pass = decoded === c;
  if (!pass) allPass = false;
  console.log(
    `'${c}' -> ${bytesToHex(encoded)} -> '${decoded}' | ${pass ? "PASS" : "FAIL"}`,
  );
}
console.log(allPass ? "\n往返测试全部通过！" : "\n存在失败！");

console.log("\n===== 测试 6：与原生 TextDecoder 对比 =====");
if (typeof TextDecoder !== "undefined") {
  const decoder = new TextDecoder("utf-8");
  for (const c of cases) {
    const encoded = utf8Encode(c);
    const mine = utf8Decode(encoded);
    const native = decoder.decode(new Uint8Array(encoded));
    const pass = mine === native;
    console.log(
      `'${c}' -> 我的: '${mine}' | 原生: '${native}' | ${pass ? "PASS" : "FAIL"}`,
    );
  }
} else {
  console.log("当前环境无 TextDecoder，跳过对比。");
}

console.log("\n===== 测试 7：非法序列抛错 =====");
// 后续字节非法
try {
  utf8Decode([0xc3, 0x65]);
} catch (e) {
  console.log("非法后续字节:", e.message);
}
// 序列不完整
try {
  utf8Decode([0xe4, 0xbd]);
} catch (e) {
  console.log("序列不完整:", e.message);
}
// 非最短编码
try {
  utf8Decode([0xc0, 0x80]); // 用 2 字节编码 NUL
} catch (e) {
  console.log("非最短编码:", e.message);
}
// 代理区间
try {
  utf8Decode([0xed, 0xa0, 0x80]); // U+D800
} catch (e) {
  console.log("代理区间:", e.message);
}

console.log("\n===== 测试 8：完整混合字符串往返 =====");
const complex = "Hello 世界！🌍 2026";
const enc = utf8Encode(complex);
const dec = utf8Decode(enc);
console.log(`原文:   '${complex}'`);
console.log(`编码:   ${bytesToHex(enc)}`);
console.log(`解码:   '${dec}'`);
console.log(`一致:   ${complex === dec ? "YES" : "NO"}`);
