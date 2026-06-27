/**
 * 手写全局错误处理
 *
 * 注册全局错误处理器，统一捕获以下三类错误：
 * - 未捕获的同步异常：
 *     Node 环境 -> process.on('uncaughtException')
 *     浏览器    -> window.addEventListener('error')
 * - 未处理的 Promise 拒绝：
 *     Node 环境 -> process.on('unhandledRejection')
 *     浏览器    -> window.addEventListener('unhandledrejection')
 * - 错误事件监听
 *
 * 收集错误报告（含消息、堆栈、时间戳、类型），统一存储与上报。
 * 支持自定义处理器链、按类型过滤、打印报告。
 * 同时兼容 Node 和浏览器环境。
 */

/**
 * 全局错误处理器
 */
class GlobalErrorHandler {
  constructor() {
    /** @type {Array<object>} 错误报告列表 */
    this.reports = [];
    /** @type {Array<(report:object)=>void>} 自定义处理器 */
    this.handlers = [];
    this.isNode =
      typeof window === "undefined" && typeof process !== "undefined";
    this._installed = false;
    this._removeFns = []; // 卸载函数
  }

  /**
   * 安装全局处理器
   */
  install() {
    if (this._installed) return;
    this._installed = true;

    if (this.isNode) {
      // ---- Node 环境 ----
      const onUncaught = (err) => {
        this.capture({
          type: "uncaughtException",
          message: err && err.message ? err.message : String(err),
          stack: err && err.stack ? err.stack : null,
          error: err,
          timestamp: Date.now(),
        });
      };

      const onRejection = (reason) => {
        this.capture({
          type: "unhandledRejection",
          message: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : null,
          reason,
          timestamp: Date.now(),
        });
      };

      process.on("uncaughtException", onUncaught);
      process.on("unhandledRejection", onRejection);

      this._removeFns.push(() => {
        process.removeListener("uncaughtException", onUncaught);
        process.removeListener("unhandledRejection", onRejection);
      });
    } else {
      // ---- 浏览器环境 ----
      const onError = (event) => {
        this.capture({
          type: "error",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error ? event.error.stack : null,
          timestamp: Date.now(),
        });
      };

      const onRejection = (event) => {
        const reason = event.reason;
        this.capture({
          type: "unhandledrejection",
          message: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : null,
          reason,
          timestamp: Date.now(),
        });
      };

      window.addEventListener("error", onError);
      window.addEventListener("unhandledrejection", onRejection);

      this._removeFns.push(() => {
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
      });
    }
  }

  /**
   * 卸载全局处理器
   */
  uninstall() {
    if (!this._installed) return;
    this._removeFns.forEach((fn) => fn());
    this._removeFns = [];
    this._installed = false;
  }

  /**
   * 添加自定义处理器（返回取消订阅函数）
   * @param {(report:object)=>void} handler
   * @returns {() => void}
   */
  on(handler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  /**
   * 捕获错误（核心方法，也可手动调用）
   * @param {object} report
   */
  capture(report) {
    this.reports.push(report);
    // 调用所有自定义处理器（处理器自身出错时忽略，避免无限循环）
    for (const handler of this.handlers) {
      try {
        handler(report);
      } catch (e) {
        // 静默忽略处理器自身错误
      }
    }
  }

  /**
   * 手动捕获一个 Error 对象
   * @param {Error} error
   * @param {string} [type='manual']
   */
  captureError(error, type = "manual") {
    this.capture({
      type,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取所有报告
   */
  getReports() {
    return this.reports.slice();
  }

  /**
   * 按类型过滤
   */
  filterByType(type) {
    return this.reports.filter((r) => r.type === type);
  }

  /**
   * 获取统计
   */
  getStats() {
    const stats = { total: this.reports.length };
    for (const r of this.reports) {
      stats[r.type] = (stats[r.type] || 0) + 1;
    }
    return stats;
  }

  /**
   * 打印所有报告
   */
  printReports() {
    console.log(`\n=== 全局错误报告 (${this.reports.length} 条) ===`);
    for (const r of this.reports) {
      console.log(`\n[${r.type}] ${r.message}`);
      console.log(`  时间: ${new Date(r.timestamp).toISOString()}`);
      if (r.filename)
        console.log(`  位置: ${r.filename}:${r.lineno}:${r.colno}`);
      if (r.stack) console.log(`  堆栈:\n${indent(r.stack, "    ")}`);
    }
  }

  /** 清空报告 */
  clear() {
    this.reports = [];
  }
}

/** 缩进辅助 */
function indent(str, prefix) {
  return str
    .split("\n")
    .map((l) => prefix + l)
    .join("\n");
}

// ===================== 测试用例 =====================

console.log("========== 全局错误处理测试 ==========\n");

const globalHandler = new GlobalErrorHandler();

// 安装全局处理器
globalHandler.install();
console.log(
  "已安装全局错误处理器（环境:",
  globalHandler.isNode ? "Node" : "浏览器",
  "）",
);

// 添加自定义处理器（实时上报模拟）
const unsubscribe = globalHandler.on((report) => {
  console.log(`[自定义处理器] 实时收到: [${report.type}] ${report.message}`);
});

// --- 测试 1：手动捕获错误 ---
console.log("\n--- 测试 1：手动捕获错误 ---");
try {
  JSON.parse("{ invalid json }");
} catch (e) {
  globalHandler.captureError(e, "jsonParse");
}
console.log("报告数量:", globalHandler.getReports().length);

// --- 测试 2：捕获未处理的 Promise 拒绝 ---
console.log("\n--- 测试 2：触发未处理的 Promise 拒集（异步） ---");
// 故意创建一个没有 .catch() 的 rejected Promise
Promise.reject(new Error("忘记 catch 的 Promise 错误"));

// --- 测试 3：捕获同步异常（仅在 Node 下能被 uncaughtException 捕获） ---
// 注意：直接抛出未捕获异常会导致进程退出（即使有监听器也会），
// 因此这里用 setImmediate 模拟，并用 try/catch 包裹演示
console.log("\n--- 测试 3：通过 process 事件模拟未捕获异常 ---");
if (globalHandler.isNode) {
  // 手动 emit 一个 uncaughtException 事件来模拟（不会真正崩溃）
  process.emit("uncaughtException", new Error("模拟的未捕获异常"));
}

// 等待异步错误被捕获后打印报告
setTimeout(() => {
  console.log("\n--- 等待异步错误捕获完成，打印报告 ---");
  globalHandler.printReports();

  console.log("\n--- 统计 ---");
  console.log(globalHandler.getStats());

  // 按类型过滤
  console.log("\n--- 仅 unhandledRejection 类型 ---");
  const rejections = globalHandler.filterByType("unhandledRejection");
  rejections.forEach((r) => console.log(`  [${r.type}] ${r.message}`));

  // 清理
  unsubscribe();
  globalHandler.uninstall();
  console.log("\n已卸载全局错误处理器");
  console.log("\n========== 全局错误处理测试完成 ==========");
}, 100);
