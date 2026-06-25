/**
 * 手写 Fiber 架构调度器
 *
 * Fiber 是一种基于链表的树形结构，每个节点持有 child / sibling / return 三个指针，
 * 使渲染过程可中断、可恢复。核心流程：
 *   1) reconcile：比较新旧 fiber，标记副作用 flags（Placement / Update / Deletion）
 *   2) workLoop：循环执行 performUnitOfWork，每次处理一个 fiber 节点；
 *      时间片耗尽（shouldYield）时让出，剩余工作留到下一个时间片
 *   3) commit：所有 fiber 处理完成后，遍历带 flags 的节点，统一提交到 DOM
 *
 * 调度用 setTimeout（Node）/ MessageChannel（浏览器）模拟 requestIdleCallback。
 */

// ===== Fiber 节点 =====
class FiberNode {
  constructor(tag, type, props) {
    this.tag = tag;
    this.type = type;
    this.props = props || {};
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.alternate = null; // 双缓冲：指向上一次的 fiber
    this.stateNode = null; // 真实 DOM 实例
    this.flags = null; // Placement | Update | Deletion
  }
}

function createFiber(tag, type, props) {
  return new FiberNode(tag, type, props);
}

// 元素构造，字符串子节点自动包成 #text
function el(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" ? { type: "#text", props: { nodeValue: c } } : c,
    );
  return { type, props: { ...(props || {}), children: flat } };
}

// ===== mock DOM =====
function createInstance(type) {
  return { tagName: type, children: [], props: {} };
}

// ===== 协调子节点（双缓冲 diff）=====
const deletions = [];
function reconcileChildren(fiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = fiber.alternate ? fiber.alternate.child : null;
  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element && oldFiber.type === element.type;
    let newFiber = null;
    if (sameType) {
      newFiber = createFiber("HostComponent", element.type, element.props);
      newFiber.stateNode = oldFiber.stateNode;
      newFiber.alternate = oldFiber;
      newFiber.flags = "Update";
    } else if (element) {
      newFiber = createFiber("HostComponent", element.type, element.props);
      newFiber.flags = "Placement";
    }
    if (oldFiber && !sameType) {
      oldFiber.flags = "Deletion";
      deletions.push(oldFiber);
    }
    if (newFiber) newFiber.return = fiber;
    if (index === 0) fiber.child = newFiber;
    else if (prevSibling) prevSibling.sibling = newFiber;
    prevSibling = newFiber;
    if (oldFiber) oldFiber = oldFiber.sibling;
    index++;
  }
  return fiber.child;
}

// ===== 处理单个工作单元 =====
let wipRoot = null;
let nextUnitOfWork = null;
let processedLog = [];
const yieldAfter = 1; // 每个时间片处理 1 个单元（便于演示中断）

function performUnitOfWork(fiber) {
  // 1. 创建/复用 DOM 实例
  if (fiber.type === "#text") {
    if (!fiber.stateNode) {
      fiber.stateNode = {
        tagName: "#text",
        text: fiber.props.nodeValue,
        children: [],
      };
    }
  } else if (!fiber.stateNode && fiber.tag === "HostComponent") {
    fiber.stateNode = createInstance(fiber.type);
    Object.assign(fiber.stateNode.props, fiber.props);
  }
  // 2. 协调子节点
  const children = fiber.props.children || [];
  const arr = Array.isArray(children) ? children : [children];
  reconcileChildren(fiber, arr.filter(Boolean));
  processedLog.push(fiber.type);
  // 3. 深度优先返回下一节点
  if (fiber.child) return fiber.child;
  let next = fiber;
  while (next) {
    if (next.sibling) return next.sibling;
    next = next.return;
  }
  return null;
}

// ===== commit 阶段 =====
let onCommit = null;
function commitRoot() {
  deletions.splice(0).forEach(commitWork);
  commitWork(wipRoot.child);
  wipRoot = null;
  if (typeof onCommit === "function") {
    const cb = onCommit;
    onCommit = null;
    cb();
  }
}

function commitWork(fiber) {
  if (!fiber) return;
  const parent = fiber.return ? fiber.return.stateNode : null;
  if (fiber.flags === "Placement" && parent) {
    parent.children.push(fiber.stateNode);
  } else if (fiber.flags === "Update" && parent) {
    Object.assign(fiber.stateNode.props, fiber.props);
  } else if (fiber.flags === "Deletion" && parent) {
    const idx = parent.children.indexOf(fiber.stateNode);
    if (idx >= 0) parent.children.splice(idx, 1);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// ===== workLoop + 时间切片 =====
function workLoop() {
  let count = 0;
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    count++;
    if (count >= yieldAfter && nextUnitOfWork) {
      console.log(`[yield] processed ${count} unit(s), reschedule...`);
      scheduleWork();
      return;
    }
  }
  commitRoot();
  console.log(
    "[commit] tree committed, traversal order:",
    processedLog.join(" -> "),
  );
}

function scheduleWork() {
  setTimeout(workLoop, 0);
}

function render(element, container) {
  wipRoot = createFiber("HostRoot", "ROOT", { children: [element] });
  wipRoot.stateNode = container;
  nextUnitOfWork = wipRoot;
  processedLog = [];
  deletions.length = 0;
  scheduleWork();
}

// ===== 序列化 mock DOM =====
function serialize(node) {
  if (node.tagName === "#text") return node.text;
  const inner = node.children.map(serialize).join("");
  return `<${node.tagName}>${inner}</${node.tagName}>`;
}

// ===== 测试 =====
const container = createInstance("#root");
const tree = el(
  "div",
  null,
  el("h1", null, "Title"),
  el("ul", null, el("li", null, "a"), el("li", null, "b"), el("li", null, "c")),
);
render(tree, container);

// commit 完成后通过回调打印结果（避免 setTimeout 时间估算不准）
onCommit = () => {
  console.log("result:", serialize(container));
  // <#root><div><h1>Title</h1><ul><li>a</li><li>b</li><li>c</li></ul></div></#root>
};
