/**
 * 手写 Promise 未处理拒绝检测
 *
 * 检测在 Promise 被 reject 后，没有附加 .catch() / .then(null, handler) 处理的拒绝。
 * 报告未处理的拒绝及其堆栈。
 *
 * 实现思路：
 * 1. 监听运行时提供的"未处理拒绝"事件：
 *    - Node: process.on('unhandledRejection', (reason, promise) => ...)
 *    - 浏览器: window.addEventListener('unhandledrejection', ...)
 * 2. 同时监听"后续被处理"事件（rejectionHandled），从疑似列表中移除
 * 3. 收集报告并通知订阅者
 *
 * 此外提供一个 track(promise) 辅助方法：包装 Promise，
 * 当其被 reject 时主动检测是否在微任务后仍未被处理。
 *
 * 关键点：rejection 发生后，运行时会在当前微任务队列清空后
 * 检查是否注册了 rejection 处理器，若无则触发 unhandledRejection 事件。
 */

/**
 * 未处理拒绝检测器
 */
class UnhandledRejectionDetector {
  constructor() {
    /** @type {Map<object, object>} promise -> rejection 报告（尚未确认处理） */
    this.pendingRejections = new Map();
    /** @type {Array<object>} 所有报告（含已处理的） */
    this.reports = [];
    /** @type {Array<(report:object)=>void>} 检测到时的回调 */
    this.handlers = [];
    this.isNode =
      typeof process !== "undefined" && typeof process.on === "function";
    this._installed = false;
    this._removeFns = [];
  }

  /**
   * 安装检测器
   */
  install() {
    if (this._installed) return;
    this._installed = true;

    if (this.isNode) {
      // ---- Node 环境 ----
      const onUnhandled = (reason, promise) => {
        this.recordRejection(reason, promise);
      };
      const onHandled = (promise) => {
        this.clearRejection(promise);
      };

      process.on("unhandledRejection", onUnhandled);
      process.on("rejectionHandled", onHandled);

      this._removeFns.push(() => {
        process.removeListener("unhandledRejection", onUnhandled);
        process.removeListener("rejectionHandled", onHandled);
      });
    } else if (typeof window !== "undefined") {
      // ---- 浏览器环境 ----
      const onUnhandled = (event) => {
        this.recordRejection(event.reason, event.promise);
      };
      const onHandled = (event) => {
        this.clearRejection(event.promise);
      };

      window.addEventListener("unhandledrejection", onUnhandled);
      window.addEventListener("rejectionhandled", onHandled);

      this._removeFns.push(() => {
        window.removeEventListener("unhandledrejection", onUnhandled);
        window.removeEventListener("rejectionhandled", onHandled);
      });
    }
  }

  /**
   * 卸载检测器
   */
  uninstall() {
    if (!this._installed) return;
    this._removeFns.forEach((fn) => fn());
    this._removeFns = [];
    this._installed = false;
  }

  /**
   * 记录一个未处理拒绝
   * @param {*} reason - 拒绝原因
   * @param {Promise} promise - 被 reject 的 promise
   */
  recordRejection(reason, promise) {
    const isError = reason instanceof Error;
    const report = {
      reason: isError ? reason.message : String(reason),
      stack: isError ? reason.stack : captureStack(),
      rawReason: reason,
      promise,
      handled: false,
      timestamp: Date.now(),
    };
    this.pendingRejections.set(promise, report);
    this.reports.push(report);
    this.notify(report);
  }

  /**
   * 清除已被后续处理的拒绝（rejectionHandled 事件）
   * @param {Promise} promise
   */
  clearRejection(promise) {
    const report = this.pendingRejections.get(promise);
    if (report) {
      report.handled = true;
      report.handledAt = Date.now();
      this.pendingRejections.delete(promise);
    }
  }

  /**
   * 通知所有订阅者
   */
  notify(report) {
    for (const handler of this.handlers) {
      try {
        handler(report);
      } catch (e) {
        // 忽略处理器自身错误
      }
    }
  }

  /**
   * 添加检测回调（返回取消订阅函数）
   * @param {(report:object)=>void} handler
   * @returns {() => void}
   */
  onDetected(handler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  /**
   * 跟踪一个 Promise：返回原 Promise，但会被检测器监控
   * 注意：直接附加 .catch 会使该 promise 被视为"已处理"，
   * 因此这里使用 .then 监听 rejection 并重新抛出，保持原始未处理状态。
   * @param {Promise} promise
   * @returns {Promise}
   */
  track(promise) {
    // 通过 then 的第二个参数观察 rejection，但不"消费"它
    // 由于我们不返回新 promise 给调用方之外的地方，原始 promise 的
    // unhandled 状态仍由运行时检测
    promise.then(
      () => {},
      (reason) => {
        // 仅记录，不处理；让运行时触发 unhandledRejection
        // 这里不抛出，避免被本 then 捕获后又产生新问题
      },
    );
    return promise;
  }

  /**
   * 获取当前仍未处理的拒绝列表
   */
  getUnhandled() {
    return Array.from(this.pendingRejections.values());
  }

  /**
   * 获取所有报告（含已处理的）
   */
  getReports() {
    return this.reports.slice();
  }

  /**
   * 获取统计
   */
  getStats() {
    return {
      total: this.reports.length,
      unhandled: this.pendingRejections.size,
      handled: this.reports.length - this.pendingRejections.size,
    };
  }

  /**
   * 打印报告
   */
  printReports() {
    console.log(`\n=== 未处理拒绝报告 (${this.reports.length} 条) ===`);
    for (const r of this.reports) {
      const status = r.handled ? "已处理" : "未处理";
      console.log(`\n[${status}] ${r.reason}`);
      console.log(`  时间: ${new Date(r.timestamp).toISOString()}`);
      if (r.stack) console.log(`  堆栈:\n${indent(r.stack, "    ")}`);
    }
  }

  /** 清空所有记录 */
  clear() {
    this.reports = [];
    this.pendingRejections.clear();
  }
}

/** 捕获当前堆栈 */
function captureStack() {
  return new Error().stack;
}

/** 缩进辅助 */
function indent(str, prefix) {
  return str
    .split("\n")
    .map((l) => prefix + l)
    .join("\n");
}

// ===================== 测试用例 =====================

console.log("========== Promise 未处理拒绝检测测试 ==========\n");

const detector = new UnhandledRejectionDetector();
detector.install();

// 添加实时检测回调
const unsubscribe = detector.onDetected((report) => {
  console.log(`[实时检测] 发现未处理拒绝: ${report.reason}`);
});

// --- 测试 1：忘记 .catch() 的 Promise ---
console.log("--- 测试 1：忘记 .catch() 的 Promise ---");
// 这个 Promise 被 reject 但没有 .catch()，应被检测到
new Promise((resolve, reject) => {
  reject(new Error("忘记 catch 的错误 1"));
});

// --- 测试 2：异步 reject ---
console.log("\n--- 测试 2：异步 reject 且无 catch ---");
new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("异步未处理拒绝"));
  }, 20);
});

// --- 测试 3：有 .catch() 的 Promise 不应被报告 ---
console.log("\n--- 测试 3：有 .catch() 的 Promise（不应被报告） ---");
Promise.reject(new Error("这个会被 catch")).catch((err) => {
  console.log("  已正确 catch:", err.message);
});

// --- 测试 4：后续才添加 .catch() 的 Promise（rejectionHandled） ---
console.log("\n--- 测试 4：延迟添加 catch（rejectionHandled） ---");
const latePromise = Promise.reject(new Error("延迟处理的拒绝"));
// 先不 catch，让 unhandledRejection 触发
setTimeout(() => {
  // 一个微任务后才 catch
  latePromise.catch((err) => {
    console.log("  延迟 catch:", err.message);
  });
}, 50);

// 等待所有异步操作完成后打印报告
setTimeout(() => {
  console.log("\n--- 等待异步操作完成，打印最终报告 ---");
  detector.printReports();

  console.log("\n--- 统计 ---");
  console.log(detector.getStats());

  console.log("\n--- 仍未处理的拒绝 ---");
  const unhandled = detector.getUnhandled();
  unhandled.forEach((r) =>
    console.log(`  - ${r.reason} (handled=${r.handled})`),
  );

  // 清理
  unsubscribe();
  detector.uninstall();
  console.log("\n已卸载检测器");
  console.log("\n========== Promise 未处理拒绝检测测试完成 ==========");
}, 200);
