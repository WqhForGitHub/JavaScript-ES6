/**
 * 手写简易 SSR（服务端渲染）
 *
 * SSR：在服务端把组件渲染成 HTML 字串，直接返回给浏览器，
 *   用户能更快看到首屏内容（且利于 SEO）。
 *
 * 与 CSR（客户端渲染）的区别：
 *   - CSR：服务端返回空壳，浏览器下载 JS 后再渲染
 *   - SSR：服务端直接返回拼好的 HTML，浏览器拿到即可显示
 *
 * 实现：
 *   - 定义组件为「返回描述对象」的函数（type / props / children）
 *   - renderToString(vnode)：递归把 vnode 转成 HTML 字符串
 *   - 处理属性、自闭合标签、转义文本、样式对象
 */

// ===== vnode 构造 =====
function h(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? { type: "#text", props: { nodeValue: String(c) } }
        : c,
    );
  return { type, props: { ...(props || {}), children: flat } };
}

// 自闭合标签
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function styleToString(style) {
  if (typeof style === "string") return style;
  if (style && typeof style === "object") {
    return Object.entries(style)
      .map(([k, v]) => {
        const prop = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        return `${prop}:${v}`;
      })
      .join(";");
  }
  return "";
}

function renderAttrs(props) {
  const parts = [];
  for (const k in props) {
    if (k === "children") continue;
    let val = props[k];
    if (k === "className") {
      parts.push(`class="${escapeHtml(val)}"`);
    } else if (k === "style") {
      const s = styleToString(val);
      if (s) parts.push(`style="${escapeHtml(s)}"`);
    } else if (k.startsWith("on")) {
      // 事件在 SSR 中不渲染到 HTML（需要客户端 hydrate）
      continue;
    } else if (typeof val === "boolean") {
      if (val) parts.push(k);
    } else {
      parts.push(`${k}="${escapeHtml(val)}"`);
    }
  }
  return parts.length ? " " + parts.join(" ") : "";
}

// ===== 核心：renderToString =====
function renderToString(vnode) {
  if (vnode == null || vnode === false) return "";
  if (typeof vnode === "string") return escapeHtml(vnode);
  if (typeof vnode === "number") return escapeHtml(String(vnode));

  if (typeof vnode.type === "function") {
    // 函数组件：调用得到子 vnode 再渲染
    const child = vnode.type(vnode.props);
    return renderToString(child);
  }

  if (vnode.type === "#text") {
    return escapeHtml(vnode.props.nodeValue);
  }

  const tag = vnode.type;
  const attrs = renderAttrs(vnode.props);
  if (VOID_TAGS.has(tag)) {
    return `<${tag}${attrs} />`;
  }
  const children = (vnode.props.children || []).map(renderToString).join("");
  return `<${tag}${attrs}>${children}</${tag}>`;
}

// ===== 测试 =====
// 一个函数组件
function App(props) {
  return h(
    "div",
    { id: "app", className: "container" },
    h("h1", { style: { color: "red", fontSize: "20px" } }, props.title),
    h("p", null, "Hello, ", props.user, "!"),
    h(
      "ul",
      null,
      props.items.map((it) => h("li", { key: it.id }, it.text)),
    ),
    h("input", { type: "text", value: props.user, disabled: true }),
    h("button", { onClick: () => {} }, "click me"), // 事件不渲染
  );
}

const html = renderToString(
  h(App, {
    title: "SSR Demo",
    user: "<script>xss</script>",
    items: [
      { id: 1, text: "First" },
      { id: 2, text: "Second" },
    ],
  }),
);

console.log("=== 服务端渲染的 HTML ===");
console.log(html);
// <div id="app" class="container"><h1 style="color:red;font-size:20px">SSR Demo</h1><p>Hello, &lt;script&gt;xss&lt;/script&gt;!...</p>...</div>

// 验证：XSS 转义
console.log("\n=== 验证转义 ===");
console.log(html.includes("&lt;script&gt;")); // true
console.log(html.includes("<script>xss</script>")); // false

// 验证：事件 handler 不出现在 HTML 中
console.log("\n=== 验证事件未渲染 ===");
console.log(html.includes("onClick")); // false
console.log(html.includes('type="text"')); // true
console.log(html.includes("disabled")); // true

// 验证：自闭合标签（input 是 void tag，应自闭合）
console.log("\n=== 自闭合标签 ===");
console.log(/<input[^>]*\/>$/.test(html)); // true（input 以 /> 结尾）

// 模拟服务端返回响应
function serverResponse(html) {
  return `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>SSR</title></head>
<body>
  <div id="root">${html}</div>
  <script src="/client.js"></script>
</body>
</html>`;
}
console.log("\n=== 完整 HTTP 响应（截断）===");
console.log(serverResponse(html).slice(0, 120) + "...");
