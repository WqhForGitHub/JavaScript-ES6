/**
 * 手写 HTML 实体解码
 *
 * 解码以下类型的 HTML 实体：
 * 1. 命名实体：&amp; &lt; &gt; &quot; &#39; &apos; &nbsp; &copy; 等
 * 2. 十进制数字实体：&#nnn;
 * 3. 十六进制数字实体：&#xhhh;（大小写不敏感）
 *
 * 解码流程：
 * - 扫描字符串，遇到 '&' 时尝试匹配实体
 * - 先匹配命名实体表，再匹配数字实体
 * - 超出 BMP 的码点转换为代理对
 */

/** 命名实体到字符的映射表 */
const NAMED_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": "\u00A0",
  "&copy;": "\u00A9",
  "&reg;": "\u00AE",
  "&trade;": "\u2122",
  "&hellip;": "\u2026",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
};

/**
 * 将十六进制字符转换为数值
 * @param {string} c - 十六进制字符
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
 * 将十进制字符转换为数值
 * @param {string} c - 十进制字符
 * @returns {number} 0-9，无效返回 -1
 */
function decValue(c) {
  const code = c.charCodeAt(0);
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  return -1;
}

/**
 * HTML 实体解码
 * @param {string} str - 包含 HTML 实体的字符串
 * @returns {string} 解码后的字符串
 */
function htmlDecode(str) {
  let result = "";
  let i = 0;
  while (i < str.length) {
    if (str[i] === "&") {
      let matched = false;
      // 查找 ';' 以确定实体边界
      const entityEnd = str.indexOf(";", i);
      if (entityEnd !== -1 && entityEnd - i < 12) {
        const entity = str.substring(i, entityEnd + 1);
        // 尝试命名实体
        if (NAMED_ENTITIES[entity]) {
          result += NAMED_ENTITIES[entity];
          i = entityEnd + 1;
          matched = true;
        } else if (entity[1] === "#") {
          // 数字实体
          let code = -1;
          if (entity[2] === "x" || entity[2] === "X") {
            // 十六进制: &#xHH;
            code = 0;
            let valid = true;
            for (let k = 3; k < entity.length - 1; k++) {
              const v = hexValue(entity[k]);
              if (v < 0) {
                valid = false;
                break;
              }
              code = code * 16 + v;
            }
            if (!valid) code = -1;
          } else {
            // 十进制: &#nnn;
            code = 0;
            let valid = true;
            for (let k = 2; k < entity.length - 1; k++) {
              const v = decValue(entity[k]);
              if (v < 0) {
                valid = false;
                break;
              }
              code = code * 10 + v;
            }
            if (!valid) code = -1;
          }
          if (code >= 0) {
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
            i = entityEnd + 1;
            matched = true;
          }
        }
      }
      // 无法匹配任何实体，按字面 '&' 处理
      if (!matched) {
        result += str[i];
        i++;
      }
    } else {
      result += str[i];
      i++;
    }
  }
  return result;
}

// ===================== 测试用例 =====================
console.log("===== HTML 实体解码 测试 =====");

const testCases = [
  "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
  "Tom &amp; Jerry",
  "it&#39;s a test",
  "a &lt; b &gt; c",
  "&#20013;&#25991; &lt; &#27979;&#35797; &gt;",
  "&#x4E2D;&#x6587; &#x6D4B;&#x8BD5;",
  "&copy; 2024 &trade;",
  "5 &lt; 10 &amp;&amp; 10 &gt; 5",
  "a&nbsp;&nbsp;b",
  "&#x1F389; &#x6E05;&#x5355;",
];

for (const tc of testCases) {
  const decoded = htmlDecode(tc);
  console.log(`编码: ${tc}`);
  console.log(`解码: ${decoded}`);
  console.log("---");
}

// 往返测试
console.log("===== 往返测试 =====");

/**
 * 内联 HTML 编码函数（用于往返验证，与 htmlEncode.js 逻辑一致）
 * @param {string} str
 * @returns {string}
 */
function htmlEncodeRoundTrip(str) {
  let r = "";
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    const ch = code < 0x10000 ? String.fromCharCode(code) : "";
    if (ch === "&") {
      r += "&amp;";
      continue;
    }
    if (ch === "<") {
      r += "&lt;";
      continue;
    }
    if (ch === ">") {
      r += "&gt;";
      continue;
    }
    if (ch === '"') {
      r += "&quot;";
      continue;
    }
    if (ch === "'") {
      r += "&#39;";
      continue;
    }
    if (code >= 0x20 && code <= 0x7e) {
      r += String.fromCharCode(code);
    } else {
      r += "&#x" + code.toString(16).toUpperCase() + ";";
    }
  }
  return r;
}

const originals = [
  '<script>alert("XSS")</script>',
  "it's a test",
  "Tom & Jerry",
  "中文 < 测试 >",
  "🎉 emoji",
];
for (const orig of originals) {
  const encoded = htmlEncodeRoundTrip(orig);
  const decoded = htmlDecode(encoded);
  console.log(
    `"${orig}" -> "${encoded}" -> "${decoded}" | 一致: ${decoded === orig}`,
  );
}
