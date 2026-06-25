/**
 * 手写 React 合成事件系统
 *
 * React 17 之前：事件委托到 document；17 之后委托到 root container。
 * 合成事件（SyntheticEvent）的职责：
 *   1) 统一浏览器差异（target / currentTarget / stopPropagation / preventDefault）
 *   2) 事件池：早期复用 SyntheticEvent 对象，事件回调结束后回收、属性清空
 *   3) 批量更新：合成事件触发期间，setState 不立即生效，事件结束后统一 flush
 *
 * 本实现用一个 mock DOM 演示「事件委托 + 合成事件 + 批量更新」。
 */

// ===== mock DOM（支持 addEventListener 与冒泡）=====
class MockElement {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.parentNode = null;
    this._listeners = {}; // 原生监听器（root 委托入口）
    this._handlers = {}; // 组件层注册的合成事件 handler
  }
  appendChild(c) {
    c.parentNode = this;
    this.children.push(c);
    return c;
  }
  addEventListener(type, fn) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  }
  // 模拟原生事件派发：从 target 冒泡到 root，沿途触发 _listeners
  dispatchNativeEvent(type) {
    let node = this;
    while (node) {
      const fns = node._listeners[type];
      if (fns) fns.forEach((fn) => fn({ type, target: this, _stop: false }));
      node = node.parentNode;
    }
  }
}

// ===== 合成事件对象 + 事件池 =====
function SyntheticEvent(nativeEvent) {
  this.nativeEvent = nativeEvent;
  this.target = nativeEvent.target;
  this.currentTarget = nativeEvent.target;
  this.type = nativeEvent.type;
  this._isPropagationStopped = false;
  this._isDefaultPrevented = false;
}
SyntheticEvent.prototype.stopPropagation = function () {
  this._isPropagationStopped = true;
};
SyntheticEvent.prototype.preventDefault = function () {
  this._isDefaultPrevented = true;
};
SyntheticEvent.prototype.isPropagationStopped = function () {
  return this._isPropagationStopped;
};
SyntheticEvent.prototype.destructor = function () {
  // 放回池前清空属性（模拟早期 React 事件池回收）
  this.target = null;
  this.currentTarget = null;
  this.nativeEvent = null;
};

const eventPool = [];
function getPooledEvent(nativeEvent) {
  const e = eventPool.pop() || Object.create(SyntheticEvent.prototype);
  SyntheticEvent.call(e, nativeEvent);
  return e;
}
function releaseEvent(e) {
  e.destructor();
  eventPool.push(e);
}

// ===== 批量更新 =====
let isBatching = false;
const pendingUpdates = [];
function batchedUpdates(fn) {
  const prev = isBatching;
  isBatching = true;
  try {
    fn();
  } finally {
    isBatching = prev;
    if (!isBatching) {
      const updates = pendingUpdates.splice(0);
      updates.forEach((u) => u());
    }
  }
}
function enqueueUpdate(fn) {
  if (isBatching) pendingUpdates.push(fn);
  else fn();
}

// ===== 事件委托到 root =====
const rootListeners = {}; // type -> true
function ensureRootListener(root, type) {
  if (rootListeners[type]) return;
  rootListeners[type] = true;
  root.addEventListener(type, (nativeEvent) => {
    // 委托：所有合成事件在批量更新上下文中派发
    batchedUpdates(() => dispatchEvent(root, type, nativeEvent));
  });
}

// 组件层注册 handler
function addEvent(root, dom, type, handler) {
  ensureRootListener(root, type);
  dom._handlers[type] = handler;
}

// 从 target 向上冒泡，执行沿途 handler
function dispatchEvent(root, type, nativeEvent) {
  let target = nativeEvent.target;
  const synthetic = getPooledEvent(nativeEvent);
  while (target) {
    const handler = target._handlers[type];
    if (handler) {
      synthetic.currentTarget = target;
      handler(synthetic);
      if (synthetic.isPropagationStopped()) break;
    }
    if (target === root) break;
    target = target.parentNode;
  }
  releaseEvent(synthetic);
}

// ===== 测试 =====
const root = new MockElement("#root");
const parent = new MockElement("div");
const child = new MockElement("button");
root.appendChild(parent);
parent.appendChild(child);

// 一个简单的状态容器，演示批量更新
const state = { count: 0 };
function applyCount(next) {
  state.count = next;
  console.log(`  -> count applied: ${next}`);
}

// child 上注册 click
addEvent(root, child, "click", (e) => {
  console.log(
    `child click, target=${e.target.tagName}, currentTarget=${e.currentTarget.tagName}`,
  );
  // 模拟多次 setState：批量更新下只会在事件结束后 flush
  enqueueUpdate(() => applyCount(state.count + 1));
  enqueueUpdate(() => applyCount(state.count + 1)); // 注意：此时 state.count 还没变
  enqueueUpdate(() => applyCount(state.count + 2));
});

// parent 上注册 click（演示冒泡）
addEvent(root, parent, "click", (e) => {
  console.log(
    `parent click (bubble), currentTarget=${e.currentTarget.tagName}`,
  );
});

console.log("--- 触发 child 的原生 click（会冒泡到 root 委托入口）---");
child.dispatchNativeEvent("click");
// 期望：先 child handler 打印，再 parent handler 打印；
//      3 个 enqueueUpdate 在事件结束后统一 flush
console.log("final count =", state.count); // 4（3 个入队更新在事件结束后依次 flush：0->1->2->4）

// 演示 stopPropagation
addEvent(root, child, "dblclick", (e) => {
  e.stopPropagation();
  console.log("child dblclick, stopped propagation");
});
addEvent(root, parent, "dblclick", () => {
  console.log("parent dblclick (should NOT print)");
});
console.log("\n--- 触发 dblclick 并阻止冒泡 ---");
child.dispatchNativeEvent("dblclick");

console.log("\n事件池大小:", eventPool.length); // >= 0（已回收的合成事件对象）
