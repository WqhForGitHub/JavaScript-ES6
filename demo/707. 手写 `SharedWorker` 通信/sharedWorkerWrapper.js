/**
 * 手写 SharedWorker 通信
 *
 * SharedWorker 特点：
 *   - 多个浏览器标签页共享同一个 worker 实例
 *   - 常用于跨标签页状态同步、共享长连接
 *   - 主线程通过 port 连接，worker 端有 onconnect 事件
 *
 * 封装目标：
 *   1. Promise 化端口通信（请求-响应 + 事件）
 *   2. 维护连接计数
 *   3. Node 环境：用 EventEmitter 模拟端口广播逻辑
 */

const workerScript = `
const connections = []; // 所有连接的 port

self.onconnect = function (e) {
  const port = e.ports[0];
  connections.push(port);
  port.start();

  // 广播连接数变化
  broadcast({ type: 'connections', payload: { count: connections.length } });

  port.onmessage = function (ev) {
    const { id, type, payload } = ev.data;
    if (type === 'ping') {
      port.postMessage({ id, type: 'ping:done', payload: { pong: payload.n + 1 } });
    } else if (type === 'broadcast') {
      // 收到广播请求，转发给所有连接
      broadcast({ type: 'message', payload: { from: payload.from, text: payload.text } });
      port.postMessage({ id, type: 'broadcast:done', payload: { delivered: connections.length } });
    }
  };

  port.onclose = function () {
    const idx = connections.indexOf(port);
    if (idx >= 0) connections.splice(idx, 1);
    broadcast({ type: 'connections', payload: { count: connections.length } });
  };
};

function broadcast(msg) {
  connections.forEach((p) => p.postMessage(msg));
}
`;

// 主线程端口封装
class SharedPortWrapper {
  constructor(port) {
    this.port = port;
    this._callbacks = new Map();
    this._handlers = new Map();
    this._nextId = 1;

    this.port.onmessage = (e) => {
      const { id, type, payload } = e.data;
      if (type.endsWith(":done") && this._callbacks.has(id)) {
        this._callbacks.get(id).resolve(payload);
        this._callbacks.delete(id);
        return;
      }
      this._handlers.get(type)?.forEach((fn) => fn(payload));
    };
    this.port.start?.();
  }

  request(type, payload) {
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      this._callbacks.set(id, { resolve, reject });
      this.port.postMessage({ id, type, payload });
    });
  }

  on(type, fn) {
    if (!this._handlers.has(type)) this._handlers.set(type, new Set());
    this._handlers.get(type).add(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    this._handlers.get(type)?.delete(fn);
  }
}

// 跨环境连接工厂
function connectSharedWorker(script) {
  if (typeof SharedWorker !== "undefined") {
    const sw = new SharedWorker(URL.createObjectURL(new Blob([script])));
    return new SharedPortWrapper(sw.port);
  }
  // Node mock：单进程内用 EventEmitter 模拟多端口共享
  return createMockSharedPort();
}

let mockHub;
function createMockSharedPort() {
  const { EventEmitter } = require("events");
  if (!mockHub) mockHub = new EventEmitter();
  const port = new EventEmitter();
  port.start = () => {};
  port.postMessage = (data) => {
    // 模拟 worker 端处理
    setTimeout(() => {
      const { id, type, payload } = data;
      if (type === "ping") {
        port.emit("message", {
          data: { id, type: "ping:done", payload: { pong: payload.n + 1 } },
        });
      } else if (type === "broadcast") {
        mockHub.emit("message", { from: payload.from, text: payload.text });
        port.emit("message", {
          data: { id, type: "broadcast:done", payload: { delivered: 1 } },
        });
      }
    }, 0);
  };
  port.onmessage = null;
  port.on("message", (e) => port.onmessage && port.onmessage(e));
  // 监听全局广播
  mockHub.on("message", (msg) => {
    port.emit("message", { data: { type: "message", payload: msg } });
  });
  return new SharedPortWrapper(port);
}

// ===== 测试 =====
(async () => {
  const port = connectSharedWorker(workerScript);

  // --- 请求-响应 ---
  const res = await port.request("ping", { n: 41 });
  console.log("pong =", res.pong); // pong = 42

  // --- 事件订阅（模拟第二个标签页广播） ---
  const received = [];
  port.on("message", (msg) => received.push(msg));

  const done = await port.request("broadcast", {
    from: "tab-A",
    text: "hello",
  });
  console.log("delivered =", done.delivered); // delivered = 1
  console.log("收到广播:", received); // [{ from: 'tab-A', text: 'hello' }]

  console.log("SharedWorker 通信演示完成");
})();
