/**
 * 手写简易 KeepAlive 组件
 *
 * KeepAlive：缓存不活动的组件实例，而不是销毁它们。
 *   - 当组件被切换出去（deactivated）：DOM 从视图中移除，但实例（含状态/DOM）保留在缓存中
 *   - 当组件被切换回来（activated）：从缓存恢复 DOM 和状态，而非重新挂载
 *   - 好处：保留组件内部状态（如表单输入、滚动位置），避免重复渲染开销
 *
 * 核心机制：
 *   - cache: Map<name, { vnode, dom, instance }>  按组件名缓存
 *   - storageContainer: 隐藏容器，存放被缓存组件的 DOM（从视图中摘下但不销毁）
 *   - include/exclude: 控制哪些组件名需要缓存
 *   - max: 缓存上限，超过时按 LRU（最近最少使用）淘汰
 *   - 生命周期：onActivated / onDeactivated（区别于 mount/unmount）
 *
 * 本例用 mock DOM 演示完整的缓存/恢复/LRU 淘汰/生命周期流程。
 */

// ===== mock DOM =====
class DomNode {
  constructor(tag) {
    this.tagName = tag;
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this._text = tag === "#text";
    this.text = "";
  }
  appendChild(c) {
    if (c.parentNode) c.parentNode.removeChild(c);
    c.parentNode = this;
    this.children.push(c);
    return c;
  }
  insertBefore(c, ref) {
    if (c.parentNode) c.parentNode.removeChild(c);
    const i = ref ? this.children.indexOf(ref) : this.children.length;
    this.children.splice(i, 0, c);
    c.parentNode = this;
    return c;
  }
  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i >= 0) {
      this.children.splice(i, 1);
      c.parentNode = null;
    }
    return c;
  }
  setAttribute(k, v) {
    this.attributes[k] = v;
  }
}
function el(tag) {
  return new DomNode(tag);
}

// ===== vnode + 组件 =====
function h(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? { type: "#text", props: { nodeValue: String(c) } }
        : c,
    );
  return { type, props: { ...(props || {}), children: flat }, el: null };
}

// 组件注册表：name -> 组件函数
const componentRegistry = {};
function defineComponent(name, fn) {
  fn.displayName = name;
  componentRegistry[name] = fn;
  return fn;
}

// ===== 生命周期钩子管理 =====
// 每个组件实例可以注册 onActivated / onDeactivated 钩子
const lifecycleHooks = {
  activated: new Map(), // instance -> [fn, ...]
  deactivated: new Map(),
};
let currentInstance = null;

function onActivated(fn) {
  const list = lifecycleHooks.activated.get(currentInstance) || [];
  list.push(fn);
  lifecycleHooks.activated.set(currentInstance, list);
}
function onDeactivated(fn) {
  const list = lifecycleHooks.deactivated.get(currentInstance) || [];
  list.push(fn);
  lifecycleHooks.deactivated.set(currentInstance, list);
}

// ===== mount：把 vnode 渲染成 mock DOM =====
function mount(vnode) {
  if (vnode == null) return null;
  if (typeof vnode === "string") {
    const t = el("#text");
    t.text = vnode;
    return t;
  }
  if (typeof vnode.type === "function") {
    // 函数组件：创建实例，调用得到子 vnode 再挂载
    const instance = { _vnode: vnode, _name: vnode.type.displayName };
    const prevInst = currentInstance;
    currentInstance = instance;
    const child = vnode.type(vnode.props);
    currentInstance = prevInst;
    const dom = mount(child);
    instance._dom = dom;
    vnode.el = dom;
    vnode._instance = instance;
    // 首次挂载触发 activated 钩子
    const hooks = lifecycleHooks.activated.get(instance) || [];
    hooks.forEach((fn) => fn());
    return dom;
  }
  if (vnode.type === "#text") {
    const t = el("#text");
    t.text = vnode.props.nodeValue;
    return t;
  }
  const node = el(vnode.type);
  for (const k in vnode.props) {
    if (k === "children") continue;
    node.setAttribute(k === "className" ? "class" : k, vnode.props[k]);
  }
  (vnode.props.children || []).forEach((c) => node.appendChild(mount(c)));
  vnode.el = node;
  return node;
}

// ===== KeepAlive 实现 =====
function createKeepAlive(options) {
  // options: { include, exclude, max }
  const max = options.max || Infinity;
  const include = options.include;
  const exclude = options.exclude;

  const cache = new Map(); // name -> { vnode, dom, instance }
  const keys = []; // LRU 顺序：最近使用的放末尾
  const storageContainer = el("div"); // 隐藏容器，存放缓存 DOM

  function shouldCache(name) {
    if (include) {
      if (Array.isArray(include) && !include.includes(name)) return false;
      if (include instanceof RegExp && !include.test(name)) return false;
    }
    if (exclude) {
      if (Array.isArray(exclude) && exclude.includes(name)) return false;
      if (exclude instanceof RegExp && exclude.test(name)) return false;
    }
    return true;
  }

  function pruneCacheEntry(key) {
    const entry = cache.get(key);
    if (entry) {
      // 从 storageContainer 中移除并真正销毁
      if (entry.dom.parentNode === storageContainer) {
        storageContainer.removeChild(entry.dom);
      }
      // 清理生命周期钩子
      lifecycleHooks.activated.delete(entry.instance);
      lifecycleHooks.deactivated.delete(entry.instance);
      cache.delete(key);
      const i = keys.indexOf(key);
      if (i >= 0) keys.splice(i, 1);
    }
  }

  // 渲染指定组件名到 container
  function render(name, container, props) {
    const comp = componentRegistry[name];
    if (!comp) throw new Error(`组件 ${name} 未注册`);

    // 如果当前显示的不是这个组件，先 deactivate 旧的
    if (container._currentName && container._currentName !== name) {
      deactivate(container);
    }

    if (cache.has(name)) {
      // 命中缓存：从 storage 恢复 DOM
      const entry = cache.get(name);
      storageContainer.removeChild(entry.dom);
      container.appendChild(entry.dom);
      // 更新 LRU 顺序
      const i = keys.indexOf(name);
      if (i >= 0) keys.splice(i, 1);
      keys.push(name);
      // 触发 onActivated
      const hooks = lifecycleHooks.activated.get(entry.instance) || [];
      hooks.forEach((fn) => fn());
      container._currentName = name;
      return entry.dom;
    }

    // 未命中：全新挂载
    const vnode = h(comp, props || {});
    const dom = mount(vnode);
    container.appendChild(dom);

    if (shouldCache(name)) {
      // 存入缓存
      cache.set(name, { vnode, dom, instance: vnode._instance });
      keys.push(name);
      container._currentName = name;
      // 超过 max：淘汰最久未使用
      if (keys.length > max) {
        const oldest = keys[0];
        if (oldest !== name) {
          pruneCacheEntry(oldest);
        }
      }
    } else {
      container._currentName = name;
    }
    return dom;
  }

  // 把当前组件从 container 移到 storage（缓存）
  function deactivate(container) {
    const name = container._currentName;
    if (!name) return;
    if (cache.has(name)) {
      const entry = cache.get(name);
      container.removeChild(entry.dom);
      storageContainer.appendChild(entry.dom);
      // 触发 onDeactivated
      const hooks = lifecycleHooks.deactivated.get(entry.instance) || [];
      hooks.forEach((fn) => fn());
    }
    container._currentName = null;
  }

  return { render, deactivate, cache, keys, storageContainer };
}

// ===== 序列化 =====
function serialize(node) {
  if (!node) return "";
  if (node._text) return node.text;
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  return `<${node.tagName}${attrs}>${node.children
    .map(serialize)
    .join("")}</${node.tagName}>`;
}

// ===== 测试 =====
// 定义三个组件，各自维护内部状态（通过模块级对象模拟）
const mountCount = { CompA: 0, CompB: 0, CompC: 0 };
const compState = { CompA: { count: 0 }, CompB: { text: "hello" }, CompC: {} };

// 记录 activated/deactivated 事件
const lifecycleLog = [];

defineComponent("CompA", function CompA(props) {
  mountCount.CompA++;
  // 注册生命周期钩子（仅首次挂载时注册）
  if (!CompA._hooksReady) {
    CompA._hooksReady = true;
  }
  onActivated(() => lifecycleLog.push("CompA activated"));
  onDeactivated(() => lifecycleLog.push("CompA deactivated"));

  return h(
    "div",
    { className: "comp-a" },
    h("h2", null, "Component A"),
    h(
      "p",
      null,
      "mount#: ",
      String(mountCount.CompA),
      ", count: ",
      String(compState.CompA.count),
    ),
  );
});

defineComponent("CompB", function CompB(props) {
  mountCount.CompB++;
  return h(
    "div",
    { className: "comp-b" },
    h("h2", null, "Component B"),
    h(
      "p",
      null,
      "mount#: ",
      String(mountCount.CompB),
      ", text: ",
      compState.CompB.text,
    ),
  );
});

defineComponent("CompC", function CompC(props) {
  mountCount.CompC++;
  return h(
    "div",
    { className: "comp-c" },
    h("h2", null, "Component C"),
    h("p", null, "mount#: ", String(mountCount.CompC)),
  );
});

// ===== 场景1：基本缓存与恢复 =====
console.log("=== 场景1：基本缓存与恢复 ===");
const ka1 = createKeepAlive({ max: 10 });
const view1 = el("div");
view1.setAttribute("id", "view");

// 渲染 A（count 初始为 0）
lifecycleLog.length = 0;
ka1.render("CompA", view1, {});
console.log("显示 A:", serialize(view1));
console.log("  mount#:", mountCount.CompA, ", count:", compState.CompA.count);
console.log("  生命周期:", [...lifecycleLog]); // [CompA activated]

// 修改 A 的内部状态并模拟「重新渲染」（更新 DOM 文本）
// 真实框架中响应式系统会自动更新 DOM；这里手动更新以模拟
compState.CompA.count = 5;
// DOM 结构：view > div.comp-a > [h2, p > [text, text, text, text]]
// p 的第 4 个文本子节点（index 3）是 count 值
const compADiv = view1.children[0]; // div.comp-a
const pEl = compADiv.children[1]; // p
pEl.children[3].text = "5"; // count 值文本节点
console.log("  A 内部 count 改为 5（DOM 已更新）");

// 切换到 B（A 被缓存）
lifecycleLog.length = 0;
ka1.render("CompB", view1, {});
console.log("切换到 B:", serialize(view1));
console.log("  缓存大小:", ka1.cache.size, "(A 被缓存)");
console.log("  生命周期:", [...lifecycleLog]); // [CompA deactivated]

// 切回 A（应从缓存恢复，mount# 不增加，DOM 保留更新后的 count）
lifecycleLog.length = 0;
ka1.render("CompA", view1, {});
console.log("切回 A:", serialize(view1));
console.log("  mount#:", mountCount.CompA, "(未重新挂载)");
console.log("  count:", compState.CompA.count, "(DOM 保留为 5)");
console.log("  生命周期:", [...lifecycleLog]); // [CompA activated]

// ===== 场景2：LRU 淘汰 =====
console.log("\n=== 场景2：LRU 淘汰（max=2）===");
const ka2 = createKeepAlive({ max: 2 });
const view2 = el("div");

ka2.render("CompA", view2, {});
console.log("渲染 A，缓存:", [...ka2.keys].join(",")); // A

ka2.render("CompB", view2, {});
console.log("渲染 B，缓存:", [...ka2.keys].join(",")); // A,B

ka2.render("CompC", view2, {});
console.log("渲染 C，缓存:", [...ka2.keys].join(",")); // B,C (A 被淘汰)

// 切回 A：应该重新挂载（因为被淘汰了）
const beforeA = mountCount.CompA;
ka2.render("CompA", view2, {});
console.log("切回 A，缓存:", [...ka2.keys].join(",")); // C,A (B 被淘汰)
console.log("  A 重新挂载?", mountCount.CompA > beforeA, "(是，因被 LRU 淘汰)");

// ===== 场景3：exclude 排除 =====
console.log("\n=== 场景3：exclude CompC（不被缓存）===");
const ka3 = createKeepAlive({ exclude: ["CompC"], max: 10 });
const view3 = el("div");

ka3.render("CompC", view3, {});
console.log("渲染 C，缓存大小:", ka3.cache.size); // 0 (C 被 exclude)

ka3.render("CompA", view3, {});
console.log("渲染 A，缓存大小:", ka3.cache.size); // 1 (A 被缓存)

// 切回 C：应重新挂载（未被缓存）
const beforeC = mountCount.CompC;
ka3.render("CompC", view3, {});
console.log("切回 C，缓存大小:", ka3.cache.size); // 1 (只有 A)
console.log("  C 重新挂载?", mountCount.CompC > beforeC, "(是，因被 exclude)");

// ===== 场景4：include 正则匹配 =====
console.log("\n=== 场景4：include 正则 /^Comp[AB]$/ ===");
const ka4 = createKeepAlive({ include: /^Comp[AB]$/, max: 10 });
const view4 = el("div");

ka4.render("CompA", view4, {});
console.log("渲染 A，缓存大小:", ka4.cache.size); // 1

ka4.render("CompC", view4, {});
console.log("渲染 C，缓存大小:", ka4.cache.size); // 1 (C 不匹配 include)

console.log("\n=== 总结 ===");
console.log("KeepAlive 核心机制：");
console.log(
  "  1. 切出时 DOM 移到 storageContainer（不销毁），触发 onDeactivated",
);
console.log("  2. 切入时从缓存恢复 DOM（不重新挂载），触发 onActivated");
console.log("  3. 超过 max 时按 LRU 淘汰最久未使用的（真正销毁）");
console.log("  4. include/exclude 控制哪些组件名参与缓存");
