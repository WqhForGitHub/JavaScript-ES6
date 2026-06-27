/**
 * 手写 Unicode 码点与字符串互转
 *
 * 涉及的核心 API：
 * 1. String.prototype.codePointAt(pos) - 返回指定位置的码点（自动处理代理对）。
 * 2. String.fromCodePoint(...codePoints) - 把码点列表转成字符串（>0xFFFF 的码点转成代理对）。
 *
 * 背景知识：
 * - JavaScript 字符串以 UTF-16 编码存储，每个 code unit 占 16 位。
 * - BMP（基本多语言平面，U+0000~U+FFFF）内的字符占 1 个 code unit。
 * - 辅助平面（U+10000~U+10FFFF）的字符用"代理对"表示：2 个 code unit。
 *   - 高代理：0xD800~0xDBFF
 *   - 低代理：0xDC00~0xDFFF
 *   - 还原公式：codePoint = 0x10000 + (high - 0xD800) * 0x400 + (low - 0xDC00)
 *
 * 本文件从零实现 codePointAt 与 fromCodePoint，并提供字符串与码点数组的互转工具。
 */

/**
 * 手写 codePointAt：返回字符串指定位置（按 code unit 索引）的码点。
 * 如果该位置是高代理且下一个是低代理，组合返回完整码点；否则返回该 code unit。
 * @param {string} str - 输入字符串。
 * @param {number} pos - code unit 位置。
 * @returns {number|undefined} 码点；位置越界返回 undefined。
 */
function codePointAt(str, pos) {
  if (pos < 0 || pos >= str.length) return undefined;
  const first = str.charCodeAt(pos);
  // 不是高代理或后面没有低代理 -> 直接返回 code unit
  if (first < 0xd800 || first > 0xdbff || pos + 1 >= str.length) {
    return first;
  }
  const second = str.charCodeAt(pos + 1);
  if (second < 0xdc00 || second > 0xdfff) {
    return first;
  }
  // 组合代理对
  return 0x10000 + (first - 0xd800) * 0x400 + (second - 0xdc00);
}

/**
 * 手写 fromCodePoint：把一组码点转成字符串。
 * 码点 > 0xFFFF 的会被拆成代理对。
 * @param {...number} codePoints - 一个或多个码点。
 * @returns {string} 组成的字符串。
 * @throws {RangeError} 码点超出合法范围 [0, 0x10FFFF]。
 */
function fromCodePoint(...codePoints) {
  const result = [];
  for (const cp of codePoints) {
    if (typeof cp !== "number" || !Number.isInteger(cp)) {
      throw new RangeError(`非法码点: ${cp}`);
    }
    if (cp < 0 || cp > 0x10ffff) {
      throw new RangeError(`码点超出范围: U+${cp.toString(16).toUpperCase()}`);
    }
    if (cp <= 0xffff) {
      // BMP 内直接放入
      result.push(String.fromCharCode(cp));
    } else {
      // 辅助平面：拆代理对
      const adjusted = cp - 0x10000;
      const high = 0xd800 + (adjusted >> 10);
      const low = 0xdc00 + (adjusted & 0x3ff);
      result.push(String.fromCharCode(high, low));
    }
  }
  return result.join("");
}

/**
 * 把字符串转换为码点数组（按字符而非 code unit 遍历）。
 * @param {string} str
 * @returns {number[]} 码点数组。
 */
function stringToCodePoints(str) {
  const cps = [];
  for (let i = 0; i < str.length;) {
    const cp = codePointAt(str, i);
    cps.push(cp);
    // 辅助平面字符占 2 个 code unit，否则占 1 个
    i += cp > 0xffff ? 2 : 1;
  }
  return cps;
}

/**
 * 把码点数组转换回字符串。
 * @param {number[]} codePoints
 * @returns {string}
 */
function codePointsToString(codePoints) {
  return fromCodePoint(...codePoints);
}

/**
 * 把码点格式化为 "U+XXXX" 形式。
 * @param {number} cp
 * @returns {string}
 */
function formatCodePoint(cp) {
  const hex = cp.toString(16).toUpperCase().padStart(4, "0");
  return `U+${hex}`;
}

/**
 * 判断一个码点是否在辅助平面（需要代理对）。
 * @param {number} cp
 * @returns {boolean}
 */
function isAstral(cp) {
  return cp > 0xffff;
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：BMP 字符的 codePointAt =====");
console.log("'A'.codePointAt(0) =", codePointAt("A", 0), "(期望 65)");
console.log("'中'.codePointAt(0) =", codePointAt("中", 0), "(期望 20013)");
console.log("'€'.codePointAt(0) =", codePointAt("€", 0), "(期望 8364)");

console.log("\n===== 测试 2：辅助平面字符（emoji，代理对） =====");
const emoji = "😀";
console.log(`'${emoji}'.length =`, emoji.length, "(期望 2，因为是代理对)");
console.log(
  `'${emoji}'.codePointAt(0) =`,
  codePointAt(emoji, 0),
  "(期望 128512 = U+1F600)",
);
console.log(`原生对比: '${emoji}'.codePointAt(0) =`, emoji.codePointAt(0));

console.log("\n===== 测试 3：fromCodePoint 构造字符串 =====");
console.log(
  "fromCodePoint(65, 66, 67) =",
  fromCodePoint(65, 66, 67),
  "(期望 'ABC')",
);
console.log(
  "fromCodePoint(20013, 25991) =",
  fromCodePoint(20013, 25991),
  "(期望 '中文')",
);
console.log("fromCodePoint(128512) =", fromCodePoint(128512), "(期望 '😀')");
console.log(
  "原生对比: String.fromCodePoint(128512) =",
  String.fromCodePoint(128512),
);

console.log("\n===== 测试 4：字符串 <-> 码点数组互转 =====");
const str = "Hello 世界 😀";
const cps = stringToCodePoints(str);
console.log(`字符串: '${str}'`);
console.log("码点数组:", cps.map(formatCodePoint).join(" "));
const back = codePointsToString(cps);
console.log(`转回字符串: '${back}'`);
console.log(`往返一致: ${str === back ? "YES" : "NO"}`);

console.log("\n===== 测试 5：与原生 API 对比 =====");
const samples = ["a", "中", "€", "😀", "𝄞", "A😀B中"];
let allPass = true;
for (const s of samples) {
  const mine = stringToCodePoints(s);
  const native = [];
  for (let i = 0; i < s.length;) {
    const cp = s.codePointAt(i);
    native.push(cp);
    i += cp > 0xffff ? 2 : 1;
  }
  const pass = JSON.stringify(mine) === JSON.stringify(native);
  if (!pass) allPass = false;
  console.log(
    `'${s}' -> 我的: [${mine.map(formatCodePoint).join(",")}] | 原生: [${native.map(formatCodePoint).join(",")}] | ${pass ? "PASS" : "FAIL"}`,
  );
}
console.log(allPass ? "\n全部与原生一致！" : "\n存在不一致！");

console.log("\n===== 测试 6：fromCodePoint 作为 polyfill 演示 =====");
// 模拟在不支持 String.fromCodePoint 的环境下的 polyfill
if (!String.fromCodePointPolyfill) {
  String.fromCodePointPolyfill = function (...args) {
    return fromCodePoint(...args);
  };
}
console.log("polyfill(0x1F600) =", String.fromCodePointPolyfill(0x1f600));
console.log(
  "polyfill(0x4E2D, 0x6587) =",
  String.fromCodePointPolyfill(0x4e2d, 0x6587),
);

console.log("\n===== 测试 7：越界码点抛错 =====");
try {
  fromCodePoint(0x110000);
} catch (e) {
  console.log("捕获:", e.message);
}
try {
  fromCodePoint(-1);
} catch (e) {
  console.log("捕获:", e.message);
}

console.log("\n===== 测试 8：代理对的逐 code unit 视角 =====");
// 展示同一个 emoji 在 code unit 视角和 code point 视角下的差异
const star = "🌟"; // U+1F31F
console.log(`'${star}' 的 code units:`);
console.log(
  `  charCodeAt(0) = 0x${star.charCodeAt(0).toString(16).toUpperCase()} (高代理)`,
);
console.log(
  `  charCodeAt(1) = 0x${star.charCodeAt(1).toString(16).toUpperCase()} (低代理)`,
);
console.log(`  codePointAt(0) = ${formatCodePoint(codePointAt(star, 0))}`);
console.log(`  isAstral = ${isAstral(codePointAt(star, 0))}`);
