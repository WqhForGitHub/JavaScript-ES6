/**
 * 手写简易 XML 解析器
 *
 * 将 XML 字符串解析为树形对象，支持：
 *   - 元素节点（含属性）
 *   - 文本节点
 *   - 自闭合标签 <tag/>
 *   - CDATA 区段 <![CDATA[ ... ]]>
 *   - 注释 <!-- ... -->
 *   - 嵌套元素
 *
 * 实现思路：
 * 1. 用正则扫描出各类标记：开始标签、结束标签、自闭合标签、CDATA、注释、文本。
 * 2. 维护栈，遇到开始标签入栈，结束标签出栈。
 * 3. 把节点结构化为 { tag, attributes, children, text }。
 *
 * @param {string} xml - XML 字符串
 * @returns {Object} 解析后的 XML 树
 */
function parseAttributes(attrStr) {
  const attrs = {};
  const regex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = regex.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  // 单引号属性
  const regex2 = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*'([^']*)'/g;
  while ((m = regex2.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function xmlParser(xml) {
  // 去掉 XML 声明和注释
  let input = xml
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const root = { tag: "#document", attributes: {}, children: [] };
  const stack = [root];

  const tokenRegex =
    /<!\[CDATA\[([\s\S]*?)\]\]>|<\/?([a-zA-Z_][\w.-]*)((?:[^>]|"[^"]*")*)\/?>/g;
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(input)) !== null) {
    // 标签前的文本
    if (match.index > lastIndex) {
      const text = input.slice(lastIndex, match.index);
      if (text.trim()) {
        stack[stack.length - 1].children.push({
          tag: "#text",
          text: text.trim(),
        });
      }
    }
    lastIndex = tokenRegex.lastIndex;

    // CDATA
    if (match[1] !== undefined) {
      stack[stack.length - 1].children.push({ tag: "#text", text: match[1] });
      continue;
    }

    const fullTag = match[0];
    const tagName = match[2];
    const attrStr = match[3] || "";
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>");

    if (isClosing) {
      stack.pop();
    } else {
      const node = {
        tag: tagName,
        attributes: parseAttributes(attrStr),
        children: [],
      };
      stack[stack.length - 1].children.push(node);
      if (!isSelfClosing) {
        stack.push(node);
      }
    }
  }

  // 末尾文本
  if (lastIndex < input.length) {
    const text = input.slice(lastIndex);
    if (text.trim()) {
      root.children.push({ tag: "#text", text: text.trim() });
    }
  }

  return root;
}

// 打印 XML 树
function printXml(node, indent = "") {
  if (node.tag === "#text") {
    console.log(`${indent}#text: "${node.text}"`);
    return;
  }
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  console.log(`${indent}<${node.tag}${attrs}>`);
  for (const child of node.children) printXml(child, indent + "  ");
}

// ===== 测试用例 =====
const xml = `<?xml version="1.0"?>
<bookstore>
  <book category="web">
    <title lang="en">JavaScript</title>
    <author>张三</author>
    <price>45.00</price>
  </book>
  <book category="db">
    <title>SQL指南</title>
    <empty/>
  </book>
</bookstore>`;

const tree = xmlParser(xml);
printXml(tree);
// 期望输出:
// <#document>
//   <bookstore>
//     <book category="web">
//       <title lang="en">
//         #text: "JavaScript"
//       <author>
//         #text: "张三"
//       <price>
//         #text: "45.00"
//     <book category="db">
//       <title>
//         #text: "SQL指南"
//       <empty>

console.log(tree.children[0].children[0].attributes.category); // 期望输出: web
