/**
 * 手写 online/offline 网络状态监听
 *
 * online/offline 事件作用：
 *   - 浏览器在网络连接/断开时触发 online/offline 事件
 *   - navigator.onLine 获取当前状态（注意：仅反映是否有连接，不代表可上网）
 *   - 常用于：断网提示、数据同步暂停/恢复、重试机制
 *
 * 实现思路：
 *   1. 封装状态读取与事件监听
 *   2. 支持多回调订阅
 *   3. 网络类型/下行速度查询（navigator.connection）
 *   4. 定期心跳探测真实连通性（navigator.onLine 不完全可靠）
 *   5. Node 环境：mock navigator 与事件
 */

function getNetworkEnv() {
  // Node 22 有全局 navigator，需用 window 判断是否真在浏览器
  if (typeof globalThis.window !== "undefined") {
    return {
      navigator: globalThis.window.navigator,
      addOnline: (fn) => globalThis.window.addEventListener("online", fn),
      addOffline: (fn) => globalThis.window.addEventListener("offline", fn),
    };
  }
  // Node mock
  const { EventEmitter } = require("events");
  const bus = new EventEmitter();
  let online = true;
  const mockNavigator = {
    get onLine() {
      return online;
    },
    connection: {
      effectiveType: "4g",
      downlink: 10,
      rtt: 50,
      addEventListener: (t, fn) => bus.on(t, fn),
    },
  };
  return {
    navigator: mockNavigator,
    addOnline: (fn) => bus.on("online", fn),
    addOffline: (fn) => bus.on("offline", fn),
    _setOnline: (v) => {
      online = v;
      bus.emit(v ? "online" : "offline");
    },
    _mock: true,
  };
}

class NetworkStatus {
  constructor(options = {}) {
    const env = getNetworkEnv();
    this.env = env;
    this.navigator = env.navigator;
    this._onlineHandlers = [];
    this._offlineHandlers = [];
    this._changeHandlers = [];

    env.addOnline(() => this._emit(this._onlineHandlers, true));
    env.addOffline(() => this._emit(this._offlineHandlers, false));

    // 监听 connection 变化（网络质量）
    if (this.navigator.connection?.addEventListener) {
      this.navigator.connection.addEventListener("change", () => {
        this._changeHandlers.forEach((fn) => fn(this.getConnectionInfo()));
      });
    }
  }

  isOnline() {
    return this.navigator.onLine;
  }

  isOffline() {
    return !this.navigator.onLine;
  }

  // 网络连接信息
  getConnectionInfo() {
    const c = this.navigator.connection;
    if (!c) return null;
    return {
      effectiveType: c.effectiveType, // 'slow-2g'|'2g'|'3g'|'4g'
      downlink: c.downlink, // Mbps
      rtt: c.rtt, // 往返时延 ms
      saveData: c.saveData, // 省流模式
    };
  }

  onOnline(fn) {
    this._onlineHandlers.push(fn);
    return () => this.off(this._onlineHandlers, fn);
  }
  onOffline(fn) {
    this._offlineHandlers.push(fn);
    return () => this.off(this._offlineHandlers, fn);
  }
  onConnectionChange(fn) {
    this._changeHandlers.push(fn);
    return () => this.off(this._changeHandlers, fn);
  }

  off(arr, fn) {
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }

  _emit(handlers, isOnline) {
    handlers.forEach((fn) => fn(isOnline));
  }

  /**
   * 心跳探测真实连通性（navigator.onLine 不代表真能上网）
   * @param {string} url 探测地址
   * @param {number} interval 间隔
   */
  startHeartbeat(url = "https://example.com/ping", interval = 30000, onResult) {
    this._heartbeatTimer = setInterval(async () => {
      let reachable = false;
      try {
        const res = await fetch(url, { mode: "no-cors", cache: "no-cache" });
        reachable = res.ok || res.type === "opaque";
      } catch {
        reachable = false;
      }
      onResult?.(reachable);
    }, interval);
    return () => this.stopHeartbeat();
  }

  stopHeartbeat() {
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer);
    this._heartbeatTimer = null;
  }

  // 测试辅助：模拟切换
  _simulate(v) {
    if (this.env._mock) this.env._setOnline(v);
  }
}

// ===== 测试 =====
(() => {
  const ns = new NetworkStatus();

  // --- 初始状态 ---
  console.log("在线:", ns.isOnline()); // true
  console.log("连接信息:", ns.getConnectionInfo());
  // { effectiveType: '4g', downlink: 10, rtt: 50, saveData: undefined }

  // --- 监听上下线 ---
  const events = [];
  ns.onOnline(() => events.push("online"));
  ns.onOffline(() => events.push("offline"));

  // --- 模拟断网 ---
  ns._simulate(false);
  console.log("断网后在线:", ns.isOnline()); // false
  console.log("事件:", events); // ['offline']

  // --- 模拟恢复 ---
  ns._simulate(true);
  console.log("恢复后在线:", ns.isOnline()); // true
  console.log("事件:", events); // ['offline', 'online']

  // --- 便捷判断 ---
  console.log("离线:", ns.isOffline()); // false

  // --- 心跳探测（mock 无 fetch，会捕获异常返回 false）---
  let lastResult = null;
  const stop = ns.startHeartbeat("http://127.0.0.1:1/ping", 50, (ok) => {
    lastResult = ok;
  });
  setTimeout(() => {
    stop();
    console.log("心跳探测结果:", lastResult); // false（连接被拒）
    console.log("online/offline 网络状态监听演示完成");
  }, 200);
})();
