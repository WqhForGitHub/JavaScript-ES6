/**
 * 手写 Fullscreen API 全屏控制
 *
 * Fullscreen API 作用：
 *   - element.requestFullscreen() 进入全屏
 *   - document.exitFullscreen() 退出全屏
 *   - fullscreenchange / fullscreenerror 事件
 *   - document.fullscreenElement 获取当前全屏元素
 *
 * 实现思路：
 *   1. Promise 化进入/退出全屏
 *   2. 兼容前缀（webkit 等）
 *   3. 切换全屏 toggle
 *   4. 监听变化与错误
 *   5. Node 环境：mock document 全屏方法
 */

function getDocumentEnv() {
  // 注意：不能在函数内再声明 const document，否则 TDZ 会导致 typeof document 抛错
  if (typeof globalThis.document !== "undefined" && globalThis.document) {
    const doc = globalThis.document;
    return {
      document: doc,
      addChange: (fn) => doc.addEventListener("fullscreenchange", fn),
      addError: (fn) => doc.addEventListener("fullscreenerror", fn),
    };
  }
  // Node mock
  const { EventEmitter } = require("events");
  const bus = new EventEmitter();
  const mockDoc = {
    fullscreenElement: null,
    _fsEl: null,
    get fullscreenElement() {
      return this._fsEl;
    },
    exitFullscreen() {
      this._fsEl = null;
      bus.emit("fullscreenchange");
      return Promise.resolve();
    },
  };
  return {
    document: mockDoc,
    addChange: (fn) => bus.on("fullscreenchange", fn),
    addError: (fn) => bus.on("fullscreenerror", fn),
    _request: (el) => {
      mockDoc._fsEl = el;
      bus.emit("fullscreenchange");
      return Promise.resolve();
    },
    _fail: () => bus.emit("fullscreenerror"),
    _mock: true,
  };
}

class FullscreenController {
  constructor() {
    const env = getDocumentEnv();
    this.env = env;
    this.document = env.document;
    this._changeHandlers = [];
    this._errorHandlers = [];

    env.addChange(() =>
      this._changeHandlers.forEach((fn) => fn(this.document.fullscreenElement)),
    );
    env.addError((e) => this._errorHandlers.forEach((fn) => fn(e)));
  }

  // 兼容前缀的 requestFullscreen
  _request(el) {
    // mock 优先：Node 环境下测试元素可能带有空的 requestFullscreen
    if (this.env._mock) return this.env._request(el);
    const fn =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (fn) return fn.call(el);
    return Promise.reject(new Error("不支持全屏"));
  }

  _exit() {
    const fn =
      this.document.exitFullscreen ||
      this.document.webkitExitFullscreen ||
      this.document.msExitFullscreen;
    if (fn) return fn.call(this.document);
    return Promise.reject(new Error("不支持退出全屏"));
  }

  // 进入全屏
  async enter(el) {
    if (this.document.fullscreenElement) await this._exit();
    try {
      await this._request(el);
      return true;
    } catch (e) {
      console.error("[Fullscreen] 进入失败:", e.message);
      return false;
    }
  }

  // 退出全屏
  async exit() {
    if (!this.document.fullscreenElement) return true;
    try {
      await this._exit();
      return true;
    } catch (e) {
      console.error("[Fullscreen] 退出失败:", e.message);
      return false;
    }
  }

  // 切换
  async toggle(el) {
    return this.document.fullscreenElement ? this.exit() : this.enter(el);
  }

  isFullscreen() {
    return !!this.document.fullscreenElement;
  }

  getFullscreenElement() {
    return this.document.fullscreenElement;
  }

  onChange(fn) {
    this._changeHandlers.push(fn);
    return () => this.off(this._changeHandlers, fn);
  }
  onError(fn) {
    this._errorHandlers.push(fn);
    return () => this.off(this._errorHandlers, fn);
  }
  off(arr, fn) {
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }

  // 测试辅助
  _simulateError() {
    if (this.env._mock) this.env._fail();
  }
}

// ===== 测试 =====
(async () => {
  const fc = new FullscreenController();
  const video = { id: "video", requestFullscreen() {} };

  // --- 监听 ---
  const events = [];
  fc.onChange((el) => events.push(el ? `enter:${el.id}` : "exit"));
  fc.onError(() => events.push("error"));

  // --- 进入全屏 ---
  console.log("初始全屏:", fc.isFullscreen()); // false
  await fc.enter(video);
  console.log("进入后全屏:", fc.isFullscreen()); // true
  console.log("全屏元素:", fc.getFullscreenElement().id); // 'video'
  console.log("事件:", events); // ['enter:video']

  // --- 切到其它元素 ---
  const canvas = { id: "canvas", requestFullscreen() {} };
  await fc.enter(canvas);
  console.log("切换后元素:", fc.getFullscreenElement().id); // 'canvas'
  console.log("事件:", events.slice(-1)); // ['enter:canvas']

  // --- toggle 退出 ---
  await fc.toggle(canvas);
  console.log("退出后全屏:", fc.isFullscreen()); // false
  console.log("事件:", events.slice(-1)); // ['exit']

  // --- toggle 再进入 ---
  await fc.toggle(canvas);
  console.log("再进入:", fc.isFullscreen()); // true

  // --- 错误模拟 ---
  fc._simulateError();
  console.log("含错误:", events.includes("error")); // true

  // --- 退出 ---
  await fc.exit();
  console.log("最终全屏:", fc.isFullscreen()); // false

  console.log("Fullscreen API 演示完成");
})();
