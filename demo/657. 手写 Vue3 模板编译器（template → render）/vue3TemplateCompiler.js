/**
 * 手写 Vue3 模板编译器（template → render）
 *
 * Vue3 编译器三步：parse → transform → codegen
 *   1) parse：把模板字符串解析成 AST（抽象语法树）
 *      - 元素节点 <tag attr=val>...</tag>
 *      - 文本节点
 *      - 插值 {{ expr }}
 *      - 属性：普通 attr="str"、:prop="expr"（绑定）、@event="handler"（事件）
 *   2) transform：把插值/绑定转成可执行的表达式（本例在 codegen 中直接处理）
 *   3) codegen：把 AST 生成等价的 render 函数字符串
 *      _c(tag, props, children) 创建元素，_s(expr) 把插值转字符串，_v(text) 文本
 *
 * 最终用 new Function 把字符串变成可调用 render，并用 with(ctx) 让表达式访问数据。
 */

// ===== 1. parse =====
function parse(template) {
  const root = { type: "element", tag: "root", attrs: {}, children: [] };
  const stack = [root];
  let i = 0;
  while (i < template.length) {
    if (template[i] === "<") {
      if (template[i + 1] === "/") {
        const end = template.indexOf(">", i);
        stack.pop();
        i = end + 1;
      } else {
        const end = template.indexOf(">", i);
        let inner = template.slice(i + 1, end);
        const selfClose = inner.endsWith("/");
        if (selfClose) inner = inner.slice(0, -1);
        const m = inner.match(/^(\S+)\s*([\s\S]*)$/);
        const tag = m ? m[1] : inner.trim();
        const attrsStr = m ? m[2] : "";
        const node = {
          type: "element",
          tag,
          attrs: parseAttrs(attrsStr),
          children: [],
        };
        stack[stack.length - 1].children.push(node);
        if (!selfClose) stack.push(node);
        i = end + 1;
      }
    } else {
      let next = template.indexOf("<", i);
      if (next === -1) next = template.length;
      parseText(template.slice(i, next), stack[stack.length - 1]);
      i = next;
    }
  }
  return root;
}

function parseAttrs(str) {
  const attrs = {};
  const re = /([:@]?[^\s=]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(str))) {
    const name = m[1];
    const val = m[2];
    if (name[0] === ":") {
      attrs.bind = attrs.bind || {};
      attrs.bind[name.slice(1)] = val;
    } else if (name[0] === "@") {
      attrs.on = attrs.on || {};
      attrs.on[name.slice(1)] = val;
    } else {
      attrs[name] = val;
    }
  }
  return attrs;
}

function parseText(text, parent) {
  // 丢弃纯空白文本节点（简化处理）
  if (!text.trim()) return;
  const re = /\{\{([^}]+)\}\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last)
      parent.children.push({
        type: "text",
        content: text.slice(last, m.index),
      });
    parent.children.push({ type: "interpolation", expr: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length)
    parent.children.push({ type: "text", content: text.slice(last) });
}

// ===== 2. codegen =====
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function genProps(attrs) {
  if (!attrs) return "null";
  const parts = [];
  for (const k in attrs) {
    if (k === "bind" || k === "on") continue;
    parts.push(`${JSON.stringify(k)}: ${JSON.stringify(attrs[k])}`);
  }
  if (attrs.bind)
    for (const k in attrs.bind)
      parts.push(`${JSON.stringify(k)}: ${attrs.bind[k]}`);
  if (attrs.on)
    for (const k in attrs.on) parts.push(`on${cap(k)}: ${attrs.on[k]}`);
  return parts.length ? `{ ${parts.join(", ")} }` : "null";
}

function genNode(node) {
  if (node.type === "text") return `_v(${JSON.stringify(node.content)})`;
  if (node.type === "interpolation") return `_s(${node.expr})`;
  // element
  const children = node.children.map(genNode).join(", ");
  return `_c(${JSON.stringify(node.tag)}, ${genProps(node.attrs)}, [${
    children || ""
  }])`;
}

function generate(ast) {
  // 取 root 下第一个元素节点作为根（跳过空白文本）
  const root = ast.children.find((c) => c.type === "element") || ast;
  const code = `return ${genNode(root)}`;
  return code;
}

// ===== 3. compile：组合 parse + generate，返回 render 函数 =====
function compile(template) {
  const ast = parse(template);
  const code = generate(ast);
  // 用 with(ctx) 让表达式（如 msg、count + 1）能访问数据
  const render = new Function("_c", "_s", "_v", "ctx", `with(ctx){ ${code} }`);
  return { ast, code, render };
}

// ===== 运行时 helper（mock vnode）=====
function h(tag, props, children) {
  return { type: "element", tag, props: props || {}, children: children || [] };
}
function toString(val) {
  return { type: "text", text: String(val) };
}
function toText(s) {
  return { type: "text", text: s };
}

// ===== 序列化 vnode =====
function serialize(node) {
  if (node.type === "text") return node.text;
  const attrs = Object.entries(node.props || {})
    .map(([k, v]) => ` ${k}=${JSON.stringify(v)}`)
    .join("");
  return `<${node.tag}${attrs}>${(node.children || [])
    .map(serialize)
    .join("")}</${node.tag}>`;
}

// ===== 测试 =====
const template = `
<div class="container" :title="msg" @click="onClick">
  <h1>{{ title }}</h1>
  <p>count = {{ count + 1 }}</p>
  <span>static text</span>
</div>`;

const { ast, code, render } = compile(template);
console.log("=== 生成的 render 代码 ===");
console.log(code);
// return _c("div", { "class": "container", title: msg, onClick: onClick }, [ _c("h1", null, [ _s(title) ]), _c("p", null, [ _v("count = "), _s(count + 1) ]), _c("span", null, [ _v("static text") ]) ])

console.log("\n=== 执行 render 得到 vnode ===");
const ctx = {
  msg: "hello",
  onClick: () => console.log("clicked"),
  title: "My Title",
  count: 41,
};
const vnode = render(h, toString, toText, ctx);
console.log(serialize(vnode));
// <div class="container" title="hello" onClick="..."><h1>My Title</h1><p>count = 42</p><span>static text</span></div>

console.log("\n=== 数据变化后重新 render ===");
ctx.count = 99;
ctx.title = "Updated";
const vnode2 = render(h, toString, toText, ctx);
console.log(serialize(vnode2));
// <div class="container" title="hello" ...><h1>Updated</h1><p>count = 100</p><span>static text</span></div>

console.log("\n=== AST 结构（简化）===");
console.log(
  JSON.stringify(
    ast.children[0],
    (k, v) => (k === "children" ? v : v),
    2,
  ).slice(0, 400),
);
