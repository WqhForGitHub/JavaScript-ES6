/**
 * 手写错误边界捕获（Error Boundary）
 *
 * 类似 React Error Boundary 的概念，但在原生 JS 中实现。
 * 一个包装器，捕获函数/回调执行中的错误，调用错误处理器而非让程序崩溃。
 *
 * 支持：
 * - 同步错误捕获（try/catch 包装）
 * - 异步错误捕获（自动捕获返回的 Promise 的 rejection）
 * - 错误恢复（返回 fallback 值）
 * - 错误状态跟踪（hasError、错误历史）
 * - 错误重置（reset 后可继续正常使用）
 *
 * 用法：
 *   const boundary = new ErrorBoundary(handler).setFallback(defaultValue);
 *   const safeFn = boundary.wrap(riskyFn);
 *   safeFn(...)  // 出错时返回 fallback 而非抛出
 */

/**
 * 错误边界
 */
class ErrorBoundary {
  /**
   * @param {(error:Error, context:any)=>void} [handler] - 错误处理回调
   */
  constructor(handler) {
    this.handler =
      handler ||
      ((error, context) => {
        console.error(
          `[ErrorBoundary] 捕获错误: ${error.message}`,
          context || "",
        );
      });
    /** @type {Array<object>} 错误历史 */
    this.errors = [];
    /** 是否处于错误状态 */
    this.hasError = false;
    /** 默认 fallback 值 */
    this.fallback = undefined;
    /** 是否已设置 fallback */
    this._hasFallback = false;
  }

  /**
   * 设置 fallback 值（出错时返回该值）
   * @param {*} value
   * @returns {ErrorBoundary} this（链式）
   */
  setFallback(value) {
    this.fallback = value;
    this._hasFallback = true;
    return this;
  }

  /**
   * 包裹同步函数（若返回 Promise 也会自动捕获）
   * @param {Function} fn - 原始函数
   * @param {any} [context] - 上下文信息（用于错误处理）
   * @returns {Function} 包装后的函数
   */
  wrap(fn, context) {
    const self = this;
    return function (...args) {
      try {
        const result = fn.apply(this, args);
        // 如果返回的是 Promise，则捕获其 rejection
        if (result && typeof result.then === "function") {
          return result.catch((err) => self.handleError(err, context));
        }
        return result;
      } catch (err) {
        return self.handleError(err, context);
      }
    };
  }

  /**
   * 包裹异步函数（始终返回 Promise）
   * @param {Function} fn - 原始 async 函数
   * @param {any} [context]
   * @returns {Function} 包装后的 async 函数
   */
  wrapAsync(fn, context) {
    const self = this;
    return async function (...args) {
      try {
        return await fn.apply(this, args);
      } catch (err) {
        return self.handleError(err, context);
      }
    };
  }

  /**
   * 包裹事件回调（捕获同步错误，不阻止事件循环）
   * @param {Function} fn
   * @param {any} [context]
   * @returns {Function}
   */
  wrapCallback(fn, context) {
    const self = this;
    return function (...args) {
      try {
        const result = fn.apply(this, args);
        if (result && typeof result.then === "function") {
          result.catch((err) => self.handleError(err, context));
        }
      } catch (err) {
        self.handleError(err, context);
      }
    };
  }

  /**
   * 安全执行一个函数（一次性）
   * @param {Function} fn
   * @param {any} [context]
   * @returns {*}
   */
  tryRun(fn, context) {
    try {
      const result = fn();
      if (result && typeof result.then === "function") {
        return result.catch((err) => this.handleError(err, context));
      }
      return result;
    } catch (err) {
      return this.handleError(err, context);
    }
  }

  /**
   * 处理错误（内部方法）
   * @param {Error} error
   * @param {any} context
   * @returns {*} fallback 值（若设置）
   */
  handleError(error, context) {
    this.hasError = true;
    const errorRecord = {
      error,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    };
    this.errors.push(errorRecord);
    this.handler(error, context);
    return this.fallback;
  }

  /**
   * 重置错误状态（清除错误历史，hasError 置 false）
   */
  reset() {
    this.hasError = false;
    this.errors = [];
  }

  /**
   * 获取错误历史
   * @returns {object[]}
   */
  getErrors() {
    return this.errors.slice();
  }

  /**
   * 获取错误数量
   */
  get errorCount() {
    return this.errors.length;
  }
}

// ===================== 测试用例 =====================

console.log("========== 错误边界捕获测试 ==========\n");

// --- 测试 1：捕获同步错误 ---
console.log("--- 测试 1：捕获同步错误 ---");
const boundary1 = new ErrorBoundary((err, ctx) => {
  console.log(`  处理器收到错误: ${err.message}, 上下文: ${ctx}`);
}).setFallback("默认值");

function riskySync(x) {
  if (x < 0) throw new Error("不能为负数: " + x);
  return x * 2;
}

const safeRisky = boundary1.wrap(riskySync, "riskySync");
console.log("正常调用 safeRisky(5):", safeRisky(5));
console.log("出错调用 safeRisky(-1):", safeRisky(-1)); // 返回 fallback
console.log("hasError:", boundary1.hasError);
console.log("错误数量:", boundary1.errorCount);

// --- 测试 2：捕获异步错误（Promise） ---
console.log("\n--- 测试 2：捕获异步错误 ---");
const boundary2 = new ErrorBoundary((err) => {
  console.log(`  异步错误处理器: ${err.message}`);
}).setFallback(null);

function riskyAsync(x) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (x < 0) reject(new Error("异步失败: " + x));
      else resolve(x * 10);
    }, 10);
  });
}

const safeAsync = boundary2.wrapAsync(riskyAsync, "riskyAsync");

(async () => {
  console.log("正常调用 await safeAsync(3):", await safeAsync(3));
  console.log("出错调用 await safeAsync(-1):", await safeAsync(-1)); // 返回 fallback null
  console.log("异步错误数量:", boundary2.errorCount);

  // --- 测试 3：wrap 也捕获返回 Promise 的同步函数 ---
  console.log("\n--- 测试 3：wrap 自动捕获 Promise rejection ---");
  const boundary3 = new ErrorBoundary((err) => {
    console.log(`  Promise 错误: ${err.message}`);
  }).setFallback("fallback");

  function returnsPromise() {
    return Promise.reject(new Error("Promise 被拒绝"));
  }
  const wrappedPromise = boundary3.wrap(returnsPromise);
  const result = await wrappedPromise();
  console.log("wrap 返回 Promise 出错后结果:", result);

  // --- 测试 4：错误历史与重置 ---
  console.log("\n--- 测试 4：错误历史与重置 ---");
  const boundary4 = new ErrorBoundary().setFallback(0);
  const fail = boundary4.wrap(() => {
    throw new Error("失败1");
  });
  fail();
  fail();
  fail();
  console.log("错误历史数量:", boundary4.errorCount);
  console.log("第一条错误:", boundary4.getErrors()[0].message);
  boundary4.reset();
  console.log(
    "reset 后 hasError:",
    boundary4.hasError,
    ", 错误数量:",
    boundary4.errorCount,
  );

  // --- 测试 5：不设置 fallback 时返回 undefined ---
  console.log("\n--- 测试 5：无 fallback 时返回 undefined ---");
  const boundary5 = new ErrorBoundary((err) => {
    console.log(`  捕获: ${err.message}`);
  });
  const noFallback = boundary5.wrap(() => {
    throw new Error("无 fallback");
  });
  console.log("无 fallback 出错返回:", noFallback());

  // --- 测试 6：事件回调用 wrapCallback ---
  console.log("\n--- 测试 6：事件回调错误捕获 ---");
  const boundary6 = new ErrorBoundary((err) => {
    console.log(`  回调错误: ${err.message}`);
  });
  const handlers = [];
  // 模拟事件系统
  const emitter = {
    on(handler) {
      handlers.push(handler);
    },
    emit(data) {
      handlers.forEach((h) => h(data));
    },
  };
  emitter.on(
    boundary6.wrapCallback((data) => {
      if (data === "bad") throw new Error("回调抛错");
      console.log("  回调正常处理:", data);
    }),
  );
  emitter.emit("good");
  emitter.emit("bad"); // 不会影响后续
  emitter.emit("good2");
  console.log("回调错误数量:", boundary6.errorCount);

  console.log("\n========== 所有错误边界测试完成 ==========");
})();
