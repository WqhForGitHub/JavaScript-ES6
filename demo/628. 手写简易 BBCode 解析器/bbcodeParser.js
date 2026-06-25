/**
 * 手写简易 BBCode 解析器
 *
 * 将 BBCode 文本转换为 HTML，支持：
 *   - [b]粗体[/b] -> <strong>
 *   - [i]斜体[/i] -> <em>
 *   - [u]下划线[/u] -> <u>
 *   - [color=red]文字[/color] -> <span style="color:red">
 *   - [size=20]文字[/size] -> <span style="font-size:20px">
 *   - [url=地址]文字[/url] -> <a href="地址">
 *   - [url]地址[/url]
 *   - [img]地址[/img] -> <img src="地址">
 *   - [code]代码[/code] -> <pre><code>
 *   - [quote]引用[/quote] -> <blockquote>
 *   - [list][*]项[/list] -> <ul><li>
 *
 * 实现思路：
 * 1. 词法分析：用正则匹配 [tag] 和 [/tag] 和 [*] 和文本。
 * 2. 语法分析：用栈构建嵌套结构，遇到开标签入栈，闭标签出栈。
 * 3. 渲染：递归把节点转为 HTML。
 *
 * @param {string} bbcode - BBCode 文本
 * @returns {string} 生成的 HTML
 */
const TAG_MAP = {
  b: "strong",
  i: "em",
  u: "u",
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tokenize(bbcode) {
  const tokens = [];
  const regex = /\[(\/?)([a-zA-Z]+)(?:=([^\]]*))?\]|\[\*\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(bbcode)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: bbcode.slice(lastIndex, match.index),
      });
    }
    if (match[0] === "[*]") {
      tokens.push({ type: "item" });
    } else {
      tokens.push({
        type: match[1] === "/" ? "close" : "open",
        tag: match[2].toLowerCase(),
        arg: match[3],
      });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < bbcode.length) {
    tokens.push({ type: "text", value: bbcode.slice(lastIndex) });
  }
  return tokens;
}

function parse(tokens) {
  const root = { type: "root", children: [] };
  const stack = [root];
  for (const token of tokens) {
    const top = stack[stack.length - 1];
    if (token.type === "text") {
      top.children.push({ type: "text", value: token.value });
    } else if (token.type === "item") {
      // 若栈顶是上一个 item，先弹出（自动闭合），再开启新 item
      if (top.type === "item") stack.pop();
      const node = { type: "item", children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else if (token.type === "open") {
      const node = {
        type: "tag",
        tag: token.tag,
        arg: token.arg,
        children: [],
      };
      top.children.push(node);
      stack.push(node);
    } else if (token.type === "close") {
      // 闭标签前先弹出可能挂着的 item 节点
      if (top.type === "item") stack.pop();
      // 弹出到匹配的开标签
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === token.tag) {
          stack.length = i;
          break;
        }
      }
    }
  }
  return root;
}

function render(node) {
  switch (node.type) {
    case "root":
      return node.children.map(render).join("");
    case "text":
      return escapeHtml(node.value);
    case "item":
      return "<li>" + node.children.map(render).join("") + "</li>";
    case "tag": {
      const inner = node.children.map(render).join("");
      switch (node.tag) {
        case "b":
        case "i":
        case "u":
          return `<${TAG_MAP[node.tag]}>${inner}</${TAG_MAP[node.tag]}>`;
        case "color":
          return `<span style="color:${node.arg}">${inner}</span>`;
        case "size":
          return `<span style="font-size:${node.arg}px">${inner}</span>`;
        case "url":
          return `<a href="${node.arg || inner}">${inner}</a>`;
        case "img":
          return `<img src="${inner}">`;
        case "code":
          return `<pre><code>${inner}</code></pre>`;
        case "quote":
          return `<blockquote>${inner}</blockquote>`;
        case "list":
          return `<ul>${node.children.map(render).join("")}</ul>`;
        default:
          return inner;
      }
    }
  }
  return "";
}

function bbcodeParser(bbcode) {
  const tokens = tokenize(bbcode);
  const ast = parse(tokens);
  return render(ast);
}

// ===== 测试用例 =====
console.log(bbcodeParser("[b]粗体[/b] 和 [i]斜体[/i]"));
// 期望输出: <strong>粗体</strong> 和 <em>斜体</em>

console.log(bbcodeParser("[color=red]红色[/color]文字"));
// 期望输出: <span style="color:red">红色</span>文字

console.log(bbcodeParser("[url=https://example.com]点击这里[/url]"));
// 期望输出: <a href="https://example.com">点击这里</a>

console.log(bbcodeParser("[list][*]项一[*]项二[/list]"));
// 期望输出: <ul><li>项一</li><li>项二</li></ul>

console.log(bbcodeParser("[b]嵌套[i]混合[/b]斜体[/i]"));
// 期望输出: <strong>嵌套<em>混合</em></strong>斜体
