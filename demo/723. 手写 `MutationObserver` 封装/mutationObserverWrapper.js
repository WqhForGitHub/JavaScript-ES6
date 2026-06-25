/**
 * 手写 MutationObserver 封装
 *
 * MutationObserver 作用：
 *   - 异步观察 DOM 树变化（子节点、属性、文本）
 *   - 常用于：响应式框架、第三方脚本注入检测、编辑器
 *
 * 封装目标：
 *   1. 链式配置（childList/attributes/...）
 *   2. 按变更类型分发回调
 *   3. 防抖批量处理
 *   4. Node 环境：mock DOM 变更事件验证
 */

function getMutationObserver() {
  if (typeof MutationObserver !== "undefined") return MutationObserver;
  class MockMO {
    constructor(callback) {
      this.callback = callback;
      this.target = null;
      this.options = null;
      MockMO._instances.push(this);
    }
    observe(target, options) {
      this.target = target;
      this.options = options;
    }
    disconnect() {
      this.target = null;
    }
    takeRecords() {
      return [];
    }
    _trigger(mutations) {
      this.callback(mutations, this);
    }
  }
  MockMO._instances = [];
  return MockMO;
}

const MO = getMutationObserver();

class MutationWrapper {
  constructor(target, options = {}) {
    this.target = target;
    this.options = {
      childList: true,
      attributes: true,
      subtree: false,
      characterData: false,
      attributeOldValue: false,
      ...options,
    };
    this._handlers = {
      childList: null,
      attributes: null,
      characterData: null,
    };
    this._debounce = null;
    this._batch = [];

    this.observer = new MO((mutations) => this._onMutate(mutations));
    this.observer.observe(target, this.options);
  }

  // 按类型注册回调
  on(type, fn) {
    this._handlers[type] = fn;
    return this;
  }

  // 防抖处理（合并同一 tick 内的多次变更）
  _onMutate(mutations) {
    this._batch.push(...mutations);
    if (this._debounce) return;
    this._debounce = setTimeout(() => {
      const batch = this._batch;
      this._batch = [];
      this._debounce = null;
      this._dispatch(batch);
    }, 0);
  }

  _dispatch(mutations) {
    mutations.forEach((m) => {
      if (m.type === "childList" && this._handlers.childList) {
        this._handlers.childList(m);
      } else if (m.type === "attributes" && this._handlers.attributes) {
        this._handlers.attributes(m);
      } else if (m.type === "characterData" && this._handlers.characterData) {
        this._handlers.characterData(m);
      }
    });
  }

  disconnect() {
    this.observer.disconnect();
    if (this._debounce) clearTimeout(this._debounce);
  }
}

// 便捷：监听子节点添加
function onChildrenAdded(target, fn, options = {}) {
  const mw = new MutationWrapper(target, {
    childList: true,
    subtree: options.subtree || false,
  });
  mw.on("childList", (m) => {
    m.addedNodes?.forEach((node) => fn(node));
  });
  return mw;
}

// 便捷：监听属性变化
function onAttributeChange(target, attributeFilter, fn) {
  const mw = new MutationWrapper(target, { attributes: true, attributeFilter });
  mw.on("attributes", (m) => fn(m.target, m.attributeName, m.oldValue));
  return mw;
}

// ===== 测试 =====
(() => {
  const target = { id: "container" };

  // --- 子节点监听 ---
  const added = [];
  const mw1 = onChildrenAdded(target, (node) => added.push(node));
  mw1.observer._trigger([
    { type: "childList", addedNodes: [{ id: "child1" }], removedNodes: [] },
    { type: "childList", addedNodes: [{ id: "child2" }], removedNodes: [] },
  ]);

  // --- 属性监听 ---
  const attrChanges = [];
  const mw2 = onAttributeChange(
    target,
    ["class", "data-state"],
    (el, attr, old) => {
      attrChanges.push({ attr, old });
    },
  );
  mw2.observer._trigger([
    { type: "attributes", target, attributeName: "class", oldValue: "old" },
    { type: "attributes", target, attributeName: "data-state", oldValue: null },
  ]);

  // 防抖后分发
  setTimeout(() => {
    console.log(
      "新增节点:",
      added.map((n) => n.id),
    ); // ['child1', 'child2']
    console.log("属性变化:", attrChanges); // [{ attr: 'class', old: 'old' }, { attr: 'data-state', old: null }]

    mw1.disconnect();
    mw2.disconnect();
    console.log("MutationObserver 演示完成");
  }, 10);
})();
