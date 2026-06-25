/**
 * 手写 requestAnimationFrame 动画循环
 *
 * requestAnimationFrame 作用：
 *   - 在浏览器下一次重绘前调用回调，频率约 60fps
 *   - 比 setTimeout 更平滑、省电，且页面不可见时自动暂停
 *
 * 封装目标：
 *   1. RAFCycle 类：start/stop/pause 控制
 *   2. 支持基于时间的动画（delta time），不受帧率波动影响
 *   3. 支持缓动函数
 *   4. 帧率限制（throttle）
 *   5. Node 环境：用 setTimeout 模拟 rAF
 */

const raf =
  typeof requestAnimationFrame !== "undefined"
    ? requestAnimationFrame
    : (cb) => setTimeout(() => cb(Date.now()), 16);
const caf =
  typeof cancelAnimationFrame !== "undefined"
    ? cancelAnimationFrame
    : (id) => clearTimeout(id);

// 缓动函数集合
const easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  bounce: (t) => {
    const n1 = 7.5625,
      d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

class RAFCycle {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.fps = options.fps || 60; // 帧率上限
    this._rafId = null;
    this._lastTime = 0;
    this._lastFrameTime = 0;
    this._running = false;
    this._paused = false;
    this.frameCount = 0;
    this.elapsed = 0;
  }

  start() {
    if (this._running) return this;
    this._running = true;
    this._paused = false;
    this._lastTime = performance?.now?.() || Date.now();
    this._lastFrameTime = this._lastTime;
    this._loop();
    return this;
  }

  _loop() {
    if (!this._running || this._paused) return;
    this._rafId = raf((now) => {
      const delta = now - this._lastFrameTime;
      const interval = 1000 / this.fps;
      // 帧率限制
      if (delta < interval) {
        this._loop();
        return;
      }
      this._lastFrameTime = now - (delta % interval);
      const dt = now - this._lastTime;
      this._lastTime = now;
      this.elapsed += dt;
      this.frameCount++;
      this.callback({
        dt, // 距上一帧毫秒
        elapsed: this.elapsed,
        frame: this.frameCount,
        now,
      });
      this._loop();
    });
  }

  pause() {
    this._paused = true;
    return this;
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      this._lastTime = performance?.now?.() || Date.now();
      this._loop();
    }
    return this;
  }

  stop() {
    this._running = false;
    this._paused = false;
    if (this._rafId) caf(this._rafId);
    this._rafId = null;
    return this;
  }
}

// 动画过渡：从 from 到 to，duration 内用 easing 函数推进
function animate({
  from,
  to,
  duration,
  ease = "easeOutCubic",
  onUpdate,
  onComplete,
}) {
  const easeFn =
    typeof ease === "function" ? ease : easing[ease] || easing.linear;
  const start = performance?.now?.() || Date.now();
  const cycle = new RAFCycle(({ now }) => {
    const t = Math.min((now - start) / duration, 1);
    const value = from + (to - from) * easeFn(t);
    onUpdate(value, t);
    if (t >= 1) {
      cycle.stop();
      onComplete?.(value);
    }
  });
  cycle.start();
  return cycle;
}

// ===== 测试 =====
(() => {
  // --- RAFCycle 计数（短时运行） ---
  const cycle = new RAFCycle(({ frame }) => {}, { fps: 60 });
  cycle.start();
  setTimeout(() => {
    console.log("运行帧数:", cycle.frameCount, "（约 16ms 内 1-2 帧）");
    cycle.stop();

    // --- animate 过渡 ---
    const samples = [];
    animate({
      from: 0,
      to: 100,
      duration: 200,
      ease: "easeOutCubic",
      onUpdate: (v, t) => samples.push({ v: Math.round(v), t: +t.toFixed(2) }),
      onComplete: (v) => {
        console.log("动画完成值:", v); // 100
        console.log("采样帧数:", samples.length, "（>0，受环境帧率影响）");
        console.log(
          "首帧进度 t:",
          samples[0].t,
          "末帧进度 t:",
          samples[samples.length - 1].t,
        ); // 0.x ... 1
        console.log("末帧值:", samples[samples.length - 1].v); // 100

        // --- 缓动函数验证（确定性）---
        console.log("easeOutCubic(0):", +easing.easeOutCubic(0).toFixed(3)); // 0
        console.log("easeOutCubic(1):", +easing.easeOutCubic(1).toFixed(3)); // 1
        console.log(
          "easeInOutCubic(0.5):",
          +easing.easeInOutCubic(0.5).toFixed(3),
        ); // 0.5
        console.log("bounce(1):", +easing.bounce(1).toFixed(3)); // 1

        console.log("requestAnimationFrame 动画循环演示完成");
      },
    });
  }, 16);
})();
