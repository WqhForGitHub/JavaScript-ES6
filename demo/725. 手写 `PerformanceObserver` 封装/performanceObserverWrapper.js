/**
 * 手写 PerformanceObserver 封装
 *
 * PerformanceObserver 作用：
 *   - 异步观察性能条目（paint、navigation、resource、longtask、measure 等）
 *   - 比遍历 performance.getEntries 更高效，不阻塞
 *
 * 封装目标：
 *   1. 按类型订阅性能数据
 *   2. 缓存与汇总（FPS、资源加载、长任务）
 *   3. 上报接口
 *   4. Node 环境：mock perf timing 验证
 */

function getPerformanceObserver() {
  // 仅在真实浏览器环境使用原生 PerformanceObserver；
  // Node 即便有全局 PerformanceObserver（perf_hooks）也不支持 _emit，统一用 mock
  if (
    typeof window !== "undefined" &&
    typeof PerformanceObserver !== "undefined"
  )
    return PerformanceObserver;
  class MockPO {
    constructor(callback) {
      this.callback = callback;
      this.buffer = [];
      this.observing = [];
      MockPO._instances.push(this);
    }
    observe({ entryTypes, type, buffered }) {
      const types = entryTypes || (type ? [type] : []);
      this.observing.push(...types);
      if (buffered) {
        this.callback(this.buffer.slice(), this);
        this.buffer = [];
      }
    }
    disconnect() {
      this.observing = [];
    }
    takeRecords() {
      return [];
    }
    // 测试辅助：注入条目
    _emit(entry) {
      if (this.observing.includes(entry.entryType)) {
        this.callback([entry], this);
      }
    }
    static supportedEntryTypes = [
      "paint",
      "navigation",
      "resource",
      "longtask",
      "measure",
      "mark",
    ];
  }
  MockPO._instances = [];
  return MockPO;
}

const PO = getPerformanceObserver();

class PerformanceWrapper {
  constructor() {
    this._observers = [];
    this._cache = new Map(); // type -> entries[]
    this._reporter = null;
  }

  // 设置上报函数
  setReporter(fn) {
    this._reporter = fn;
    return this;
  }

  // 订阅某类性能条目
  observe(entryType, handler) {
    const po = new PO((entries) => {
      const list = this._cache.get(entryType) || [];
      list.push(...entries);
      this._cache.set(entryType, list);
      entries.forEach((e) => handler(e));
      if (this._reporter) this._reporter(entryType, entries);
    });
    po.observe({ entryTypes: [entryType], buffered: true });
    this._observers.push(po);
    return po;
  }

  // 监听首屏绘制（FCP / LCP）
  onPaint(handler) {
    return this.observe("paint", (e) => {
      if (e.name === "first-contentful-paint" || e.name === "first-paint")
        handler(e);
    });
  }

  // 监听长任务（>50ms）
  onLongTask(handler) {
    return this.observe("longtask", (e) => handler(e));
  }

  // 监听资源加载
  onResource(handler) {
    return this.observe("resource", (e) => handler(e));
  }

  // 监听导航
  onNavigation(handler) {
    return this.observe("navigation", (e) => handler(e));
  }

  // 获取缓存
  getEntries(type) {
    return this._cache.get(type) || [];
  }

  disconnectAll() {
    this._observers.forEach((o) => o.disconnect());
    this._observers = [];
    this._cache.clear();
  }
}

// 计算 FPS（基于 requestAnimationFrame）
class FPSMonitor {
  constructor() {
    this.frames = 0;
    this.lastTime = performance?.now?.() || Date.now();
    this.fps = 0;
    this._raf = null;
  }
  start(onUpdate) {
    const loop = () => {
      this.frames++;
      const now = performance?.now?.() || Date.now();
      if (now - this.lastTime >= 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.frames = 0;
        this.lastTime = now;
        onUpdate?.(this.fps);
      }
      this._raf = (
        typeof requestAnimationFrame !== "undefined"
          ? requestAnimationFrame
          : setTimeout
      )(loop);
    };
    loop();
    return () =>
      this._raf &&
      (typeof cancelAnimationFrame !== "undefined"
        ? cancelAnimationFrame
        : clearTimeout)(this._raf);
  }
}

// ===== 测试 =====
(() => {
  const pw = new PerformanceWrapper();
  const reported = [];
  pw.setReporter((type, entries) =>
    reported.push({ type, count: entries.length }),
  );

  // --- 首屏绘制 ---
  const fcp = [];
  const paintObserver = pw.onPaint((e) => fcp.push(e));
  paintObserver._emit({
    entryType: "paint",
    name: "first-contentful-paint",
    startTime: 1200,
    duration: 0,
  });
  paintObserver._emit({
    entryType: "paint",
    name: "first-paint",
    startTime: 1100,
    duration: 0,
  });
  console.log(
    "FCP 时间:",
    fcp.find((e) => e.name === "first-contentful-paint").startTime,
  ); // 1200

  // --- 长任务 ---
  const longTasks = [];
  const ltObserver = pw.onLongTask((e) => longTasks.push(e));
  ltObserver._emit({ entryType: "longtask", startTime: 5000, duration: 80 });
  ltObserver._emit({ entryType: "longtask", startTime: 6000, duration: 120 });
  console.log("长任务数:", longTasks.length); // 2
  console.log("最长任务:", Math.max(...longTasks.map((t) => t.duration)), "ms"); // 120

  // --- 资源加载 ---
  const resources = [];
  const resObserver = pw.onResource((e) => resources.push(e));
  resObserver._emit({
    entryType: "resource",
    name: "app.js",
    duration: 200,
    transferSize: 50000,
  });
  resObserver._emit({
    entryType: "resource",
    name: "style.css",
    duration: 80,
    transferSize: 12000,
  });
  console.log("资源数:", resources.length); // 2
  const totalTransfer = resources.reduce((s, r) => s + r.transferSize, 0);
  console.log("总传输量:", totalTransfer, "bytes"); // 62000

  // --- 上报 ---
  console.log("上报次数:", reported.length); // 9（每个 observer 初始 buffered 1 次 + 每次 _emit 1 次）

  pw.disconnectAll();
  console.log("PerformanceObserver 演示完成");
})();
