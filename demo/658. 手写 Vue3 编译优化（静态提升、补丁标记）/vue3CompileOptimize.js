/**
 * 手写 Vue3 编译优化（静态提升、补丁标记）
 *
 * Vue3 编译器在生成 render 时做两类优化，减少运行时 diff 工作量：
 *
 * 1) 静态提升（Static Hoisting）
 *    - 整棵「纯静态子树」（无插值、无绑定、无事件）被提升到 render 函数之外，
 *      作为常量只创建一次，每次渲染直接复用同一 vnode，不参与 diff。
 *
 * 2) 补丁标记（PatchFlag）
 *    - 给「动态节点」打上标记，指明它哪些部分会变：
 *        TEXT=1      只有文本子节点动态
 *        CLASS=2     class 绑定动态
 *        STYLE=4     style 绑定动态
 *        PROPS=8     其它 props 绑定动态
 *    - 运行时 diff 时只需对比标记指明的部分，跳过静态属性，实现「靶向更新」。
 *
 * 本文件复用 657 的 parse，再加 transform（标记）+ optimize codegen。
 */

// ===== parse（与 657 一致）=====
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
        const node = {
          type: "element",
          tag,
          attrs: parseAttrs(m ? m[2] : ""),
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

// ===== PatchFlag 常量 =====
const PatchFlag = {
  TEXT: 1,
  CLASS: 2,
  STYLE: 4,
  PROPS: 8,
  FULL_PROPS: 16,
  HOISTED: -1,
};
function flagName(f) {
  const names = [];
  if (f & PatchFlag.TEXT) names.push("TEXT");
  if (f & PatchFlag.CLASS) names.push("CLASS");
  if (f & PatchFlag.STYLE) names.push("STYLE");
  if (f & PatchFlag.PROPS) names.push("PROPS");
  return names.length ? names.join("|") : "0";
}

// ===== transform：计算 static / patchFlag / dynamicProps =====
function isNodeStatic(node) {
  if (node.type === "text") return true;
  if (node.type === "interpolation") return false;
  if (node.attrs.on) return false;
  if (node.attrs.bind && Object.keys(node.attrs.bind).length) return false;
  return node.children.every(isNodeStatic);
}
function transform(node) {
  if (node.type !== "element") return;
  let flag = 0;
  const dynamicProps = [];
  const bind = node.attrs.bind || {};
  if ("class" in bind) {
    flag |= PatchFlag.CLASS;
    dynamicProps.push("class");
  }
  if ("style" in bind) {
    flag |= PatchFlag.STYLE;
    dynamicProps.push("style");
  }
  for (const k in bind) {
    if (k !== "class" && k !== "style") {
      flag |= PatchFlag.PROPS;
      dynamicProps.push(k);
    }
  }
  const hasElementChild = node.children.some((c) => c.type === "element");
  const hasInterp = node.children.some((c) => c.type === "interpolation");
  if (!hasElementChild && hasInterp) flag |= PatchFlag.TEXT;

  node.patchFlag = flag;
  node.dynamicProps = dynamicProps;
  node.static = isNodeStatic(node);
  node.children.forEach(transform);
}

// ===== 静态提升：收集可提升的静态子树 =====
let hoistedList = [];
function collectHoisted(node) {
  if (node.type !== "element") return;
  if (node.static) {
    node.hoistId = hoistedList.length + 1;
    hoistedList.push(node);
    return; // 整棵提升，不再深入
  }
  node.children.forEach(collectHoisted);
}

// ===== codegen =====
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
// 原始生成（用于提升的静态节点，不带 flag）
function genRaw(node) {
  if (node.type === "text") return `_v(${JSON.stringify(node.content)})`;
  if (node.type === "interpolation") return `_s(${node.expr})`;
  const children = node.children.map(genRaw).join(", ");
  return `_c(${JSON.stringify(node.tag)}, ${genProps(node.attrs)}, [${
    children || ""
  }])`;
}
// 优化生成（动态节点带 patchFlag，静态节点引用提升常量）
function genOpt(node) {
  if (node.hoistId) return `_hoisted[${node.hoistId - 1}]`;
  if (node.type === "text") return `_v(${JSON.stringify(node.content)})`;
  if (node.type === "interpolation") return `_s(${node.expr})`;
  const children = node.children.map(genOpt).join(", ");
  const flag = node.patchFlag || 0;
  const dyn = node.dynamicProps.length
    ? JSON.stringify(node.dynamicProps)
    : "null";
  // 仅当有动态标记或动态子节点时才传 patchFlag，否则省略
  if (flag === 0) {
    return `_c(${JSON.stringify(node.tag)}, ${genProps(node.attrs)}, [${
      children || ""
    }])`;
  }
  return `_c(${JSON.stringify(node.tag)}, ${genProps(node.attrs)}, [${
    children || ""
  }], ${flag}, ${dyn})`;
}

// ===== compile =====
function compile(template) {
  const ast = parse(template);
  const rootEl = ast.children.find((c) => c.type === "element");
  transform(rootEl);
  hoistedList = [];
  collectHoisted(rootEl);

  // 静态提升：在 render 之外只创建一次，运行时复用同一 vnode
  const hoistedVnodes = hoistedList.map((n) => {
    const fn = new Function("_c", "_v", "_s", `return ${genRaw(n)};`);
    return fn(h, toText, toStr);
  });

  // render 代码（引用传入的 _hoisted 数组）
  const renderCode = `return ${genOpt(rootEl)};`;
  // 展示用的代码（把 _hoisted[i] 还原成常量声明，便于阅读）
  const hoistCodeForDisplay = hoistedList
    .map((n, i) => `const _hoisted_${i + 1} = ${genRaw(n)};`)
    .join("\n");
  const fullCodeForDisplay = `${hoistCodeForDisplay}\n// ↑ 静态提升到 render 外，只创建一次\nfunction render() {\n  return ${genOpt(rootEl)};\n}`;

  const render = new Function(
    "_c",
    "_s",
    "_v",
    "_hoisted",
    "ctx",
    `with(ctx){ ${renderCode} }`,
  );
  return {
    ast: rootEl,
    hoisted: hoistedList,
    code: fullCodeForDisplay,
    render: (ctx) => render(h, toStr, toText, hoistedVnodes, ctx),
  };
}

// ===== 运行时 helper（mock vnode，带 patchFlag）=====
function h(tag, props, children, patchFlag, dynamicProps) {
  return {
    type: "element",
    tag,
    props: props || {},
    children: children || [],
    patchFlag: patchFlag || 0,
    dynamicProps: dynamicProps || null,
  };
}
function toStr(v) {
  return { type: "text", text: String(v) };
}
function toText(s) {
  return { type: "text", text: s };
}

// ===== 测试 =====
const template = `
<div :class="cls" :id="uid">
  <h1>{{ title }}</h1>
  <p :style="sty">count = {{ count }}</p>
  <ul>
    <li><span>static label</span></li>
    <li><span>another static</span></li>
  </ul>
  <footer>© 2024</footer>
</div>`;

const { code, hoisted, render } = compile(template);
console.log("=== 提升的静态节点数量:", hoisted.length);
hoisted.forEach((n) => {
  console.log(`  _hoisted_${n.hoistId} = <${n.tag} ...>（整棵静态子树）`);
});

console.log("\n=== 优化后的 render 代码 ===");
console.log(code);

console.log("\n=== 执行 render，查看各节点的 patchFlag ===");
const ctx = { cls: "box", uid: 7, title: "Hi", sty: "color:red", count: 3 };
const vnode = render(ctx);
function dump(node, indent = "") {
  if (node.type === "text") {
    console.log(`${indent}#text "${node.text}"`);
    return;
  }
  const flag = node.patchFlag
    ? ` patchFlag=${node.patchFlag}(${flagName(node.patchFlag)})`
    : " (静态)";
  console.log(`${indent}<${node.tag}>${flag}`);
  (node.children || []).forEach((c) => dump(c, indent + "  "));
}
dump(vnode);

// 验证：静态子树被提升后，两次 render 复用同一 vnode 引用
const vnode2 = render(ctx);
console.log("\n静态子树两次渲染是否同一引用?");
// 第一个提升的静态节点对应 render 中的 _hoisted_1
// 通过查找 ul（其内部 li/span 是静态提升的子树）
function findTag(node, tag) {
  if (node.tag === tag) return node;
  for (const c of node.children || []) {
    const r = findTag(c, tag);
    if (r) return r;
  }
  return null;
}
// 注意：被提升的是整棵 ul（含 li/span）作为 _hoisted_N，引用应相同
const ul1 = findTag(vnode, "ul");
const ul2 = findTag(vnode2, "ul");
console.log("ul 两次引用相同?", ul1 === ul2); // true（提升复用）
