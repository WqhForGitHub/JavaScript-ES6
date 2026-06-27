/**
 * 手写简易监控 SDK（性能 + 错误 + 行为）
 * ---------------------------------------------------------------
 * 实现一个前端监控 SDK，采集三类数据：
 * 1. 性能指标（模拟）：页面加载耗时、FCP、LCP
 * 2. 错误追踪：JS 异常、Promise rejection、资源加载失败
 * 3. 用户行为：点击、页面访问（PV）、自定义事件
 * 4. 批量上报：事件队列 + 定时 / 满量 flush
 * 5. 采样率控制
 * 6. 隐私过滤：脱敏敏感字段
 *
 * 演示：模拟采集事件并批量输出。
 */

"use strict";

// ============================================================================
// 1. 事件类型与数据结构
// ============================================================================

/**
 * 事件类型枚举
 */
const EventType = {
  PERFORMANCE: "performance", // 性能
  ERROR: "error", // 错误
  BEHAVIOR: "behavior", // 行为
  PV: "pv", // 页面访问
  CUSTOM: "custom", // 自定义
};

/**
 * 需要脱敏的敏感字段名（小写匹配）
 */
const SENSITIVE_FIELDS = new Set([
  "password",
  "pwd",
  "token",
  "secret",
  "creditcard",
  "ssn",
  "phone",
  "mobile",
  "email",
  "idcard",
]);

// ============================================================================
// 2. 工具函数
// ============================================================================

/**
 * 生成唯一 id
 */
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 简易采样判断：以 sampleRate（0~1）概率返回 true
 */
function sampled(sampleRate) {
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;
  return Math.random() < sampleRate;
}

/**
 * 深度脱敏：递归处理对象，把敏感字段的值替换为 '***'
 */
function sanitize(data, depth = 0) {
  if (depth > 5) return "[深度超限]";
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item, depth + 1));
  }
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = "***";
    } else if (typeof value === "object") {
      result[key] = sanitize(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// 3. 事件队列：批量缓冲
// ============================================================================

/**
 * EventQueue：事件缓冲队列
 * 达到 maxBatch 或 flush 间隔时触发上报
 */
class EventQueue {
  /**
   * @param {Object} options
   * @param {number} options.maxBatch 每批最大数量
   * @param {number} options.flushInterval 定时 flush 间隔（毫秒）
   * @param {Function} options.onFlush flush 回调
   */
  constructor(options = {}) {
    this.maxBatch = options.maxBatch ?? 10;
    this.flushInterval = options.flushInterval ?? 5000;
    this.onFlush = options.onFlush || (() => {});
    this.buffer = [];
    this._timer = null;
    this._startTimer();
  }

  _startTimer() {
    if (this.flushInterval > 0) {
      this._timer = setInterval(() => this.flush(), this.flushInterval);
      // Node 中不让定时器阻止进程退出
      if (this._timer.unref) this._timer.unref();
    }
  }

  /** 入队一个事件 */
  enqueue(event) {
    this.buffer.push(event);
    if (this.buffer.length >= this.maxBatch) {
      this.flush();
    }
  }

  /** 立即上报并清空缓冲 */
  flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);
    this.onFlush(batch);
  }

  /** 当前缓冲数量 */
  size() {
    return this.buffer.length;
  }

  /** 销毁队列 */
  destroy() {
    if (this._timer) clearInterval(this._timer);
    this.flush();
  }
}

// ============================================================================
// 4. 上报通道（模拟）
// ============================================================================

/**
 * Reporter：模拟上报通道
 * 真实场景下使用 navigator.sendBeacon / fetch / Image
 */
class Reporter {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.sentBatches = []; // 记录已发送批次（演示用）
    this.totalSent = 0;
    this.failedCount = 0;
  }

  /** 发送一批事件 */
  async send(batch) {
    // 模拟网络请求
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟 10% 失败率
        const success = Math.random() > 0.1;
        if (success) {
          this.sentBatches.push(batch);
          this.totalSent += batch.length;
          resolve({ ok: true, count: batch.length });
        } else {
          this.failedCount += batch.length;
          resolve({ ok: false, count: batch.length, error: "network error" });
        }
      }, 5);
    });
  }

  /** 统计 */
  stats() {
    return {
      endpoint: this.endpoint,
      batches: this.sentBatches.length,
      totalSent: this.totalSent,
      failedCount: this.failedCount,
    };
  }
}

// ============================================================================
// 5. 监控 SDK 主体
// ============================================================================

/**
 * Monitor：监控 SDK
 */
class Monitor {
  /**
   * @param {Object} options
   * @param {string} options.endpoint 上报地址
   * @param {number} options.sampleRate 总采样率（0~1）
   * @param {number} options.maxBatch
   * @param {number} options.flushInterval
   * @param {boolean} options.enablePerformance
   * @param {boolean} options.enableError
   * @param {boolean} options.enableBehavior
   * @param {string} options.appId 应用标识
   * @param {string} options.userId 用户标识
   */
  constructor(options = {}) {
    this.options = {
      endpoint: "/report",
      sampleRate: 1,
      maxBatch: 10,
      flushInterval: 5000,
      enablePerformance: true,
      enableError: true,
      enableBehavior: true,
      appId: "default",
      ...options,
    };

    this.sessionId = genId();
    this.startTime = Date.now();

    // 上报器
    this.reporter = new Reporter(this.options.endpoint);

    // 事件队列
    this.queue = new EventQueue({
      maxBatch: this.options.maxBatch,
      flushInterval: this.options.flushInterval,
      onFlush: (batch) => this._handleFlush(batch),
    });

    // 存储安装的监听器引用，便于卸载
    this._listeners = [];

    // 最近的错误（用于关联）
    this._lastError = null;
  }

  // --------------------------------------------------------------------------
  // 初始化与各模块启用
  // --------------------------------------------------------------------------

  /** 初始化所有启用的模块 */
  init() {
    if (this.options.enablePerformance) this._initPerformance();
    if (this.options.enableError) this._initErrorTracking();
    if (this.options.enableBehavior) this._initBehaviorTracking();
    console.log(
      `[Monitor] 初始化完成，appId=${this.options.appId}, sessionId=${this.sessionId}`,
    );
  }

  /**
   * 性能监控（模拟）
   * 真实场景用 PerformanceObserver / performance.timing
   */
  _initPerformance() {
    // 模拟采集
    setTimeout(() => {
      const metrics = {
        pageLoadTime: Math.round(Math.random() * 2000 + 500), // 500~2500ms
        fcp: Math.round(Math.random() * 1500 + 300), // First Contentful Paint
        lcp: Math.round(Math.random() * 2500 + 800), // Largest Contentful Paint
        ttfb: Math.round(Math.random() * 400 + 50), // Time to First Byte
        domReady: Math.round(Math.random() * 1000 + 200),
      };
      this.track({
        type: EventType.PERFORMANCE,
        name: "page_metrics",
        data: metrics,
        level: "info",
      });
      console.log("[Monitor] 采集性能指标:", metrics);
    }, 50);
  }

  /**
   * 错误追踪：模拟 window.onerror / unhandledrejection / resource error
   * 由于 Node 环境无 window，这里提供 captureError 方法供主动调用
   */
  _initErrorTracking() {
    // 在浏览器中，这里会绑定 window.addEventListener('error', ...) 等
    // Node 环境下我们模拟接口，由调用方主动 capture
  }

  /**
   * 行为追踪：模拟 click / PV
   */
  _initBehaviorTracking() {
    // 浏览器中会绑定 document.addEventListener('click', ...) 等
  }

  // --------------------------------------------------------------------------
  // 主动上报接口
  // --------------------------------------------------------------------------

  /**
   * 核心方法：跟踪一个事件（经过采样 + 脱敏后入队）
   */
  track(event) {
    // 采样
    if (!sampled(this.options.sampleRate)) {
      return false;
    }
    // 包装事件
    const wrapped = {
      id: genId(),
      appId: this.options.appId,
      sessionId: this.sessionId,
      userId: this.options.userId || null,
      type: event.type,
      name: event.name,
      data: sanitize(event.data || {}),
      level: event.level || "info",
      timestamp: event.timestamp || Date.now(),
      url: event.url || null,
    };
    this.queue.enqueue(wrapped);
    return true;
  }

  /** 捕获 JS 错误 */
  captureError(error, context = {}) {
    const event = {
      type: EventType.ERROR,
      name: "js_error",
      level: "error",
      data: {
        message: error.message || String(error),
        stack: error.stack || null,
        name: error.name || "Error",
        ...context,
      },
    };
    this._lastError = event;
    return this.track(event);
  }

  /** 捕获 Promise rejection */
  captureRejection(reason, context = {}) {
    return this.track({
      type: EventType.ERROR,
      name: "promise_rejection",
      level: "error",
      data: {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : null,
        ...context,
      },
    });
  }

  /** 捕获资源加载失败 */
  captureResourceError(url, tagName = "img", context = {}) {
    return this.track({
      type: EventType.ERROR,
      name: "resource_error",
      level: "warning",
      data: { url, tagName, ...context },
    });
  }

  /** 记录页面访问 */
  trackPageView(url, title = "") {
    return (
      this.track({
        type: EventType.PV,
        name: "page_view",
        data: { url, title, referrer: this._lastPageUrl || null },
        url,
      }) && ((this._lastPageUrl = url), true)
    );
  }

  /** 记录点击行为 */
  trackClick(target, text = "") {
    return this.track({
      type: EventType.BEHAVIOR,
      name: "click",
      data: { target, text: text.slice(0, 50) },
    });
  }

  /** 记录自定义事件 */
  trackCustom(name, data = {}, level = "info") {
    return this.track({
      type: EventType.CUSTOM,
      name,
      data,
      level,
    });
  }

  // --------------------------------------------------------------------------
  // 上报
  // --------------------------------------------------------------------------

  /** 队列 flush 回调 */
  async _handleFlush(batch) {
    console.log(
      `[Monitor] flush 一批 ${batch.length} 条事件到 ${this.options.endpoint}`,
    );
    const result = await this.reporter.send(batch);
    if (!result.ok) {
      console.warn(`[Monitor] 上报失败，丢失 ${result.count} 条`);
      // 真实场景可重试或落本地存储
    }
    return result;
  }

  /** 手动 flush */
  flush() {
    this.queue.flush();
  }

  // --------------------------------------------------------------------------
  // 状态查询
  // --------------------------------------------------------------------------

  /** 当前队列中待上报数量 */
  pendingCount() {
    return this.queue.size();
  }

  /** 上报统计 */
  reporterStats() {
    return this.reporter.stats();
  }

  /** 销毁 */
  destroy() {
    this.queue.destroy();
    this._listeners.forEach(({ target, type, handler }) => {
      try {
        target.removeEventListener(type, handler);
      } catch {}
    });
    this._listeners = [];
    console.log("[Monitor] 已销毁");
  }
}

// ============================================================================
// 6. 测试用例
// ============================================================================

async function runTests() {
  console.log("================ 1. 初始化监控 SDK ================");
  const monitor = new Monitor({
    endpoint: "https://api.example.com/report",
    appId: "demo-app",
    userId: "user-001",
    sampleRate: 1, // 全采样
    maxBatch: 5, // 5 条触发上报
    flushInterval: 200, // 200ms 定时 flush
    enablePerformance: true,
    enableError: true,
    enableBehavior: true,
  });
  monitor.init();

  console.log("\n================ 2. 采集性能指标 ================");
  // 性能指标在 init 后 50ms 自动采集，等待一下
  await sleep(80);
  console.log("当前队列:", monitor.pendingCount());

  console.log("\n================ 3. 采集页面访问 ================");
  monitor.trackPageView("/home", "首页");
  monitor.trackPageView("/products", "产品列表");
  monitor.trackPageView("/cart", "购物车");
  console.log("当前队列:", monitor.pendingCount());

  console.log("\n================ 4. 采集点击行为 ================");
  monitor.trackClick("#buy-button", "立即购买");
  monitor.trackClick("#nav-menu", "菜单");
  console.log("当前队列:", monitor.pendingCount());
  // 上面已满 5 条（性能1 + PV3 + 点击1 = 5? 实际性能1+PV3+点击1 = 5? 算一下）

  console.log("\n================ 5. 等待定时 flush ================");
  await sleep(250);
  console.log("flush 后队列:", monitor.pendingCount());

  console.log("\n================ 6. 捕获错误 ================");
  // 模拟 JS 错误
  try {
    null.foo();
  } catch (e) {
    monitor.captureError(e, { page: "/cart", action: "checkout" });
  }
  // 模拟 Promise rejection
  monitor.captureRejection(new Error("异步数据获取失败"), {
    api: "/api/order",
  });
  // 模拟资源加载失败
  monitor.captureResourceError("https://cdn.example.com/missing.png", "img");
  console.log("当前队列:", monitor.pendingCount());

  console.log("\n================ 7. 自定义事件 ================");
  monitor.trackCustom("search", { keyword: "手机", results: 42 });
  monitor.trackCustom("add_to_cart", { sku: "SKU123", count: 2, price: 999 });

  console.log("\n================ 8. 隐私脱敏验证 ================");
  // 包含敏感字段的事件
  monitor.trackCustom("login", {
    username: "alice",
    password: "secret123", // 应脱敏
    token: "jwt-abc-def", // 应脱敏
    email: "alice@example.com", // 应脱敏
    profile: {
      phone: "13800138000", // 应脱敏
      age: 25, // 正常
      address: "某市某街", // 正常
    },
  });
  monitor.flush();
  await sleep(30);
  // 找到刚才上报的 login 事件
  const loginBatch = monitor.reporter.sentBatches
    .flat()
    .find((e) => e.name === "login");
  console.log(
    "脱敏后的 login 事件 data:",
    JSON.stringify(loginBatch.data, null, 2),
  );

  console.log("\n================ 9. 采样率测试 ================");
  const lowSampleMonitor = new Monitor({
    endpoint: "/report",
    appId: "low-sample",
    sampleRate: 0.3, // 30% 采样
    maxBatch: 1000,
    flushInterval: 0,
  });
  let tracked = 0;
  for (let i = 0; i < 100; i++) {
    if (lowSampleMonitor.trackCustom("test", { i })) tracked++;
  }
  console.log(`采样率 0.3 下，100 个事件入队 ${tracked} 个（约 30 个）`);

  console.log("\n================ 10. 批量上报统计 ================");
  await sleep(30);
  console.log("主 monitor 上报统计:", monitor.reporterStats());

  console.log("\n================ 11. 事件类型分布 ================");
  const allEvents = monitor.reporter.sentBatches.flat();
  const distribution = {};
  for (const e of allEvents) {
    distribution[e.type] = (distribution[e.type] || 0) + 1;
  }
  console.log("已上报事件总数:", allEvents.length);
  console.log("按类型分布:", distribution);

  console.log("\n================ 12. 销毁 SDK ================");
  monitor.destroy();
  console.log("销毁后队列:", monitor.pendingCount());
}

/** 工具：sleep */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

runTests();
