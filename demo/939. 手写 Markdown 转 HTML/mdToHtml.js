/**
 * 手写 Markdown 转 HTML
 *
 * 将 Markdown 文本转换为 HTML 字符串。
 *
 * 支持的 Markdown 语法：
 * - 标题: # ~ ######
 * - 粗体: **text**
 * - 斜体: *text*
 * - 链接: [text](url)
 * - 图片: ![alt](url)
 * - 代码块: ```
 * - 行内代码: `code`
 * - 无序列表: - item
 * - 有序列表: 1. item
 * - 引用: > text
 * - 水平线: ---
 * - 段落
 * - HTML 实体转义
 */

/**
 * HTML 特殊字符转义。
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 处理行内 Markdown 语法（粗体、斜体、链接、图片、行内代码）。
 * 注意处理顺序：先处理代码块（避免代码内容被二次处理），再处理其他。
 *
 * @param {string} text - 行内文本
 * @returns {string} HTML 字符串
 */
function processInline(text) {
  // 使用占位符保护行内代码内容，避免被其他规则处理
  const codeBlocks = [];
  let processed = text.replace(/`([^`]+)`/g, (_, code) => {
    const index = codeBlocks.length;
    codeBlocks.push("<code>" + escapeHTML(code) + "</code>");
    return "\x00CODE" + index + "\x00";
  });

  // 图片: ![alt](url)
  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2" />',
  );

  // 链接: [text](url)
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );

  // 粗体: **text**（先处理双星号，避免与单星号冲突）
  processed = processed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // 斜体: *text*
  processed = processed.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // 粗体替代语法: __text__
  processed = processed.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // 斜体替代语法: _text_
  processed = processed.replace(/_([^_]+)_/g, "<em>$1</em>");

  // 还原代码块占位符
  processed = processed.replace(/\x00CODE(\d+)\x00/g, (_, index) => {
    return codeBlocks[parseInt(index, 10)];
  });

  return processed;
}

/**
 * 将 Markdown 文本转换为 HTML。
 *
 * @param {string} markdown - Markdown 文本
 * @returns {string} HTML 字符串
 */
function markdownToHTML(markdown) {
  if (!markdown) return "";

  const lines = markdown.split("\n");
  const html = [];

  let i = 0;
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let inQuote = false;
  let quoteLines = [];

  /**
   * 关闭当前列表。
   */
  function closeList() {
    if (inList) {
      html.push("</" + listType + ">");
      inList = false;
      listType = null;
    }
  }

  /**
   * 关闭当前引用块。
   */
  function closeQuote() {
    if (inQuote) {
      const quoteContent = quoteLines
        .map((l) => l.replace(/^>\s?/, ""))
        .join("\n");
      html.push("<blockquote>" + processInline(quoteContent) + "</blockquote>");
      inQuote = false;
      quoteLines = [];
    }
  }

  while (i < lines.length) {
    let line = lines[i];

    // ---------- 代码块 ----------
    if (line.trim().startsWith("```")) {
      closeList();
      closeQuote();
      const lang = line.trim().substring(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结束的 ```
      const langAttr = lang ? ' class="language-' + lang + '"' : "";
      html.push(
        "<pre><code" +
          langAttr +
          ">" +
          escapeHTML(codeLines.join("\n")) +
          "</code></pre>",
      );
      continue;
    }

    // ---------- 水平线 ----------
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      closeList();
      closeQuote();
      html.push("<hr />");
      i++;
      continue;
    }

    // ---------- 标题 ----------
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      closeQuote();
      const level = headingMatch[1].length;
      const content = processInline(headingMatch[2].trim());
      html.push("<h" + level + ">" + content + "</h" + level + ">");
      i++;
      continue;
    }

    // ---------- 引用 ----------
    if (line.trim().startsWith(">")) {
      closeList();
      inQuote = true;
      quoteLines.push(line.trim());
      i++;
      continue;
    } else if (inQuote) {
      closeQuote();
    }

    // ---------- 无序列表 ----------
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        closeList();
        html.push("<ul>");
        inList = true;
        listType = "ul";
      }
      html.push("<li>" + processInline(ulMatch[1]) + "</li>");
      i++;
      continue;
    }

    // ---------- 有序列表 ----------
    const olMatch = line.match(/^[\s]*\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        html.push("<ol>");
        inList = true;
        listType = "ol";
      }
      html.push("<li>" + processInline(olMatch[1]) + "</li>");
      i++;
      continue;
    }

    // ---------- 空行 ----------
    if (line.trim() === "") {
      closeList();
      closeQuote();
      i++;
      continue;
    }

    // ---------- 段落 ----------
    closeList();
    closeQuote();
    const paragraphLines = [line];
    i++;
    // 收集连续的非空行作为段落
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^(#{1,6})\s/) &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].match(/^[\s]*[-*+]\s/) &&
      !lines[i].match(/^[\s]*\d+\.\s/) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    const paragraphContent = paragraphLines.join(" ").trim();
    html.push("<p>" + processInline(paragraphContent) + "</p>");
  }

  // 关闭未关闭的标签
  closeList();
  closeQuote();

  return html.join("\n");
}

// ===================== 测试用例 =====================

console.log("===== 标题 =====");
console.log(markdownToHTML("# Heading 1"));
console.log(markdownToHTML("## Heading 2"));
console.log(markdownToHTML("### Heading 3"));
console.log(markdownToHTML("###### Heading 6"));

console.log("\n===== 粗体和斜体 =====");
console.log(markdownToHTML("This is **bold** and *italic* text."));
console.log(markdownToHTML("__bold__ and _italic_ with underscores."));

console.log("\n===== 链接和图片 =====");
console.log(markdownToHTML("[Click here](https://example.com)"));
console.log(markdownToHTML("![Alt text](https://example.com/image.png)"));

console.log("\n===== 行内代码 =====");
console.log(markdownToHTML("Use `console.log()` to print."));

console.log("\n===== 代码块 =====");
console.log(
  markdownToHTML("```javascript\nconst x = 42;\nconsole.log(x);\n```"),
);

console.log("\n===== 无序列表 =====");
console.log(markdownToHTML("- Item 1\n- Item 2\n- Item 3"));

console.log("\n===== 有序列表 =====");
console.log(markdownToHTML("1. First\n2. Second\n3. Third"));

console.log("\n===== 引用 =====");
console.log(markdownToHTML("> This is a quote.\n> Second line of quote."));

console.log("\n===== 水平线 =====");
console.log(markdownToHTML("---"));
console.log(markdownToHTML("***"));

console.log("\n===== 段落 =====");
console.log(
  markdownToHTML(
    "This is a paragraph.\nIt has multiple lines.\n\nSecond paragraph here.",
  ),
);

console.log("\n===== 混合行内元素 =====");
console.log(
  markdownToHTML(
    "Visit [Google](https://google.com) and search for **bold** `code` *text*.",
  ),
);

console.log("\n===== 代码块中的特殊字符 =====");
console.log(
  markdownToHTML("```\n<h1>Not a real heading</h1>\nconst a = b < c;\n```"),
);

console.log("\n===== 完整文档测试 =====");
const fullDoc = `# My Document

This is a **paragraph** with *various* [links](https://example.com).

## Section 2

- List item 1
- List item 2
- List item 3

1. Ordered 1
2. Ordered 2

> This is a blockquote.
> It has two lines.

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

---

![Example Image](https://example.com/img.png)

Use \`inline code\` here.`;

console.log(markdownToHTML(fullDoc));

console.log("\n===== 空字符串测试 =====");
console.log(JSON.stringify(markdownToHTML("")));

console.log("\n===== 嵌套列表后的内容 =====");
console.log(markdownToHTML("- Item 1\n- Item 2\n\nParagraph after list."));
