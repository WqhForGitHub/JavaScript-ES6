/**
 * 手写简易 HTML 解析器
 *
 * 将 HTML 字符串解析为 DOM 树（普通对象）。
 * 支持：开始标签、结束标签、自闭合标签、属性、文本节点。
 *
 * 实现思路：
 * 1. 用正则匹配标签和文本片段。
 * 2. 维护一个栈，遇到开始标签时创建节点并入栈，遇到结束标签时出栈。
 * 3. 文本片段作为文本节点添加到栈顶节点的 children 中。
 * 4. 自闭合标签（img/br/input 等）不入栈。
 *
 * @param {string} html - HTML 字符串
 * @returns {{type: string, tagName?: string, attributes?: Object, children: Array, content?: string}} DOM 树
 */
const SELF_CLOSING_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

function htmlParser(html) {
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>]|"[^"]*")*)>/g;
  const root = { type: "document", children: [] };
  const stack = [root];

  let lastIndex = 0;
  let match;

  function addText(text) {
    if (text.trim()) {
      stack[stack.length - 1].children.push({ type: "text", content: text });
    }
  }

  function parseAttributes(attrStr) {
    const attrs = {};
    const attrRegex = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
    let am;
    while ((am = attrRegex.exec(attrStr)) !== null) {
      attrs[am[1]] = am[2];
    }
    // 无值属性如 disabled
    const boolRegex = /\s([a-zA-Z-]+)(?=\s|$)/g;
    let bm;
    while ((bm = boolRegex.exec(attrStr)) !== null) {
      if (!attrs[bm[1]]) attrs[bm[1]] = true;
    }
    return attrs;
  }

  while ((match = tagRegex.exec(html)) !== null) {
    // 标签前的文本
    if (match.index > lastIndex) {
      addText(html.slice(lastIndex, match.index));
    }
    lastIndex = tagRegex.lastIndex;

    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullMatch.startsWith("</");

    if (isClosing) {
      // 弹出栈直到匹配的开始标签
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName === tagName) {
          stack.length = i;
          break;
        }
      }
    } else {
      const node = {
        type: "element",
        tagName,
        attributes: parseAttributes(match[2]),
        children: [],
      };
      stack[stack.length - 1].children.push(node);
      if (!SELF_CLOSING_TAGS.has(tagName) && !fullMatch.endsWith("/>")) {
        stack.push(node);
      }
    }
  }

  // 末尾文本
  if (lastIndex < html.length) {
    addText(html.slice(lastIndex));
  }

  return root;
}

// 格式化打印 DOM 树
function printDom(node, indent = "") {
  if (node.type === "text") {
    console.log(`${indent}#text "${node.content.trim()}"`);
    return;
  }
  if (node.tagName) {
    const attrs = Object.entries(node.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
    console.log(`${indent}<${node.tagName}${attrs ? " " + attrs : ""}>`);
  } else {
    console.log(`${indent}document`);
  }
  for (const child of node.children) printDom(child, indent + "  ");
}

// ===== 测试用例 =====
const dom = htmlParser(
  '<div id="main"><p class="x">hello</p><img src="a.png"><br></div>',
);
printDom(dom);
// 期望输出:
// document
//   <div id="main">
//     <p class="x">
//       #text "hello"
//     <img src="a.png">
//     <br>

const dom2 = htmlParser("<ul><li>one</li><li>two</li></ul>");
printDom(dom2);
// 期望输出:
// document
//   <ul>
//     <li>
//       #text "one"
//     <li>
//       #text "two"
