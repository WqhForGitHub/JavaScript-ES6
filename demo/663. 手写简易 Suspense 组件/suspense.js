/**
 * 手写简易 Suspense 组件
 *
 * Suspense 用于处理「异步子组件 / 异步数据」：
 *   - 子组件在数据未就绪时「抛出一个 promise」
 *   - Suspense 捕获该 promise，渲染 fallback（如 Loading...）
 *   - promise resolve 后，Suspense 重新渲染子组件，展示真实内容
 *
 * 经典模式：子组件用 throw promise 中断渲染，由最近的 Suspense 边界接住。
 * 本实现用一个 mock DOM 渲染器 + 内部状态机演示完整流程。
 */

// ===== mock DOM =====
class DomNode {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.parentNode = null;
    this.text = "";
    this._text = tag === "#text";
  }
  appendChild(c) {
    c.parentNode = this;
    this.children.push(c);
    return c;
  }
  clear() {
    this.children.forEach((c) => (c.parentNode = null));
    this.children = [];
  }
}
function el(tag) {
  return new DomNode(tag);
}

// ===== vnode =====
function h(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" ? { type: "#text", props: { nodeValue: c } } : c,
    );
  return { type, props: { ...(props || {}), children: flat } };
}

// 把 vnode 渲染成 mock DOM
function mount(vnode) {
  if (vnode == null) return null;
  if (typeof vnode === "string") {
    const t = el("#text");
    t.text = vnode;
    return t;
  }
  if (typeof vnode.type === "function") {
    // 函数组件：调用得到子 vnode 再挂载（可能 throw promise）
    const child = vnode.type(vnode.props);
    return mount(child);
  }
  if (vnode.type === "#text") {
    const t = el("#text");
    t.text = vnode.props.nodeValue;
    return t;
  }
  const node = el(vnode.type);
  (vnode.props.children || []).forEach((c) => node.appendChild(mount(c)));
  return node;
}

// ===== 异步资源：未就绪时 throw promise =====
function createResource(loader) {
  let result = null;
  let error = null;
  let promise = null;
  return {
    read() {
      if (result) return result;
      if (error) throw error;
      if (!promise) {
        promise = loader()
          .then((v) => {
            result = v;
          })
          .catch((e) => {
            error = e;
          });
      }
      throw promise; // 未就绪：抛出 promise 给 Suspense
    },
  };
}

// ===== Suspense 实现 =====
function Suspense(props) {
  // props: { fallback, children }  children 是函数（返回 vnode）
  const container = el("div");
  let settled = false;

  function attempt() {
    try {
      const content = props.children();
      settled = true;
      container.clear();
      container.appendChild(mount(content));
      if (props.onResolved) props.onResolved();
    } catch (thrown) {
      if (thrown && typeof thrown.then === "function") {
        // 捕获 promise：渲染 fallback，resolve 后重试
        if (!container.children.length) {
          container.clear();
          container.appendChild(mount(props.fallback));
        }
        thrown.then(
          () => attempt(),
          () => attempt(),
        );
      } else {
        // 真实错误：交给上层（这里简单抛出）
        throw thrown;
      }
    }
  }

  attempt();
  return container;
}

// ===== 测试 =====
// 模拟一个异步数据源：50ms 后返回
function fetchUser() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ name: "Alice", age: 28 }), 50);
  });
}
const userResource = createResource(fetchUser);

function UserProfile() {
  const user = userResource.read(); // 未就绪时 throw promise
  return h(
    "div",
    { className: "profile" },
    h("h2", null, user.name),
    h("p", null, "age: ", String(user.age)),
  );
}

console.log("=== 渲染 Suspense（数据未就绪，先显示 fallback）===");
const suspense = Suspense({
  fallback: h("div", null, "Loading..."),
  children: () => h(UserProfile, null),
  onResolved: () => {
    console.log("（数据就绪，已重新渲染）");
    printResult();
  },
});

function serialize(node) {
  if (!node) return "";
  if (node._text) return node.text;
  return `<${node.tagName}>${node.children.map(serialize).join("")}</${node.tagName}>`;
}

function printResult() {
  console.log("当前内容:", serialize(suspense));
  // <div><div class="profile"><h2>Alice</h2><p>age: 28</p></div></div>
}

console.log("初始内容:", serialize(suspense));
// <div><div>Loading...</div></div>

// 嵌套 Suspense + 多资源
const postResource = createResource(
  () => new Promise((res) => setTimeout(() => res("Hello from server"), 80)),
);

function Post() {
  const text = postResource.read();
  return h("article", null, text);
}

const suspense2 = Suspense({
  fallback: h("div", null, "加载文章中..."),
  children: () => h(Post, null),
  onResolved: () => {
    console.log("文章内容:", serialize(suspense2));
    // <div><article>Hello from server</article></div>
  },
});
console.log("文章初始:", serialize(suspense2));
// <div><div>加载文章中...</div></div>
