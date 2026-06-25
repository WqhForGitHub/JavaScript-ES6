/**
 * 手写 WebSocket 心跳重连
 *
 * WebSocket 心跳重连必要性：
 *   - 长连接可能因网络波动/代理超时断开，且无感知
 *   - 心跳：定时发送 ping，超时未收到 pong 判定断开
 *   - 重连：断开后指数退避重连，避免雪崩
 *
 * 实现思路：
 *   1. 包装原生 WebSocket，提供 Promise 化 send
 *   2. 心跳机制：定时 ping + pong 超时检测
 *   3. 重连：指数退避（1s, 2s, 4s...），上限与最大次数
 *   4. 事件订阅（open/message/close/error/reconnect）
 *   5. Node 环境：用 mock WebSocket 模拟连接与断开
 */

function getWebSocketClass() {
  // 仅在真实浏览器使用原生 WebSocket；Node 即便有全局 WebSocket 也不支持 _serverPush
  if (typeof window !== "undefined" && typeof WebSocket !== "undefined")
    return WebSocket;
  // Node mock
  const { EventEmitter } = require("events");
  class MockWebSocket extends EventEmitter {
    constructor(url) {
      super();
      this.url = url;
      this.readyState = 0; // CONNECTING
      this.OPEN = 1;
      this.CLOSED = 3;
      // 模拟异步连接成功
      setTimeout(() => {
        this.readyState = 1;
        this.emit("open");
      }, 5);
      // 提供给测试模拟服务端推送
      this._serverPush = (data) => this.emit("message", { data });
      this._serverClose = (code, reason) => {
        this.readyState = 3;
        this.emit("close", { code, reason, wasClean: true });
      };
    }
    send(data) {
      /* mock: 假装发出 */
    }
    close() {
      this.readyState = 3;
      this.emit("close", { code: 1000, wasClean: true });
    }
    set onopen(fn) {
      this.on("open", fn);
    }
    set onmessage(fn) {
      this.on("message", fn);
    }
    set onclose(fn) {
      this.on("close", fn);
    }
    set onerror(fn) {
      this.on("error", fn);
    }
    set onpong(fn) {
      this.on("pong", fn);
    }
  }
  MockWebSocket.CONNECTING = 0;
  MockWebSocket.OPEN = 1;
  MockWebSocket.CLOSING = 2;
  MockWebSocket.CLOSED = 3;
  return MockWebSocket;
}

class WebSocketHeartbeat {
  constructor(url, options = {}) {
    this.url = url;
    this.WS = getWebSocketClass();
    this.options = {
      heartbeatInterval: options.heartbeatInterval || 30000, // 心跳间隔
      heartbeatTimeout: options.heartbeatTimeout || 10000, // pong 超时
      reconnectMin: options.reconnectMin || 1000, // 最小重连间隔
      reconnectMax: options.reconnectMax || 30000, // 最大重连间隔
      maxReconnect: options.maxReconnect || Infinity, // 最大重连次数
      pingMessage: options.pingMessage || "ping",
      ...options,
    };
    this.ws = null;
    this.reconnectCount = 0;
    this.manualClose = false;
    this._heartbeatTimer = null;
    this._timeoutTimer = null;
    this._reconnectTimer = null;
    this._handlers = {
      open: [],
      message: [],
      close: [],
      error: [],
      reconnect: [],
    };
    this._msgId = 1;
    this._pending = new Map();
  }

  connect() {
    this.manualClose = false;
    this.ws = new this.WS(this.url);

    this.ws.onopen = () => {
      this.reconnectCount = 0;
      this._startHeartbeat();
      this._emit("open");
    };

    this.ws.onmessage = (event) => {
      const data = event.data;
      // pong 响应：清除超时
      if (data === "pong" || data?.type === "pong") {
        this._onPong();
        return;
      }
      // 请求-响应匹配
      let parsed = data;
      try {
        parsed = JSON.parse(data);
      } catch {}
      if (parsed?.id && this._pending.has(parsed.id)) {
        this._pending.get(parsed.id).resolve(parsed);
        this._pending.delete(parsed.id);
        return;
      }
      this._emit("message", data);
    };

    this.ws.onclose = (event) => {
      this._stopHeartbeat();
      this._emit("close", event);
      if (!this.manualClose) this._reconnect();
    };

    this.ws.onerror = (err) => {
      this._emit("error", err);
    };
  }

  // 心跳
  _startHeartbeat() {
    this._heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState !== this.WS.OPEN) return;
      this.ws.send(this.options.pingMessage);
      // 等待 pong 超时
      this._timeoutTimer = setTimeout(() => {
        console.warn("[WS] 心跳超时，主动断开重连");
        this.ws.close();
      }, this.options.heartbeatTimeout);
    }, this.options.heartbeatInterval);
  }

  _onPong() {
    if (this._timeoutTimer) {
      clearTimeout(this._timeoutTimer);
      this._timeoutTimer = null;
    }
  }

  _stopHeartbeat() {
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer);
    if (this._timeoutTimer) clearTimeout(this._timeoutTimer);
    this._heartbeatTimer = null;
    this._timeoutTimer = null;
  }

  // 指数退避重连
  _reconnect() {
    if (this.reconnectCount >= this.options.maxReconnect) {
      console.error("[WS] 达到最大重连次数，放弃");
      return;
    }
    this.reconnectCount++;
    const delay = Math.min(
      this.options.reconnectMin * Math.pow(2, this.reconnectCount - 1),
      this.options.reconnectMax,
    );
    this._emit("reconnect", { count: this.reconnectCount, delay });
    this._reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  // 事件订阅
  on(event, fn) {
    this._handlers[event]?.push(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    const arr = this._handlers[event];
    if (arr) this._handlers[event] = arr.filter((f) => f !== fn);
  }
  _emit(event, data) {
    this._handlers[event]?.forEach((fn) => fn(data));
  }

  // 发送消息
  send(data) {
    if (this.ws?.readyState !== this.WS.OPEN) {
      console.warn("[WS] 未连接，无法发送");
      return false;
    }
    this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    return true;
  }

  // 请求-响应式发送
  request(type, payload, timeout = 5000) {
    const id = this._msgId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this._pending.has(id)) {
          this._pending.delete(id);
          reject(new Error("请求超时"));
        }
      }, timeout);
      this._pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
      });
      this.send(JSON.stringify({ id, type, payload }));
    });
  }

  close() {
    this.manualClose = true;
    this._stopHeartbeat();
    if (this._reconnectTimer) clearTimeout(this._reconnectTimer);
    this.ws?.close();
  }
}

// ===== 测试 =====
(() => {
  const wsh = new WebSocketHeartbeat("ws://localhost:8080", {
    heartbeatInterval: 200,
    heartbeatTimeout: 100,
    reconnectMin: 50,
    reconnectMax: 400,
    maxReconnect: 3,
  });

  const events = [];
  wsh.on("open", () => events.push("open"));
  wsh.on("message", (d) => events.push("msg:" + d));
  wsh.on("close", () => events.push("close"));
  wsh.on("reconnect", (info) => events.push(`reconnect#${info.count}`));

  wsh.connect();

  // 模拟服务端推送
  setTimeout(() => {
    wsh.ws._serverPush("hello");
    wsh.ws._serverPush("pong"); // 响应心跳
  }, 20);

  // 模拟服务端断开，触发重连
  setTimeout(() => {
    wsh.ws._serverClose(1006, "abnormal");
  }, 300);

  // 验证重连与事件
  setTimeout(() => {
    console.log("事件序列:", events);
    // ['open', 'msg:hello', 'close', 'reconnect#1', 'open', ...]
    console.log("重连次数:", wsh.reconnectCount); // >= 1

    wsh.close();
    console.log("WebSocket 心跳重连演示完成");
  }, 800);
})();
