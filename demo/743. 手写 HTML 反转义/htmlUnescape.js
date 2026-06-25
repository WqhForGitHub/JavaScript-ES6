/**
 * 手写 HTML 反转义
 *
 * 功能：将 HTML 实体还原为原始字符
 *       常用于从 HTML 文本中提取纯文本内容
 *
 * 实现思路：
 *   1. 维护实体 -> 字符的反向映射表
 *   2. 处理命名实体（&lt; &gt; &amp; ...）与十进制/十六进制实体（&#39; &#x27;）
 *   3. 注意 &amp; 必须最后还原，避免错误解码嵌套实体
 */

const NAMED_ENTITIES = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&copy;": "\u00A9",
  "&reg;": "\u00AE",
  "&trade;": "\u2122",
  "&hellip;": "\u2026",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
};

// 反转义函数
function htmlUnescape(str) {
  if (str == null) return "";
  let text = String(str);

  // 1. 先还原十进制实体 &#DD;
  text = text.replace(/&#(\d+);/g, (_, dec) =>
    safeFromCodePoint(parseInt(dec, 10)),
  );
  // 2. 还原十六进制实体 &#xHH;
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    safeFromCodePoint(parseInt(hex, 16)),
  );
  // 3. 还原命名实体
  text = text.replace(/&[a-zA-Z]+;/g, (entity) =>
    Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, entity)
      ? NAMED_ENTITIES[entity]
      : entity,
  );
  // 4. 最后还原 &amp; -> &，避免破坏其他实体
  text = text.replace(/&amp;/g, "&");

  return text;
}

// 安全的码点转换，避免无效码点抛错
function safeFromCodePoint(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch (e) {
    return "";
  }
}

// ===== 测试 =====
console.log("=== 手写 HTML 反转义 ===");

console.log(htmlUnescape("&lt;div&gt;Tom &amp; Jerry&lt;/div&gt;"));
// 预期: <div>Tom & Jerry</div>

console.log(htmlUnescape("it&#39;s a &#96;test&#96;"));
// 预期: it's a `test`

console.log(htmlUnescape("&#x4e2d;&#x6587;"));
// 预期: 中文

console.log(htmlUnescape("A&nbsp;B&nbsp;&copy;"));
// 预期: A B ©

console.log(htmlUnescape("&unknown;")); // 预期: &unknown; (未知实体保留)
console.log(htmlUnescape(null)); // 预期: (空字符串)

// 本地内联的转义函数（与 742 题同思路，避免跨文件 require 路径问题）
function escapeDemo(s) {
  return String(s).replace(
    /[&<>"'`]/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;",
      })[ch],
  );
}

// 双向一致：先 escape 再 unescape 应得到原文
const original = '<a href="x">Tom & Jerry</a>';
const roundTrip = htmlUnescape(escapeDemo(original));
console.log("round-trip ok:", original === roundTrip);
// 预期: round-trip ok: true
