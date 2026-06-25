/**
 * 手写 ResizeObserver 封装
 *
 * ResizeObserver 作用：
 *   - 观察元素尺寸变化（content box）
 *   - 比 window.resize 更精细，能监听单个元素
 *   - 常用于：响应式组件、自适应画布、虚拟列表
 *
 * 封装目标：
 *   1. 链式回调
 *   2. 防抖批量处理
 *   3. 记录上次尺寸便于计算 delta
 *   4. Node 环境：mock 触发验证
 */

function getResizeObserver() {
  if (typeof ResizeObserver !== "undefined") return ResizeObserver;
  class MockRO {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Map();
      MockRO._instances.push(this);
    }
    observe(target) {
      this.targets.set(target, { width: 0, height: 0 });
    }
    unobserve(target) {
      this.targets.delete(target);
    }
    disconnect() {
      this.targets.clear();
    }
    _trigger(target, width, height) {
      this.targets.set(target, { width, height });
      this.callback(
        [
          {
            target,
            contentRect: {
              width,
              height,
              x: 0,
              y: 0,
              top: 0,
              left: 0,
              bottom: height,
              right: width,
            },
          },
        ],
        this,
      );
    }
  }
  MockRO._instances = [];
  return MockRO;
}

const RO = getResizeObserver();

class ResizeWrapper {
  constructor(options = {}) {
    this.debounceMs = options.debounce ?? 0;
    this._sizes = new Map(); // target -> {w,h}
    this._handler = null;
    this._batch = [];
    this._timer = null;

    this.observer = new RO((entries) => this._onResize(entries));
  }

  observe(target, handler) {
    this._handler = handler || this._handler;
    this.observer.observe(target);
    this._sizes.set(target, { w: 0, h: 0 });
    return this;
  }

  onResize(handler) {
    this._handler = handler;
    return this;
  }

  _onResize(entries) {
    if (this.debounceMs > 0) {
      // 防抖窗口内同一 target 只保留最后一次变化，避免重复回调
      if (!this._batchMap) this._batchMap = new Map();
      for (const e of entries) this._batchMap.set(e.target, e);
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        const batch = [...this._batchMap.values()];
        this._batchMap = new Map();
        this._timer = null;
        this._dispatch(batch);
      }, this.debounceMs);
    } else {
      this._dispatch(entries);
    }
  }

  _dispatch(entries) {
    if (!this._handler) return;
    entries.forEach((entry) => {
      const { width, height } = entry.contentRect;
      const prev = this._sizes.get(entry.target) || { w: 0, h: 0 };
      const delta = { dw: width - prev.w, dh: height - prev.h };
      this._sizes.set(entry.target, { w: width, h: height });
      this._handler(entry.target, { width, height }, delta);
    });
  }

  getSize(target) {
    return this._sizes.get(target);
  }

  unobserve(target) {
    this.observer.unobserve(target);
    this._sizes.delete(target);
  }

  disconnect() {
    this.observer.disconnect();
    this._sizes.clear();
    if (this._timer) clearTimeout(this._timer);
  }
}

// 便捷：监听元素并自动调整 canvas 分辨率（避免模糊）
function autoResizeCanvas(canvas) {
  const rw = new ResizeWrapper();
  rw.observe(canvas, (target, { width, height }) => {
    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    target.width = Math.round(width * dpr);
    target.height = Math.round(height * dpr);
    target.style.width = width + "px";
    target.style.height = height + "px";
  });
  return rw;
}

// ===== 测试 =====
(() => {
  const el = { id: "box", style: {}, width: 100, height: 100 };
  const events = [];

  // --- 基本监听 + delta ---
  const rw = new ResizeWrapper();
  rw.observe(el, (target, size, delta) => {
    events.push({ w: size.width, h: size.height, dw: delta.dw, dh: delta.dh });
  });

  rw.observer._trigger(el, 200, 150);
  rw.observer._trigger(el, 300, 150);

  console.log("resize 事件:", events);
  // [{ w:200, h:150, dw:200, dh:150 }, { w:300, h:150, dw:100, dh:0 }]

  // --- 防抖 ---
  const el2 = { id: "box2" };
  const debounced = [];
  const rw2 = new ResizeWrapper({ debounce: 20 });
  rw2.observe(el2, (t, size) => debounced.push(size));
  rw2.observer._trigger(el2, 10, 10);
  rw2.observer._trigger(el2, 20, 20);
  rw2.observer._trigger(el2, 30, 30);

  setTimeout(() => {
    console.log("防抖后只触发一次:", debounced.length); // 1
    console.log("最终尺寸:", debounced[0]); // { width: 30, height: 30 }

    // --- canvas 自适应 ---
    const cv = { id: "canvas", style: {}, width: 0, height: 0 };
    const crw = autoResizeCanvas(cv);
    crw.observer._trigger(cv, 400, 300);
    console.log("canvas 像素尺寸:", cv.width, cv.height); // 400 300 (dpr=1 in Node)
    console.log("canvas CSS 尺寸:", cv.style.width, cv.style.height); // '400px' '300px'

    rw.disconnect();
    rw2.disconnect();
    crw.disconnect();
    console.log("ResizeObserver 演示完成");
  }, 30);
})();
