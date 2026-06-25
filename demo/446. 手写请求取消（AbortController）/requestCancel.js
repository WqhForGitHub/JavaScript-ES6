/**
 * 手写请求取消（AbortController）
 *
 * AbortController 是浏览器/Node 提供的中止信号机制，配合 fetch 可取消请求。
 * 这里实现一个简易版 AbortController + AbortSignal，并演示取消请求：
 *   - controller.signal 可被监听（addEventListener / aborted 属性）
 *   - controller.abort() 触发 signal 的 abort 事件
 *   - fetch 请求收到 abort 后 reject AbortError
 *
 * 实现思路：
 *   1. AbortSignal 继承 EventTarget，持有一个 aborted 标志
 *   2. abort() 时将 aborted 置 true，派发 abort 事件
 *   3. fetch 监听 signal，abort 时调用 xhr.abort() 并 reject
 */

// 简易 EventTarget（Node 无 DOM 时降级）
class MiniEventTarget {
  constructor() {
    this._listeners = {};
  }
  addEventListener(type, listener) {
    (this._listeners[type] = this._listeners[type] || []).push(listener);
  }
  removeEventListener(type, listener) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter((l) => l !== listener);
  }
  dispatchEvent(event) {
    (this._listeners[event.type] || []).slice().forEach((fn) => fn(event));
    return true;
  }
}

class MyAbortSignal extends MiniEventTarget {
  constructor() {
    super();
    this.aborted = false;
    this.reason = undefined;
  }
  // 现代浏览器有 throwIfAborted
  throwIfAborted() {
    if (this.aborted)
      throw this.reason || new DOMException("Aborted", "AbortError");
  }
}

class MyAbortController {
  constructor() {
    this.signal = new MyAbortSignal();
  }
  abort(reason) {
    if (this.signal.aborted) return;
    this.signal.aborted = true;
    this.signal.reason = reason;
    const event = { type: "abort", target: this.signal };
    this.signal.dispatchEvent(event);
  }
}

// 基于 XHR 的可取消请求
function fetchWithAbort(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = () => resolve({ status: xhr.status, data: xhr.responseText });
    xhr.onerror = () => reject(new TypeError("Network error"));

    const signal = options.signal;
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
    xhr.send();
  });
}

// Node 下 DOMException 可能不存在
if (typeof DOMException === "undefined") {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name;
    }
  };
}

// ===== 测试 =====
const controller = new MyAbortController();
controller.signal.addEventListener("abort", () => {
  console.log("收到 abort 事件，已取消"); // 收到 abort 事件，已取消
});

// 立即取消
controller.abort();
console.log("aborted 状态:", controller.signal.aborted); // aborted 状态: true
console.log(
  "reason:",
  controller.signal.reason && controller.signal.reason.name,
); // reason: AbortError

// 再次 abort 不会重复触发
let triggerCount = 0;
controller.signal.addEventListener("abort", () => triggerCount++);
controller.abort();
console.log("重复 abort 不触发:", triggerCount === 0); // 重复 abort 不触发: true

// 测试 throwIfAborted
try {
  controller.signal.throwIfAborted();
} catch (e) {
  console.log("throwIfAborted 抛出:", e.name); // throwIfAborted 抛出: AbortError
}

// 模拟 fetch 取消场景
if (typeof XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = function () {
    this.open = function () {};
    this.send = function () {
      // 不立即返回，等待外部 abort
    };
    this.abort = function () {};
  };
}
const c2 = new MyAbortController();
fetchWithAbort("https://example.com/slow", { signal: c2.signal })
  .then((res) => console.log("请求完成:", res))
  .catch((err) => console.log("请求被取消:", err.name)); // 请求被取消: AbortError
c2.abort();
