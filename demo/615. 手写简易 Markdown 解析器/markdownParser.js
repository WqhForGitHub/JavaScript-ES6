/**
 * 手写简易 Markdown 解析器
 *
 * 将 Markdown 文本转换为 HTML 字符串，支持：
 *   - 标题 # ## ###
 *   - 无序列表 - / *
 *   - 有序列表 1.
 *   - 代码块 ```
 *   - 行内代码 `code`
 *   - 粗体 **text** / 斜体 *text*
 *   - 链接 [text](url) / 图片 ![alt](src)
 *   - 段落与换行
 *
 * 实现思路：
 * 1. 逐行处理，根据行首标记判断块级元素。
 * 2. 代码块用 ``` 围栏切换状态，期间不转义行内格式。
 * 3. 行内格式用正则替换处理。
 * 4. 相邻的非块级文本行合并为段落。
 *
 * @param {string} md - Markdown 文本
 * @returns {string} 生成的 HTML
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseInline(text) {
  // 图片
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  // 链接
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // 行内代码
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // 粗体
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // 斜体
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return text;
}

function markdownParser(md) {
  const lines = md.split("\n");
  const html = [];
  let inCodeBlock = false;
  let inUl = false;
  let inOl = false;
  let paragraph = [];

  function closeList() {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  }

  function flushParagraph() {
    if (paragraph.length > 0) {
      html.push("<p>" + parseInline(paragraph.join(" ")) + "</p>");
      paragraph = [];
    }
  }

  for (const line of lines) {
    // 代码块切换
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        flushParagraph();
        html.push("<pre><code>");
        inCodeBlock = true;
      } else {
        html.push("</code></pre>");
        inCodeBlock = false;
      }
      continue;
    }
    if (inCodeBlock) {
      html.push(escapeHtml(line));
      continue;
    }

    // 空行
    if (line.trim() === "") {
      closeList();
      flushParagraph();
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      flushParagraph();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // 无序列表
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push("<li>" + parseInline(ulMatch[1]) + "</li>");
      continue;
    }

    // 有序列表
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push("<li>" + parseInline(olMatch[1]) + "</li>");
      continue;
    }

    // 普通段落文本
    closeList();
    paragraph.push(line.trim());
  }

  closeList();
  flushParagraph();
  if (inCodeBlock) html.push("</code></pre>");

  return html.join("\n");
}

// ===== 测试用例 =====
const md = `# 标题一

这是一段**粗体**和*斜体*文字，还有\`行内代码\`。

## 列表示例
- 项目一
- 项目二

1. 第一
2. 第二

\`\`\`
let x = 1;
\`\`\`

[链接](https://example.com)`;

console.log(markdownParser(md));
// 期望输出（关键行）:
// <h1>标题一</h1>
// <p>这是一段<strong>粗体</strong>和<em>斜体</em>文字，还有<code>行内代码</code>。</p>
// <h2>列表示例</h2>
// <ul>
// <li>项目一</li>
// <li>项目二</li>
// </ul>
// <ol>
// <li>第一</li>
// <li>第二</li>
// </ol>
// <pre><code>
// let x = 1;
// </code></pre>
// <p><a href="https://example.com">链接</a></p>
