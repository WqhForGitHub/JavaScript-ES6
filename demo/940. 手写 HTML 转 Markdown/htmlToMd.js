/**
 * 手写 HTML 转 Markdown
 *
 * 将简单的 HTML 字符串转换为 Markdown。
 * 不使用 DOMParser，使用正则表达式和状态机进行解析。
 *
 * 支持的 HTML 标签：
 * - h1 ~ h6: → # ~ ######
 * - strong / b: → **text**
 * - em / i: → *text*
 * - a (href): → [text](url)
 * - img (src/alt): → ![alt](src)
 * - ul / ol / li: → - item / 1. item
 * - blockquote: → > text
 * - pre / code: → ```code``` 或 `code`
 * - p: → 段落
 * - br: → 换行
 * - hr: → ---
 */

/**
 * HTML 实体反转义。
 * @param {string} text - 包含实体的文本
 * @returns {string} 反转义后的文本
 */
function unescapeHTMLEntities(text) {
  const entities = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&apos;": "'",
    "&nbsp;": " ",
    "&#39;": "'",
    "&copy;": "\u00A9",
    "&reg;": "\u00AE",
  };
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(
      /&(lt|gt|amp|quot|apos|nbsp|copy|reg);/g,
      (_, entity) => entities["&" + entity + ";"] || entity,
    );
}

/**
 * 去除 HTML 标签，只保留文本内容。
 * @param {string} html - HTML 字符串
 * @returns {string} 纯文本
 */
function stripTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * 简易 HTML 解析器：将 HTML 字符串解析为 token 数组。
 * 每个 token 为 { type: 'tag'|'text', value: string, tagName, attributes, isClosing, isSelfClosing }
 *
 * @param {string} html - HTML 字符串
 * @returns {Array} token 数组
 */
function tokenizeHTML(html) {
  const tokens = [];
  let pos = 0;
  const len = html.length;

  while (pos < len) {
    if (html[pos] === "<") {
      // 查找标签结束
      const tagEnd = html.indexOf(">", pos);
      if (tagEnd === -1) {
        // 没有结束符，作为文本
        tokens.push({ type: "text", value: html.substring(pos) });
        break;
      }
      const tagContent = html.substring(pos + 1, tagEnd);
      const isClosing = tagContent.startsWith("/");
      const isSelfClosing = tagContent.endsWith("/");
      const cleanContent = tagContent.replace(/^\/|\/$/g, "").trim();

      // 解析标签名和属性
      const spaceIdx = cleanContent.indexOf(" ");
      let tagName, attrStr;
      if (spaceIdx === -1) {
        tagName = cleanContent.toLowerCase();
        attrStr = "";
      } else {
        tagName = cleanContent.substring(0, spaceIdx).toLowerCase();
        attrStr = cleanContent.substring(spaceIdx + 1);
      }

      // 解析属性
      const attributes = {};
      const attrRegex = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
        attributes[attrMatch[1].toLowerCase()] = attrMatch[2];
      }
      // 无值属性
      const attrRegex2 = /(\w[\w-]*)\s*(?==)/g;
      // 单独的属性（无值）
      const bareAttrRegex = /\s(\w[\w-]*)(?=\s|$)/g;
      // 处理无引号属性
      const attrRegex3 = /(\w[\w-]*)\s*=\s*([^\s"']+)/g;
      while ((attrMatch = attrRegex3.exec(attrStr)) !== null) {
        if (!attributes[attrMatch[1].toLowerCase()]) {
          attributes[attrMatch[1].toLowerCase()] = attrMatch[2];
        }
      }

      // 特殊处理：script/style 内容跳过
      if (tagName === "script" || tagName === "style") {
        // 跳过到对应的结束标签
        const closeTag = "</" + tagName;
        const closeIdx = html.toLowerCase().indexOf(closeTag, tagEnd + 1);
        if (closeIdx !== -1) {
          pos = html.indexOf(">", closeIdx) + 1;
        } else {
          pos = tagEnd + 1;
        }
        continue;
      }

      // HTML 注释跳过
      if (tagContent.startsWith("!--")) {
        const commentEnd = html.indexOf("-->", pos);
        pos = commentEnd !== -1 ? commentEnd + 3 : tagEnd + 1;
        continue;
      }

      tokens.push({
        type: "tag",
        tagName: tagName,
        attributes: attributes,
        isClosing: isClosing,
        isSelfClosing: isSelfClosing,
      });
      pos = tagEnd + 1;
    } else {
      // 文本内容
      const nextTag = html.indexOf("<", pos);
      const textEnd = nextTag === -1 ? len : nextTag;
      const text = html.substring(pos, textEnd);
      if (text.trim() || tokens.length > 0) {
        tokens.push({ type: "text", value: unescapeHTMLEntities(text) });
      }
      pos = textEnd;
    }
  }

  return tokens;
}

/**
 * 将 HTML token 数组转换为 Markdown。
 * 使用递归下降方式处理嵌套标签。
 *
 * @param {Array} tokens - token 数组
 * @returns {string} Markdown 字符串
 */
function tokensToMarkdown(tokens) {
  let pos = 0;
  const lines = [];

  /**
   * 递归处理元素，返回 Markdown 文本。
   * @param {string} [expectedTag] - 期望的结束标签名
   * @returns {string}
   */
  function processElements(expectedTag) {
    let result = "";

    while (pos < tokens.length) {
      const token = tokens[pos];

      if (token.type === "text") {
        result += token.value;
        pos++;
        continue;
      }

      if (token.type === "tag") {
        // 遇到期望的结束标签，返回
        if (token.isClosing && token.tagName === expectedTag) {
          pos++;
          return result;
        }

        // 遇到任意结束标签（未匹配的），跳过
        if (token.isClosing) {
          pos++;
          continue;
        }

        // 自闭合标签
        if (token.isSelfClosing || isVoidElement(token.tagName)) {
          result += processSelfClosingTag(token);
          pos++;
          continue;
        }

        // 开始标签，递归处理
        pos++;
        const inner = processElements(token.tagName);
        result += processTag(token.tagName, token.attributes, inner);
      }
    }

    return result;
  }

  /**
   * 处理自闭合标签 / void 元素。
   * @param {Object} token - 标签 token
   * @returns {string}
   */
  function processSelfClosingTag(token) {
    switch (token.tagName) {
      case "br":
        return "\n";
      case "hr":
        return "\n---\n";
      case "img": {
        const alt = token.attributes.alt || "";
        const src = token.attributes.src || "";
        return "![" + alt + "](" + src + ")";
      }
      default:
        return "";
    }
  }

  /**
   * 处理标签内容转换为 Markdown。
   * @param {string} tagName - 标签名
   * @param {Object} attributes - 属性
   * @param {string} inner - 内部内容
   * @returns {string}
   */
  function processTag(tagName, attributes, inner) {
    switch (tagName) {
      case "h1":
        return "\n# " + inner.trim() + "\n";
      case "h2":
        return "\n## " + inner.trim() + "\n";
      case "h3":
        return "\n### " + inner.trim() + "\n";
      case "h4":
        return "\n#### " + inner.trim() + "\n";
      case "h5":
        return "\n##### " + inner.trim() + "\n";
      case "h6":
        return "\n###### " + inner.trim() + "\n";
      case "strong":
      case "b":
        return "**" + inner + "**";
      case "em":
      case "i":
        return "*" + inner + "*";
      case "a": {
        const href = attributes.href || "";
        return "[" + inner + "](" + href + ")";
      }
      case "img": {
        const alt = attributes.alt || "";
        const src = attributes.src || "";
        return "![" + alt + "](" + src + ")";
      }
      case "code": {
        // 行内代码
        return "`" + inner + "`";
      }
      case "pre": {
        // 代码块：去除内部 code 标签
        // 内部 <code> 已被递归处理为反引号包裹，需去除反引号
        let code = inner.replace(/<\/?code[^>]*>/g, "");
        // 去除被行内 code 处理添加的反引号包裹
        if (code.startsWith("`") && code.endsWith("`")) {
          code = code.substring(1, code.length - 1);
        }
        code = code.trim();
        return "\n```\n" + code + "\n```\n";
      }
      case "blockquote": {
        const quoted = inner
          .trim()
          .split("\n")
          .map((l) => "> " + l)
          .join("\n");
        return "\n" + quoted + "\n";
      }
      case "ul": {
        const items = parseListItems(inner);
        return "\n" + items.map((item) => "- " + item).join("\n") + "\n";
      }
      case "ol": {
        const items = parseListItems(inner);
        return (
          "\n" +
          items.map((item, idx) => idx + 1 + ". " + item).join("\n") +
          "\n"
        );
      }
      case "li":
        return inner;
      case "p":
        return "\n" + inner.trim() + "\n";
      case "div":
        return "\n" + inner + "\n";
      case "span":
        return inner;
      case "br":
        return "\n";
      case "hr":
        return "\n---\n";
      default:
        return inner;
    }
  }

  /**
   * 从列表内容中解析各列表项。
   * @param {string} inner - ul/ol 内部内容
   * @returns {Array<string>}
   */
  function parseListItems(inner) {
    // 重新 token 化内部内容来提取 li
    const subTokens = tokenizeHTML(inner);
    const items = [];
    let subPos = 0;

    while (subPos < subTokens.length) {
      const token = subTokens[subPos];
      if (token.type === "tag" && !token.isClosing && token.tagName === "li") {
        subPos++;
        // 收集直到 </li>
        let itemContent = "";
        let depth = 1;
        while (subPos < subTokens.length && depth > 0) {
          const t = subTokens[subPos];
          if (t.type === "tag" && !t.isClosing && t.tagName === "li") {
            depth++;
            itemContent += "\n";
          } else if (t.type === "tag" && t.isClosing && t.tagName === "li") {
            depth--;
            if (depth === 0) break;
            itemContent += "\n";
          } else if (t.type === "text") {
            itemContent += t.value;
          } else if (t.type === "tag") {
            // 处理嵌套标签（简化处理）
            if (t.tagName === "strong" || t.tagName === "b") {
              itemContent += "**";
            } else if (t.tagName === "em" || t.tagName === "i") {
              itemContent += "*";
            } else if (t.tagName === "code") {
              itemContent += "`";
            } else if (t.tagName === "a" && !t.isClosing) {
              itemContent += "[";
            }
          }
          subPos++;
        }
        subPos++; // 跳过 </li>
        // 简单处理行内格式
        itemContent = itemContent
          .replace(/\*\*\s*/g, "**")
          .replace(/\s*\*\*/g, "**");
        items.push(itemContent.trim());
      } else {
        subPos++;
      }
    }
    return items;
  }

  /**
   * 判断是否为 void 元素（自闭合）。
   * @param {string} tagName
   * @returns {boolean}
   */
  function isVoidElement(tagName) {
    const voidElements = [
      "br",
      "hr",
      "img",
      "input",
      "meta",
      "link",
      "area",
      "base",
      "col",
      "embed",
      "source",
      "track",
      "wbr",
    ];
    return voidElements.includes(tagName);
  }

  const result = processElements(null);

  // 清理多余的空行
  return (
    result
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+/, "")
      .replace(/\s+$/, "")
      .trim() + "\n"
  );
}

/**
 * 将 HTML 字符串转换为 Markdown。
 *
 * @param {string} html - HTML 字符串
 * @returns {string} Markdown 字符串
 */
function htmlToMarkdown(html) {
  if (!html || !html.trim()) return "";
  const tokens = tokenizeHTML(html);
  return tokensToMarkdown(tokens);
}

// ===================== 内联 Markdown 转 HTML（用于往返验证） =====================

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function processInline(text) {
  const codeBlocks = [];
  let processed = text.replace(/`([^`]+)`/g, (_, code) => {
    const index = codeBlocks.length;
    codeBlocks.push("<code>" + escapeHTML(code) + "</code>");
    return "\x00CODE" + index + "\x00";
  });
  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2" />',
  );
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );
  processed = processed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  processed = processed.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  processed = processed.replace(
    /\x00CODE(\d+)\x00/g,
    (_, index) => codeBlocks[parseInt(index, 10)],
  );
  return processed;
}

function markdownToHTML(markdown) {
  if (!markdown) return "";
  const lines = markdown.split("\n");
  const html = [];
  let i = 0;
  let inList = false;
  let listType = null;
  while (i < lines.length) {
    let line = lines[i];
    if (line.trim().startsWith("```")) {
      const lang = line.trim().substring(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
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
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      if (inList) {
        html.push("</" + listType + ">");
        inList = false;
      }
      html.push("<hr />");
      i++;
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inList) {
        html.push("</" + listType + ">");
        inList = false;
      }
      const level = headingMatch[1].length;
      html.push(
        "<h" +
          level +
          ">" +
          processInline(headingMatch[2].trim()) +
          "</h" +
          level +
          ">",
      );
      i++;
      continue;
    }
    if (line.trim().startsWith(">")) {
      if (inList) {
        html.push("</" + listType + ">");
        inList = false;
      }
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      html.push(
        "<blockquote>" + processInline(quoteLines.join("\n")) + "</blockquote>",
      );
      continue;
    }
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        if (inList) html.push("</" + listType + ">");
        html.push("<ul>");
        inList = true;
        listType = "ul";
      }
      html.push("<li>" + processInline(ulMatch[1]) + "</li>");
      i++;
      continue;
    }
    const olMatch = line.match(/^[\s]*\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        if (inList) html.push("</" + listType + ">");
        html.push("<ol>");
        inList = true;
        listType = "ol";
      }
      html.push("<li>" + processInline(olMatch[1]) + "</li>");
      i++;
      continue;
    }
    if (line.trim() === "") {
      if (inList) {
        html.push("</" + listType + ">");
        inList = false;
      }
      i++;
      continue;
    }
    if (inList) {
      html.push("</" + listType + ">");
      inList = false;
    }
    const paraLines = [line];
    i++;
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
      paraLines.push(lines[i]);
      i++;
    }
    html.push("<p>" + processInline(paraLines.join(" ").trim()) + "</p>");
  }
  if (inList) html.push("</" + listType + ">");
  return html.join("\n");
}

// ===================== 测试用例 =====================

console.log("===== 标题转换 =====");
console.log(htmlToMarkdown("<h1>Heading 1</h1>"));
console.log(htmlToMarkdown("<h2>Heading 2</h2>"));
console.log(htmlToMarkdown("<h3>Heading 3</h3>"));
console.log(htmlToMarkdown("<h6>Heading 6</h6>"));

console.log("\n===== 粗体和斜体 =====");
console.log(
  htmlToMarkdown("<p>This is <strong>bold</strong> and <em>italic</em>.</p>"),
);
console.log(htmlToMarkdown("<p>This is <b>bold</b> and <i>italic</i>.</p>"));

console.log("\n===== 链接和图片 =====");
console.log(htmlToMarkdown('<a href="https://example.com">Click here</a>'));
console.log(
  htmlToMarkdown('<img alt="Alt text" src="https://example.com/image.png" />'),
);

console.log("\n===== 段落 =====");
console.log(htmlToMarkdown("<p>First paragraph.</p><p>Second paragraph.</p>"));

console.log("\n===== 代码块 =====");
console.log(
  htmlToMarkdown("<pre><code>const x = 42;\nconsole.log(x);</code></pre>"),
);

console.log("\n===== 行内代码 =====");
console.log(htmlToMarkdown("<p>Use <code>console.log()</code> to print.</p>"));

console.log("\n===== 引用 =====");
console.log(htmlToMarkdown("<blockquote>This is a quote.</blockquote>"));

console.log("\n===== 水平线 =====");
console.log(htmlToMarkdown("<hr />"));
console.log(htmlToMarkdown("<hr/>"));

console.log("\n===== 无序列表 =====");
console.log(
  htmlToMarkdown("<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>"),
);

console.log("\n===== 有序列表 =====");
console.log(
  htmlToMarkdown("<ol><li>First</li><li>Second</li><li>Third</li></ol>"),
);

console.log("\n===== 换行 =====");
console.log(htmlToMarkdown("<p>Line 1<br>Line 2</p>"));

console.log("\n===== HTML 实体反转义 =====");
console.log(htmlToMarkdown("<p>5 &lt; 10 &amp; 20 &gt; 15</p>"));

console.log("\n===== 嵌套元素 =====");
console.log(
  htmlToMarkdown(
    "<p>This has <strong>bold <em>and italic</em></strong> text.</p>",
  ),
);
console.log(
  htmlToMarkdown(
    '<p>Visit <a href="https://google.com"><strong>Google</strong></a> now.</p>',
  ),
);

console.log("\n===== 跳过 script 和 style =====");
console.log(
  htmlToMarkdown(
    '<p>Text</p><script>alert("xss")</script><style>body{}</style><p>More</p>',
  ),
);

console.log("\n===== 复杂文档转换 =====");
const htmlDoc = `<h1>My Document</h1>
<p>This is a <strong>paragraph</strong> with <em>various</em> <a href="https://example.com">links</a>.</p>
<h2>Section 2</h2>
<ul><li>List item 1</li><li>List item 2</li><li>List item 3</li></ul>
<ol><li>Ordered 1</li><li>Ordered 2</li></ol>
<blockquote>This is a blockquote.</blockquote>
<pre><code>function hello() {
  console.log("Hello!");
}</code></pre>
<hr />
<p>Final paragraph with <code>inline code</code>.</p>`;
console.log("原始 HTML:");
console.log(htmlDoc);
console.log("\n转换的 Markdown:");
console.log(htmlToMarkdown(htmlDoc));

console.log("\n===== 往返测试（Markdown → HTML → Markdown）=====");
const originalMD = `# Title

This is **bold** and *italic* with a [link](https://example.com).

- Item 1
- Item 2

> A quote

\`\`\`
code block
\`\`\`

---

Final paragraph.`;
console.log("原始 Markdown:");
console.log(originalMD);
const asHTML = markdownToHTML(originalMD);
console.log("\n转为 HTML:");
console.log(asHTML);
const backToMD = htmlToMarkdown(asHTML);
console.log("\n转回 Markdown:");
console.log(backToMD);
console.log("\n（注：往返转换是近似匹配，结构保持一致即可）");
