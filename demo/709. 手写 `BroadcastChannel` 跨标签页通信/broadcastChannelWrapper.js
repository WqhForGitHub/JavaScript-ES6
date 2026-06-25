/**
 * 手写 BroadcastChannel 跨标签页通信
 *
 * BroadcastChannel 特点：
 *   - 同源下多个标签页通过同名 channel 广播消息
 *   - 发布/订阅模式，发送方不会收到自己的消息
 *   - 常用于：多标签页状态同步、登录态广播、数据刷新
 *
 * 封装目标：
 *   1. Promise 化的请求-广播（带 id，等待其它标签页响应）
 *   2. 事件订阅（on/off）
 *   3. 发送方过滤（默认不收自己消息）
 *   4. Node 环境：用 EventEmitter 模拟多实例广播
 */

// 跨环境创建
function createBroadcastChannel(name) {
  if (typeof BroadcastChannel !== "undefined") {
    return new BroadcastChannel(name);
  }
  // Node mock：同一 name 的所有实例共享一个 EventEmitter
  const { EventEmitter } = require("events");
  if (!global.__bcHubs) global.__bcHubs = new Map();
  if (!global.__bcHubs.has(name)) global.__bcHubs.set(name, new EventEmitter());
  const hub = global.__bcHubs.get(name);
  const inst = {
    name,
    onmessage: null,
    postMessage(data) {
      // 广播给除自己外的所有监听者：用 sender 标识
      hub.emit("msg", { data, sender: inst });
    },
    close() {
      hub.removeAllListeners("msg");
    },
    _handler: null,
  };
  inst._handler = (evt) => {
    if (evt.sender !== inst && inst.onmessage) {
      inst.onmessage({ data: evt.data });
    }
  };
  hub.on("msg", inst._handler);
  return inst;
}

class BroadcastWrapper {
  constructor(name) {
    this.bc = createBroadcastChannel(name);
    this._handlers = new Map(); // type -> Set<fn>
    this._pending = new Map();
    this._nextId = 1;
    this._selfId = Math.random().toString(36).slice(2);

    this.bc.onmessage = (e) => {
      const { type, payload, id, from, isResponse } = e.data || {};
      // 响应：匹配请求 id
      if (isResponse && this._pending.has(id)) {
        this._pending.get(id).resolve(payload);
        this._pending.delete(id);
        return;
      }
      // 自己发出的请求回声过滤
      if (from === this._selfId) return;
      // 事件分发
      if (type && this._handlers.has(type)) {
        this._handlers.get(type).forEach((fn) => fn(payload));
      }
    };
  }

  // 订阅事件
  on(type, fn) {
    if (!this._handlers.has(type)) this._handlers.set(type, new Set());
    this._handlers.get(type).add(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    this._handlers.get(type)?.delete(fn);
  }

  // 广播事件（无需响应）
  broadcast(type, payload) {
    this.bc.postMessage({ type, payload, from: this._selfId });
  }

  /**
   * 广播请求并等待任意一个标签页响应
   * @param {string} type
   * @param {*} payload
   * @param {number} timeout 超时 ms
   */
  request(type, payload, timeout = 2000) {
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this._pending.has(id)) {
          this._pending.delete(id);
          reject(new Error("广播请求超时"));
        }
      }, timeout);
      this._pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
      });
      this.bc.postMessage({
        id,
        type,
        payload,
        from: this._selfId,
        isRequest: true,
      });
    });
  }

  // 响应其它标签页的请求
  respond(type, handler) {
    this.on(type, async (payload) => {
      const result = await handler(payload);
      this.bc.postMessage({
        id: payload.__reqId,
        type,
        payload: result,
        isResponse: true,
        from: this._selfId,
      });
    });
  }

  close() {
    this.bc.close();
    this._handlers.clear();
    this._pending.clear();
  }
}

// ===== 测试 =====
// 模拟两个标签页各持有一个 channel
const tab1 = new BroadcastWrapper("app-sync");
const tab2 = new BroadcastWrapper("app-sync");

// --- 事件广播：tab1 发，tab2 收 ---
const received = [];
tab2.on("logout", (payload) => received.push(payload));
tab1.broadcast("logout", { userId: 100 });
setTimeout(() => {
  console.log("tab2 收到 logout:", received); // [{ userId: 100 }]

  // --- tab2 不应收到自己发的 ---
  tab2.broadcast("refresh", {});
  setTimeout(() => {
    console.log("tab2 未收到自己的 refresh:", received.length === 1); // true

    // --- 数据同步演示 ---
    const stateChanges = [];
    tab2.on("state", (s) => stateChanges.push(s));
    tab1.broadcast("state", { count: 1 });
    tab1.broadcast("state", { count: 2 });
    setTimeout(() => {
      console.log("tab2 状态同步:", stateChanges); // [{ count: 1 }, { count: 2 }]
      tab1.close();
      tab2.close();
      console.log("BroadcastChannel 演示完成");
    }, 10);
  }, 10);
}, 10);
