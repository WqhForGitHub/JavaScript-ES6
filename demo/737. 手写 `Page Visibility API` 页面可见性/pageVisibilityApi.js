/**
 * 手写 Page Visibility API 页面可见性
 *
 * Page Visibility API 作用：
 *   - document.visibilityState：visible / hidden / prerender
 *   - visibilitychange 事件：用户切换标签页、最小化窗口时触发
 *   - 常用于：暂停视频/动画、节流轮询、节省资源、统计停留时长
 *
 * 实现思路：
 *   1. 读取可见性状态
 *   2. 监听 visibilitychange
 *   3. 提供可见/隐藏回调
 *   4. 停留时长统计
 *   5. Node 环境：mock document.visibilityState
 */

function getDocumentEnv() {
  if (typeof document !== "undefined") {
    return {
      getVisibility: () => document.visibilityState,
      getHidden: () => document.hidden,
      onChange: (fn) => document.addEventListener("visibilitychange", fn),
    };
  }
  // Node mock
  let state = "visible";
  const listeners = [];
  return {
    getVisibility: () => state,
    getHidden: () => state === "hidden",
    onChange: (fn) => listeners.push(fn),
    _setState: (s) => {
      state = s;
      listeners.forEach((fn) => fn());
    },
    _mock: true,
  };
}

class PageVisibility {
  constructor() {
    const env = getDocumentEnv();
    this.env = env;
    this._visibleHandlers = [];
    this._hiddenHandlers = [];
    this._anyHandlers = [];
    this._visibleSince = Date.now();
    this._totalVisible = 0;
    this._lastState = env.getVisibility();

    env.onChange(() => this._handle());
  }

  _handle() {
    const state = this.env.getVisibility();
    const now = Date.now();
    // 累计可见时长
    if (this._lastState === "visible" && state === "hidden") {
      this._totalVisible += now - this._visibleSince;
      this._hiddenHandlers.forEach((fn) => fn());
    } else if (this._lastState === "hidden" && state === "visible") {
      this._visibleSince = now;
      this._visibleHandlers.forEach((fn) => fn());
    }
    this._lastState = state;
    this._anyHandlers.forEach((fn) => fn(state));
  }

  isVisible() {
    return this.env.getVisibility() === "visible";
  }

  isHidden() {
    return this.env.getHidden();
  }

  get state() {
    return this.env.getVisibility();
  }

  // 可见回调
  onVisible(fn) {
    this._visibleHandlers.push(fn);
    return () => this.off(this._visibleHandlers, fn);
  }
  // 隐藏回调
  onHidden(fn) {
    this._hiddenHandlers.push(fn);
    return () => this.off(this._hiddenHandlers, fn);
  }
  // 任意变化
  onChange(fn) {
    this._anyHandlers.push(fn);
    return () => this.off(this._anyHandlers, fn);
  }

  off(arr, fn) {
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }

  // 获取累计可见时长（ms）
  getVisibleDuration() {
    let total = this._totalVisible;
    if (this.isVisible()) total += Date.now() - this._visibleSince;
    return total;
  }

  // 测试辅助
  _simulate(state) {
    if (this.env._mock) this.env._setState(state);
  }
}

// 便捷：页面隐藏时暂停轮询，可见时恢复
function pauseWhenHidden(pollFn, interval) {
  const pv = new PageVisibility();
  let timer = setInterval(pollFn, interval);
  pv.onHidden(() => {
    clearInterval(timer);
    console.log("[PageVisibility] 页面隐藏，暂停轮询");
  });
  pv.onVisible(() => {
    timer = setInterval(pollFn, interval);
    console.log("[PageVisibility] 页面可见，恢复轮询");
  });
  return () => clearInterval(timer);
}

// ===== 测试 =====
(() => {
  const pv = new PageVisibility();

  // --- 初始状态 ---
  console.log("初始状态:", pv.state); // 'visible'
  console.log("可见:", pv.isVisible()); // true

  // --- 监听 ---
  const events = [];
  pv.onVisible(() => events.push("visible"));
  pv.onHidden(() => events.push("hidden"));
  pv.onChange((s) => events.push(`change:${s}`));

  // --- 模拟切到后台 ---
  pv._simulate("hidden");
  console.log("隐藏后状态:", pv.state); // 'hidden'
  console.log("事件:", events); // ['hidden', 'change:hidden']

  // --- 模拟回到前台 ---
  pv._simulate("visible");
  console.log("事件2:", events.slice(-2)); // ['visible', 'change:visible']

  // --- 停留时长 ---
  // 切到 hidden 时累计了 visible 时长
  const duration = pv.getVisibleDuration();
  console.log("可见时长(ms):", duration >= 0); // true

  // --- 暂停/恢复轮询 ---
  let pollCount = 0;
  const stop = pauseWhenHidden(() => pollCount++, 20);
  setTimeout(() => {
    pv._simulate("hidden"); // 暂停
    setTimeout(() => {
      pv._simulate("visible"); // 恢复
      setTimeout(() => {
        stop();
        console.log("Page Visibility API 演示完成");
      }, 30);
    }, 30);
  }, 30);
})();
