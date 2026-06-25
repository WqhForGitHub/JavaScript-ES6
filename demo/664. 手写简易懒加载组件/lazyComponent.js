/**
 * 手写简易懒加载组件（React.lazy）
 *
 * React.lazy 用于「代码分割」：把某个组件打成独立 chunk，首次用到时再异步加载。
 *   const LazyComp = React.lazy(() => import('./Comp'));
 *   <Suspense fallback={<Loading />}><LazyComp /></Suspense>
 *
 * 实现原理：
 *   - lazy(loader) 返回一个包装组件
 *   - 首次渲染时：若模块未加载，调用 loader() 得到 promise，并 throw 出去
 *     （被外层 Suspense 捕获，渲染 fallback）
 *   - promise resolve 后：缓存加载到的组件，重新渲染时正常渲染它
 *   - 后续渲染：直接使用缓存组件，不再加载
 *
 * 本例复用 663 的 Suspense + mock DOM 渲染器。
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
function h(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" ? { type: "#text", props: { nodeValue: c } } : c,
    );
  return { type, props: { ...(props || {}), children: flat } };
}
function mount(vnode) {
  if (vnode == null) return null;
  if (typeof vnode === "string") {
    const t = el("#text");
    t.text = vnode;
    return t;
  }
  if (typeof vnode.type === "function") {
    const child = vnode.type(vnode.props); // 可能 throw promise
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

// ===== Suspense（精简自 663，含错误边界）=====
function Suspense(props) {
  const container = el("div");
  function attempt() {
    try {
      const content = props.children();
      container.clear();
      container.appendChild(mount(content));
      if (props.onResolved) props.onResolved(container);
    } catch (thrown) {
      if (thrown && typeof thrown.then === "function") {
        // promise：渲染 fallback，resolve/reject 后重试
        if (!container.children.length) {
          container.clear();
          container.appendChild(mount(props.fallback));
        }
        thrown.then(
          () => attempt(),
          () => attempt(),
        );
      } else if (props.errorFallback) {
        // 真实错误：渲染错误降级 UI（类似 ErrorBoundary）
        container.clear();
        container.appendChild(mount(props.errorFallback));
        if (props.onError) props.onError(thrown);
        if (props.onResolved) props.onResolved(container);
      } else {
        throw thrown;
      }
    }
  }
  attempt();
  return container;
}

// ===== lazy 实现 =====
function lazy(loader) {
  let Comp = null; // 加载到的组件
  let promise = null;
  let loadError = null;

  return function LazyComponent(props) {
    if (loadError) throw loadError;
    if (Comp) return Comp(props); // 已加载：直接渲染
    if (!promise) {
      promise = loader()
        .then((mod) => {
          Comp = mod.default || mod;
        })
        .catch((e) => {
          loadError = e;
        });
    }
    throw promise; // 未就绪：抛出 promise 给 Suspense
  };
}

// ===== 序列化 =====
function serialize(node) {
  if (!node) return "";
  if (node._text) return node.text;
  return `<${node.tagName}>${node.children.map(serialize).join("")}</${node.tagName}>`;
}

// ===== 测试 =====
// 模拟一个「被打包成独立 chunk」的组件，通过异步 loader 加载
function makeLazyModule() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        default: function HeavyChart(props) {
          return h(
            "section",
            { className: "chart" },
            h("h3", null, props.title),
            h("canvas", null, "[图表数据 ", props.data, "]"),
          );
        },
      });
    }, 60);
  });
}

const LazyChart = lazy(() => makeLazyModule());

console.log("=== 首次渲染（组件尚未加载，显示 fallback）===");
const suspense = Suspense({
  fallback: h("div", { className: "skeleton" }, "Loading chart..."),
  children: () => h(LazyChart, { title: "Sales 2024", data: "1,2,3" }),
  onResolved: (node) => {
    console.log("（组件加载完成，已渲染真实内容）");
    console.log("最终内容:", serialize(node));
    // <div><section><h3>Sales 2024</h3><canvas>[图表数据 1,2,3]</canvas></section></div>

    // 验证：后续渲染直接复用已加载组件，不再触发 fallback
    console.log("\n=== 再次渲染（复用已加载组件）===");
    const suspense2 = Suspense({
      fallback: h("div", null, "should not show"),
      children: () => h(LazyChart, { title: "Sales 2025", data: "4,5,6" }),
      onResolved: (node2) => {
        console.log("二次内容:", serialize(node2));
        // <div><section><h3>Sales 2025</h3><canvas>[图表数据 4,5,6]</canvas></section></div>
      },
    });
    console.log("二次初始（应已是真实内容）:", serialize(suspense2));
  },
});

console.log("初始内容:", serialize(suspense));
// <div><div class="skeleton">Loading chart...</div></div>

// 加载失败的演示：用错误边界（errorFallback）兜底
const LazyFail = lazy(() => Promise.reject(new Error("chunk 404")));
console.log("\n=== 加载失败演示（错误边界兜底）===");
const suspense3 = Suspense({
  fallback: h("div", null, "Loading..."),
  errorFallback: h("div", { className: "error" }, "Failed to load component"),
  children: () => h(LazyFail, null),
  onError: (err) => console.log("  捕获错误:", err.message),
  onResolved: (node3) => {
    console.log("失败分支内容:", serialize(node3));
  },
});
console.log("失败初始:", serialize(suspense3));
// 异步 reject 后 -> 重试 -> 抛出 Error -> 渲染 errorFallback
// 输出：捕获错误: chunk 404；失败分支内容: <div><div class="error">Failed to load component</div></div>
