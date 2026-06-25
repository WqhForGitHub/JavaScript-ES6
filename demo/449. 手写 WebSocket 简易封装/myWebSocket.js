/**
 * 手写 WebSocket 简易封装
 *
 * WebSocket 提供全双工通信。这里封装原生 WebSocket，提供：
 *   - 基于 EventEmitter 的事件订阅（open/message/close/error）
 *   - send 方法自动等待连接就绪
 *   - 自动重连机制（指数退避）
 *   - 心跳保活
 *
 * 实现思路：
 *   1. 构造时创建 WebSocket 实例
 *   2. 转发原生事件到内部 emitter
 *   3. send 时若未连接则缓存或等待 open
 *   4. close 事件触发后按策略重连
 *   5. 定时发送心跳包维持连接
 */

class EventEmitter {
  constructor() {
    this._events = {};
  }
  on(type, fn) {
    (this._events[type] = this._events[type] || []).push(fn);
    return this;
  }
  off(type, fn) {
    if (!this._events[type]) return this;
    this._events[type] = this._events[type].filter((f) => f !== fn);
    return this;
  }
  emit(type, ...args) {
    (this._events[type] || []).slice().forEach((fn) => fn(...args));
  }
}

class MyWebSocket extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.url = url;
    this.options = Object.assign(
      {
        protocols: undefined,
        reconnect: true,
        reconnectInterval: 1000,
        maxReconnectInterval: 30000,
        maxReconnectAttempts: Infinity,
        heartbeatInterval: 30000,
        heartbeatMessage: "ping",
      },
      options,
    );

    this.ws = null;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.manualClose = false;
    this._messageQueue = [];

    this._connect();
  }

  _connect() {
    const { protocols } = this.options;
    // Node 环境用传入的 WS 实现或 mock
    const WSImpl =
      typeof WebSocket !== "undefined" ? WebSocket : this.options.WebSocketImpl;
    if (!WSImpl) {
      // 无可用实现，仅做事件演练
      this.emit("error", new Error("No WebSocket implementation"));
      return;
    }
    this.ws = protocols
      ? new WSImpl(this.url, protocols)
      : new WSImpl(this.url);

    this.ws.onopen = (event) => {
      this.reconnectAttempts = 0;
      this._startHeartbeat();
      this._flushQueue();
      this.emit("open", event);
    };

    this.ws.onmessage = (event) => {
      this.emit("message", event.data, event);
    };

    this.ws.onerror = (event) => {
      this.emit("error", event);
    };

    this.ws.onclose = (event) => {
      this._stopHeartbeat();
      this.emit("close", event);
      if (this.options.reconnect && !this.manualClose) {
        this._reconnect();
      }
    };
  }

  _reconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit("error", new Error("Max reconnect attempts reached"));
      return;
    }
    this.reconnectAttempts++;
    const base = this.options.reconnectInterval;
    const max = this.options.maxReconnectInterval;
    const delay = Math.min(base * Math.pow(2, this.reconnectAttempts - 1), max);
    this.reconnectTimer = setTimeout(() => this._connect(), delay);
  }

  _startHeartbeat() {
    const { heartbeatInterval, heartbeatMessage } = this.options;
    if (heartbeatInterval <= 0) return;
    this.heartbeatTimer = setInterval(() => {
      this.send(heartbeatMessage);
    }, heartbeatInterval);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _flushQueue() {
    while (this._messageQueue.length) {
      const msg = this._messageQueue.shift();
      this.ws.send(msg);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === 1 /* OPEN */) {
      this.ws.send(data);
    } else {
      this._messageQueue.push(data);
    }
  }

  close(code, reason) {
    this.manualClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this._stopHeartbeat();
    if (this.ws) this.ws.close(code, reason);
  }
}

// ===== 测试（使用 mock WebSocket） =====
class MockWebSocket extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    setTimeout(() => {
      this.readyState = 1;
      this.emit("open");
    }, 0);
  }
  send(data) {
    this.sent.push(data);
  }
  close() {
    this.readyState = 3;
    this.emit("close", { code: 1000 });
  }
  // 模拟服务端推消息
  serverPush(data) {
    this.emit("message", { data });
  }
}

const ws = new MyWebSocket("ws://localhost:8080", {
  WebSocketImpl: MockWebSocket,
  reconnect: false,
  heartbeatInterval: 0,
});

ws.on("open", () => {
  console.log("连接已打开");
  ws.send("hello server");
});

ws.on("message", (data) => {
  console.log("收到消息:", data);
});

ws.on("close", () => console.log("连接关闭"));

setTimeout(() => {
  // 模拟服务端推送
  ws.ws.serverPush("hi from server");
  console.log("已发送缓存消息:", ws.ws.sent); // 已发送缓存消息: [ 'hello server' ]
  ws.close();
}, 20);
