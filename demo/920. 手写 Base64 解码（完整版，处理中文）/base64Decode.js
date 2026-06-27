/**
 * 手写 Base64 解码（完整版，处理中文）
 *
 * Base64 解码原理（编码的逆过程）：
 * 1. 把每个 Base64 字符通过字母表反查得到 6 位值。
 * 2. 每 4 个字符（24 位）还原成 3 个字节。
 * 3. 处理末尾填充：
 *    - "xx==" 表示原始剩 1 字节：取前 2 个字符的 12 位中的高 8 位。
 *    - "xxx=" 表示原始剩 2 字节：取前 3 个字符的 18 位中的高 16 位。
 * 4. 把还原出的字节按 UTF-8 解码为字符串（支持中文/emoji）。
 *
 * 不使用 atob（atob 只能产出 Latin1，中文会乱码）。
 */

/**
 * 标准 Base64 字母表。
 * @type {string}
 */
const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * 构建字符 -> 6 位值的反查表。
 * @type {Object<string, number>}
 */
const BASE64_LOOKUP = (() => {
  const map = {};
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    map[BASE64_ALPHABET[i]] = i;
  }
  return map;
})();

/**
 * 手写 UTF-8 解码：把字节数组转回字符串（处理代理对）。
 * @param {number[]} bytes - 0-255 字节列表。
 * @returns {string}
 */
function utf8Decode(bytes) {
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    let codePoint;
    let byteLen;
    if ((b0 & 0x80) === 0x00) {
      codePoint = b0 & 0x7f;
      byteLen = 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      byteLen = 2;
      codePoint = ((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
    } else if ((b0 & 0xf0) === 0xe0) {
      byteLen = 3;
      codePoint =
        ((b0 & 0x0f) << 12) |
        ((bytes[i + 1] & 0x3f) << 6) |
        (bytes[i + 2] & 0x3f);
    } else {
      byteLen = 4;
      codePoint =
        ((b0 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
    }
    if (codePoint <= 0xffff) {
      result += String.fromCharCode(codePoint);
    } else {
      // 拆代理对
      const adjusted = codePoint - 0x10000;
      const high = 0xd800 + (adjusted >> 10);
      const low = 0xdc00 + (adjusted & 0x3ff);
      result += String.fromCharCode(high, low);
    }
    i += byteLen;
  }
  return result;
}

/**
 * 手写 UTF-8 编码：字符串转字节（用于往返测试）。
 * @param {string} str
 * @returns {number[]}
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
 * Base64 编码（用于往返测试，内联实现）。
 * @param {string} str
 * @returns {string}
 */
function base64Encode(str) {
  const bytes = utf8Encode(str);
  let result = "";
  let i = 0;
  for (; i + 3 <= bytes.length; i += 3) {
    const t = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += BASE64_ALPHABET[(t >> 18) & 0x3f];
    result += BASE64_ALPHABET[(t >> 12) & 0x3f];
    result += BASE64_ALPHABET[(t >> 6) & 0x3f];
    result += BASE64_ALPHABET[t & 0x3f];
  }
  const remain = bytes.length - i;
  if (remain === 1) {
    const t = bytes[i] << 16;
    result += BASE64_ALPHABET[(t >> 18) & 0x3f];
    result += BASE64_ALPHABET[(t >> 12) & 0x3f];
    result += "==";
  } else if (remain === 2) {
    const t = (bytes[i] << 16) | (bytes[i + 1] << 8);
    result += BASE64_ALPHABET[(t >> 18) & 0x3f];
    result += BASE64_ALPHABET[(t >> 12) & 0x3f];
    result += BASE64_ALPHABET[(t >> 6) & 0x3f];
    result += "=";
  }
  return result;
}

/**
 * 把 Base64 字符串解码为字节数组。
 * @param {string} b64 - Base64 字符串。
 * @returns {number[]} 字节数组。
 * @throws {Error} 遇到非法字符或非法长度时抛出。
 */
function base64DecodeToBytes(b64) {
  // 去除空白字符
  const cleaned = b64.replace(/\s/g, "");
  if (cleaned.length % 4 !== 0) {
    throw new Error(`Base64 长度非法（必须为 4 的倍数）: ${cleaned.length}`);
  }

  const bytes = [];
  const len = cleaned.length;

  for (let i = 0; i < len; i += 4) {
    const c1 = cleaned[i];
    const c2 = cleaned[i + 1];
    const c3 = cleaned[i + 2];
    const c4 = cleaned[i + 3];

    const v1 = BASE64_LOOKUP[c1];
    const v2 = BASE64_LOOKUP[c2];
    if (v1 === undefined || v2 === undefined) {
      throw new Error(`非法 Base64 字符: '${c1}' 或 '${c2}'`);
    }

    // 24 位
    const triple = (v1 << 18) | (v2 << 12);

    if (c3 === "=") {
      // 末尾 2 字符 + 2 个 '=' -> 1 字节
      if (c4 !== "=") throw new Error("填充非法：缺少第二个 =");
      bytes.push((triple >> 16) & 0xff);
    } else if (c4 === "=") {
      // 末尾 3 字符 + 1 个 '=' -> 2 字节
      const v3 = BASE64_LOOKUP[c3];
      if (v3 === undefined) throw new Error(`非法 Base64 字符: '${c3}'`);
      const t = triple | (v3 << 6);
      bytes.push((t >> 16) & 0xff);
      bytes.push((t >> 8) & 0xff);
    } else {
      // 4 字符 -> 3 字节
      const v3 = BASE64_LOOKUP[c3];
      const v4 = BASE64_LOOKUP[c4];
      if (v3 === undefined) throw new Error(`非法 Base64 字符: '${c3}'`);
      if (v4 === undefined) throw new Error(`非法 Base64 字符: '${c4}'`);
      const t = triple | (v3 << 6) | v4;
      bytes.push((t >> 16) & 0xff);
      bytes.push((t >> 8) & 0xff);
      bytes.push(t & 0xff);
    }
  }
  return bytes;
}

/**
 * 把 Base64 字符串解码为字符串（自动 UTF-8 解码，支持中文）。
 * @param {string} b64 - Base64 字符串。
 * @returns {string} 原始字符串。
 */
function base64Decode(b64) {
  const bytes = base64DecodeToBytes(b64);
  return utf8Decode(bytes);
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：解码 ASCII =====");
console.log(
  "base64Decode('SGVsbG8=') =",
  base64Decode("SGVsbG8="),
  "(期望 'Hello')",
);
console.log("base64Decode('TWFu')     =", base64Decode("TWFu"), "(期望 'Man')");
console.log("base64Decode('TWE=')     =", base64Decode("TWE="), "(期望 'Ma')");
console.log("base64Decode('TQ==')     =", base64Decode("TQ=="), "(期望 'M')");

console.log("\n===== 测试 2：解码中文 =====");
console.log(
  "base64Decode('5L2g5aW9')    =",
  base64Decode("5L2g5aW9"),
  "(期望 '你好')",
);
console.log(
  "base64Decode('5Lit5paH5rWL6K+V') =",
  base64Decode("5Lit5paH5rWL6K+V"),
  "(期望 '中文测试')",
);

console.log("\n===== 测试 3：解码 emoji =====");
console.log(
  "base64Decode('8J+YgA==') =",
  base64Decode("8J+YgA=="),
  "(期望 '😀')",
);

console.log("\n===== 测试 4：往返测试（encode -> decode） =====");
const cases = [
  "Hello",
  "Man",
  "你好",
  "中文测试",
  "😀😁",
  "Hello 世界！",
  "𝄞音乐ABC",
  "",
];
let allPass = true;
for (const c of cases) {
  const encoded = base64Encode(c);
  const decoded = base64Decode(encoded);
  const pass = decoded === c;
  if (!pass) allPass = false;
  console.log(
    `'${c}' -> ${encoded} -> '${decoded}' | ${pass ? "PASS" : "FAIL"}`,
  );
}
console.log(allPass ? "\n往返测试全部通过！" : "\n存在失败！");

console.log("\n===== 测试 5：与原生 atob 对比（Latin1） =====");
if (typeof atob !== "undefined") {
  const latinCases = ["SGVsbG8=", "TWFu", "TWE=", "TQ==", "YWJj"];
  let pass = true;
  for (const c of latinCases) {
    const mine = base64Decode(c);
    const native = atob(c);
    const ok = mine === native;
    if (!ok) pass = false;
    console.log(
      `'${c}' -> 我的: '${mine}' | 原生: '${native}' | ${ok ? "PASS" : "FAIL"}`,
    );
  }
  console.log(pass ? "\nLatin1 全部一致！" : "\n存在不一致！");
} else {
  console.log("当前环境无 atob，跳过对比。");
}

console.log("\n===== 测试 6：与原生 Buffer 对比（中文） =====");
if (typeof Buffer !== "undefined") {
  const cnCases = [
    "5L2g5aW9",
    "5Lit5paH5rWL6K+V",
    "8J+YgA==",
    "SGVsbG8g5LiW55WM77yB",
  ];
  let pass = true;
  for (const c of cnCases) {
    const mine = base64Decode(c);
    const native = Buffer.from(c, "base64").toString("utf-8");
    const ok = mine === native;
    if (!ok) pass = false;
    console.log(
      `'${c}' -> 我的: '${mine}' | 原生: '${native}' | ${ok ? "PASS" : "FAIL"}`,
    );
  }
  console.log(pass ? "\n中文解码全部与 Buffer 一致！" : "\n存在不一致！");
} else {
  console.log("当前环境无 Buffer，跳过对比。");
}

console.log("\n===== 测试 7：非法输入抛错 =====");
try {
  base64Decode("SGVsbG8"); // 长度非 4 的倍数
} catch (e) {
  console.log("长度非法:", e.message);
}
try {
  base64Decode("SGVs*bG="); // 8 字符但含非法字符 '*'
} catch (e) {
  console.log("非法字符:", e.message);
}

console.log("\n===== 测试 8：含空白字符的输入 =====");
console.log(
  "base64Decode('SGVs\\nbG8=') =",
  JSON.stringify(base64Decode("SGVs\nbG8=")),
  "(期望 'Hello')",
);
console.log(
  "base64Decode(' 5L2g5aW9 ') =",
  base64Decode(" 5L2g5aW9 "),
  "(期望 '你好')",
);

console.log("\n===== 测试 9：解码细节演示（'TWFu' -> 'Man'） =====");
// T=19, W=22, F=5, u=46
// 19<<18 | 22<<12 | 5<<6 | 46
// = 010011 010110 000101 101110
// = 01001101 01100001 01101110
// = 0x4D 0x61 0x6E = 'M' 'a' 'n'
const bytes = base64DecodeToBytes("TWFu");
console.log(
  `'TWFu' -> 字节 [${bytes.map((b) => "0x" + b.toString(16).toUpperCase())}] -> '${utf8Decode(bytes)}'`,
);
