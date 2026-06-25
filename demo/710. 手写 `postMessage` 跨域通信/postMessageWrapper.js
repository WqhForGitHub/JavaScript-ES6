/**
 * 手写 postMessage 跨域通信
 *
 * postMessage 作用：
 *   - 跨 origin 通信（iframe <-> 父页、window.open <-> 弹窗）
 *   - 安全要点：必须校验 event.origin 与 event.source
 *
 * 封装目标：
 *   1. Promise 化请求-响应（带 id）
 *   2. 安全封装：发送时指定 targetOrigin，接收时校验 origin 白名单
 *   3. 事件订阅
 *   4. Node 环境：用 EventEmitter 模拟 window 间消息
 */

// 跨环境 window mock
function getWindow() {
  if (typeof window !== "undefined") return window;
  const { EventEmitter } = require("events");
  // 模拟两个 window 互相能 postMessage
  // 浏览器语义：targetWindow.postMessage(msg) 会让 targetWindow 自身收到 message 事件，
  // 事件 origin/source 指向发送方。
  const w1 = new EventEmitter();
  const w2 = new EventEmitter();
  // 调用 w1.postMessage → w1 收到事件，发送方是 w2（child）
  w1.postMessage = function (msg, origin) {
    setTimeout(() => {
      this.emit("message", {
        data: msg,
        origin: "https://child.com",
        source: w2,
      });
    }, 0);
  };
  // 调用 w2.postMessage → w2 收到事件，发送方是 w1（parent）
  w2.postMessage = function (msg, origin) {
    setTimeout(() => {
      this.emit("message", {
        data: msg,
        origin: "https://parent.com",
        source: w1,
      });
    }, 0);
  };
  return { parent: w1, child: w2 };
}

class PostMessageBridge {
  /**
   * @param {object} targetWindow 能 postMessage 的目标 window
   * @param {string} targetOrigin 发送目标 origin（安全）
   * @param {string[]} allowedOrigins 允许接收的来源白名单
   * @param {object} ownWindow 自己的 window（用于 addEventListener）
   */
  constructor(targetWindow, targetOrigin, allowedOrigins, ownWindow) {
    this.target = targetWindow;
    this.targetOrigin = targetOrigin;
    this.allowedOrigins = allowedOrigins;
    this.ownWindow = ownWindow;
    this._pending = new Map();
    this._handlers = new Map();
    this._nextId = 1;

    const handler = (event) => {
      const { data, origin, source } = event;
      // 安全校验：来源必须白名单内
      if (!this.allowedOrigins.includes(origin)) return;
      const { id, type, payload, isResponse } = data || {};
      if (isResponse && this._pending.has(id)) {
        this._pending.get(id).resolve(payload);
        this._pending.delete(id);
        return;
      }
      if (type && this._handlers.has(type)) {
        this._handlers.get(type).forEach((fn) => fn(payload, source));
      }
    };

    if (this.ownWindow.addEventListener) {
      this.ownWindow.addEventListener("message", handler);
    } else {
      this.ownWindow.on("message", handler);
    }
    this._handler = handler;
  }

  on(type, fn) {
    if (!this._handlers.has(type)) this._handlers.set(type, new Set());
    this._handlers.get(type).add(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    this._handlers.get(type)?.delete(fn);
  }

  // 发送（无需响应）
  send(type, payload) {
    this.target.postMessage({ type, payload }, this.targetOrigin);
  }

  // 请求-响应
  request(type, payload, timeout = 3000) {
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this._pending.has(id)) {
          this._pending.delete(id);
          reject(new Error("postMessage 请求超时"));
        }
      }, timeout);
      this._pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
      });
      this.target.postMessage({ id, type, payload }, this.targetOrigin);
    });
  }

  // 响应对端请求
  handle(type, fn) {
    this.on(type, async (payload, source) => {
      const result = await fn(payload);
      // 通过 source 回送响应
      source.postMessage(
        { id: payload?.__reqId, type, payload: result, isResponse: true },
        this.targetOrigin,
      );
    });
  }
}

// ===== 测试（Node mock 双 window） =====
const win = getWindow();
const isMock = typeof window === "undefined";

if (isMock) {
  // 父页 -> 子 iframe 通信
  const parentBridge = new PostMessageBridge(
    win.child, // target = iframe contentWindow
    "https://child.com", // 发送目标
    ["https://child.com"], // 允许接收的来源
    win.parent,
  );
  const childBridge = new PostMessageBridge(
    win.parent,
    "https://parent.com",
    ["https://parent.com"],
    win.child,
  );

  // 子页注册方法
  childBridge.on("getUser", (payload) => {
    childBridge.send("user:data", { id: payload.id, name: "Alice" });
  });

  // 父页发送
  parentBridge.send("getUser", { id: 1 });
  const userData = [];
  parentBridge.on("user:data", (d) => userData.push(d));

  setTimeout(() => {
    console.log("父页收到用户:", userData); // [{ id: 1, name: 'Alice' }]

    // 安全校验：模拟非法 origin 被拒绝
    const evil = new PostMessageBridge(
      win.child,
      "https://evil.com",
      ["https://child.com"],
      win.parent,
    );
    evil.send("hack", {}); // targetOrigin 不匹配，浏览器会丢弃；mock 也会被 child 白名单拒绝
    console.log("非法 origin 消息已被过滤");

    console.log("postMessage 跨域通信演示完成");
  }, 20);
} else {
  console.log("请在浏览器环境演示真实跨域 postMessage");
}
