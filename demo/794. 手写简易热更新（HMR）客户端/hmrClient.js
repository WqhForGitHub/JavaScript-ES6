/**
 * 手写简易热更新（HMR）客户端
 *
 * 功能：接收 WebSocket 热更新消息，替换模块并触发 accept 回调
 * 实现思路：
 *   1. 连接 WebSocket
 *   2. 接收更新消息 { type, module, code }
 *   3. 重新执行模块代码
 *   4. 调用 module.hot.accept 注册的回调
 */

// HMR 客户端（Node.js 环境模拟）
class HMRClient {
  constructor() {
    this.modules = new Map(); // id -> { code, acceptCallbacks: [] }
    this.currentModule = null;
  }

  // 注册模块
  register(id, code, factory) {
    this.modules.set(id, {
      code,
      factory,
      exports: {},
      acceptCallbacks: [],
      disposeCallbacks: [],
    });
  }

  // 执行模块
  execute(id) {
    const mod = this.modules.get(id);
    if (!mod) return null;
    const prev = this.currentModule;
    this.currentModule = id;
    mod.exports = {};
    const hot = {
      accept: (cb) => mod.acceptCallbacks.push(cb),
      dispose: (cb) => mod.disposeCallbacks.push(cb),
    };
    mod.factory(mod.exports, hot);
    this.currentModule = prev;
    return mod.exports;
  }

  // 热更新模块
  hotUpdate(id, newCode, newFactory) {
    const oldMod = this.modules.get(id);
    if (!oldMod) {
      console.log("[HMR] Module not found:", id);
      return false;
    }
    console.log("[HMR] Updating module:", id);
    // 执行 dispose 回调
    oldMod.disposeCallbacks.forEach((cb) => cb());
    // 更新模块
    oldMod.code = newCode;
    oldMod.factory = newFactory;
    oldMod.acceptCallbacks = [];
    oldMod.disposeCallbacks = [];
    oldMod.exports = {};
    // 重新执行
    this.execute(id);
    // 触发 accept 回调
    oldMod.acceptCallbacks.forEach((cb) => cb());
    console.log("[HMR] Module updated:", id);
    return true;
  }

  // 模拟 WebSocket 消息处理
  handleMessage(msg) {
    const data = JSON.parse(msg);
    switch (data.type) {
      case "hot":
        this.hotUpdate(data.module, data.code, data.factory);
        break;
      case "full-reload":
        console.log("[HMR] Full reload required");
        break;
      case "connected":
        console.log("[HMR] Connected to dev server");
        break;
    }
  }
}

// ===== 测试 =====
const hmr = new HMRClient();
let counter = 0;

// 注册初始模块
hmr.register("app", "counter = 0", function (exports, hot) {
  let count = ++counter;
  exports.getCount = () => count;
  hot.accept(() =>
    console.log("[HMR] app accepted update, count still accessible"),
  );
});

hmr.execute("app");
console.log("初始 count:", hmr.modules.get("app").exports.getCount()); // 1

// 模拟热更新
hmr.hotUpdate("app", "counter = 1", function (exports, hot) {
  let count = ++counter;
  exports.getCount = () => count;
  exports.doubled = () => count * 2;
  hot.accept(() => console.log("[HMR] re-accepted"));
});

console.log("更新后 count:", hmr.modules.get("app").exports.getCount()); // 2
console.log("新增方法:", hmr.modules.get("app").exports.doubled()); // 4

// 模拟 WebSocket 消息
hmr.handleMessage(JSON.stringify({ type: "connected" }));
hmr.handleMessage(
  JSON.stringify({
    type: "hot",
    module: "app",
    code: "new",
    factory: function (exports, hot) {
      exports.newProp = true;
      hot.accept(() => {});
    },
  }),
);
console.log("热更新后导出:", hmr.modules.get("app").exports);
