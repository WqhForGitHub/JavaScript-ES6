/**
 * 手写 HTML 实体编码
 *
 * 将特殊字符转换为 HTML 实体，防止 XSS 攻击：
 * &  -> &amp;
 * <  -> &lt;
 * >  -> &gt;
 * "  -> &quot;
 * '  -> &#39;
 *
 * 支持两种编码模式：
 * 1. 命名实体模式：仅编码上述 5 个特殊字符
 * 2. 数字实体模式：将所有非 ASCII 可打印字符编码为 &#xHH; 形式（十六进制）
 *
 * 防止 XSS 的核心：在将用户输入插入 HTML 上下文前，先对特殊字符进行转义。
 */

/** 命名实体映射表 */
const NAMED_ENTITY_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * HTML 实体编码（命名实体模式）
 * 仅编码 5 个最常见字符：& < > " '
 * @param {string} str - 要编码的字符串
 * @returns {string} 编码后的字符串
 */
function htmlEncodeNamed(str) {
  return str.replace(/[&<>"']/g, (ch) => NAMED_ENTITY_MAP[ch]);
}

/**
 * HTML 实体编码（数字实体模式，十六进制）
 * 将所有非 ASCII 可打印字符及特殊字符编码为 &#xHH; 形式，
 * 但对 & < > " ' 五个特殊字符优先使用命名实体
 * @param {string} str - 要编码的字符串
 * @param {boolean} [encodeSpecial=true] - 是否对 & < > " ' 使用命名实体编码
 * @returns {string} 编码后的字符串
 */
function htmlEncodeNumeric(str, encodeSpecial = true) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    // 处理代理对（用于 4 字节 UTF-16 字符，如部分 emoji）
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    // 特殊字符优先使用命名实体
    if (encodeSpecial && code < 0x10000) {
      const ch = String.fromCharCode(code);
      if (ch === "&") {
        result += "&amp;";
        continue;
      }
      if (ch === "<") {
        result += "&lt;";
        continue;
      }
      if (ch === ">") {
        result += "&gt;";
        continue;
      }
      if (ch === '"') {
        result += "&quot;";
        continue;
      }
      if (ch === "'") {
        result += "&#39;";
        continue;
      }
    }
    // ASCII 可打印字符（32-126）保留原样，其他用十六进制数字实体
    if (code >= 0x20 && code <= 0x7e) {
      result += String.fromCharCode(code);
    } else {
      result += "&#x" + code.toString(16).toUpperCase() + ";";
    }
  }
  return result;
}

/**
 * 完整 HTML 实体编码
 * 对特殊字符使用命名实体，对非 ASCII 字符使用十六进制数字实体
 * @param {string} str - 要编码的字符串
 * @returns {string} 编码后的字符串
 */
function htmlEncode(str) {
  return htmlEncodeNumeric(str, true);
}

// ===================== 测试用例 =====================
console.log("===== HTML 实体编码 测试 =====");

const testCases = [
  '<script>alert("XSS")</script>',
  "it's a test",
  "Tom & Jerry",
  "a < b > c",
  "中文 < 测试 >",
  '"quoted" text',
  "<img src=x onerror=alert(1)>",
  "5 < 10 && 10 > 5",
  "🎉 庆祝 emoji",
  '<a href="javascript:alert(1)">click</a>',
];

for (const tc of testCases) {
  const named = htmlEncodeNamed(tc);
  const numeric = htmlEncodeNumeric(tc, false);
  const full = htmlEncode(tc);
  console.log(`原文: ${tc}`);
  console.log(`命名编码: ${named}`);
  console.log(`数字编码: ${numeric}`);
  console.log(`完整编码: ${full}`);
  console.log("---");
}
