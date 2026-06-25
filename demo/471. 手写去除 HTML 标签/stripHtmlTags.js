/**
 * 手写去除 HTML 标签
 *
 * 功能：从字符串中移除所有 HTML 标签，返回纯文本内容
 * 实现思路：
 *   1. 使用正则 /<[^>]+>/g 匹配所有形如 <xxx> 的标签并替换为空字符串
 *   2. 额外处理 HTML 实体（如 &nbsp; &amp; &lt; &gt; &quot;）转为可读字符
 *   3. 处理 <script>/<style> 等标签内部的文本，避免脚本/样式内容泄漏到纯文本
 *   4. 合并多余空白，保证输出整洁
 */

/**
 * 去除字符串中的 HTML 标签
 * @param {string} html 含 HTML 标签的字符串
 * @returns {string} 纯文本
 */
function stripHtmlTags(html) {
  if (typeof html !== "string") return "";

  let text = html;

  // 1. 先移除 script / style 标签及其内部内容（防止脚本/样式代码混入文本）
  text = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 2. 将 <br> 标签替换为换行，保留一定的排版信息
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 3. 去除所有 HTML 标签
  text = text.replace(/<[^>]+>/g, "");

  // 4. 解码常见的 HTML 实体
  const entities = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  };
  text = text.replace(
    /&(nbsp|amp|lt|gt|quot|#39|apos);/g,
    (m) => entities[m] || m,
  );

  // 5. 合并连续空白为单个空格，去除首尾空白
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

// ===== 测试用例 =====
console.log("=== 去除 HTML 标签 ===");

// 1. 基本标签去除
console.log(stripHtmlTags("<p>Hello World</p>"));
// 期望输出: Hello World

// 2. 嵌套标签
console.log(
  stripHtmlTags("<div><h1>Title</h1><p>Content <b>bold</b></p></div>"),
);
// 期望输出: Title Content bold

// 3. 含 script 标签（应被完全移除）
console.log(stripHtmlTags("<p>text</p><script>alert(1)</script>"));
// 期望输出: text

// 4. 含 style 标签
console.log(stripHtmlTags("<style>.a{color:red}</style><p>styled</p>"));
// 期望输出: styled

// 5. 含 HTML 实体
console.log(stripHtmlTags("<p>Tom &amp; Jerry &lt;3 &nbsp; end</p>"));
// 期望输出: Tom & Jerry <3 end

// 6. 含 <br> 换行
console.log(stripHtmlTags("line1<br>line2<br/>line3"));
// 期望输出:
// line1
// line2
// line3

// 7. 自闭合标签
console.log(stripHtmlTags('a<img src="x.png" />b<br>c'));
// 期望输出: ab c

// 8. 空字符串与非字符串
console.log(stripHtmlTags(""));
// 期望输出: (空字符串)
console.log(stripHtmlTags(null));
// 期望输出: (空字符串)
