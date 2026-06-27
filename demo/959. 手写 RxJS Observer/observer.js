/**
 * 手写 RxJS Observer
 * ==================
 * Observer 是 Observable 的"消费者"接口，定义为：
 *   {
 *     next: (value) => void,   // 接收下一个值
 *     error: (err) => void,    // 接收错误（终止信号）
 *     complete: () => void,    // 接收完成（终止信号）
 *   }
 *
 * RxJS 契约（contract）：
 *   1. 一个 Observable 可依次发送任意多个 next
 *   2. error 或 complete 之后，Observable 不应再发送任何 next/error/complete
 *      —— 即 error 与 complete 都是"终止信号"，且二者互斥
 *   3. observer 内部错误不应传播回 Observable
 *
 * "不安全"的 Observer 可能违反上述契约（例如 complete 后再 next），
 * 因此 RxJS 内部会包装一层 SafeObserver 来强制保证契约。
 *
 * 本实现包含：
 *   - createObserver：构造一个原始（不安全）observer
 *   - SafeObserver：安全包装，强制终止语义
 *   - 不安全 vs 安全对比演示
 */

// ------------------------------------------------------------
// 1. 原始 Observer 工厂（不保证契约）
// ------------------------------------------------------------
/**
 * 创建一个原始 observer
 * @param {(v: any) => void} [next]
 * @param {(e: any) => void} [error]
 * @param {() => void} [complete]
 * @returns {{next, error, complete}}
 */
function createObserver(next, error, complete) {
  return {
    next: next || (() => {}),
    error:
      error ||
      ((e) => {
        throw e;
      }),
    complete: complete || (() => {}),
  };
}

// ------------------------------------------------------------
// 2. SafeObserver：强制执行 RxJS 契约
// ------------------------------------------------------------
class SafeObserver {
  /**
   * @param {{next?:Function,error?:Function,complete?:Function}|Function} observerOrNext
   * @param {Function} [error]
   * @param {Function} [complete]
   */
  constructor(observerOrNext, error, complete) {
    if (typeof observerOrNext === "function") {
      this._next = observerOrNext;
      this._error = error;
      this._complete = complete;
    } else {
      const o = observerOrNext || {};
      this._next = o.next;
      this._error = o.error;
      this._complete = o.complete;
    }
    /** 是否已终止（一旦为 true，所有调用都被忽略） */
    this._terminated = false;
    /** 终止原因：'error' | 'complete' | null */
    this._terminationReason = null;
  }

  /**
   * 发送下一个值
   * @param {*} value
   */
  next(value) {
    if (this._terminated) {
      console.warn(
        `  [SafeObserver] 已 ${this._terminationReason}，next(${value}) 被忽略`,
      );
      return;
    }
    // next 中抛错应转为 error 信号
    try {
      if (typeof this._next === "function") this._next(value);
    } catch (e) {
      this.error(e);
    }
  }

  /**
   * 发送错误（终止信号）
   * @param {*} err
   */
  error(err) {
    if (this._terminated) {
      console.warn(
        `  [SafeObserver] 已 ${this._terminationReason}，error(${err}) 被忽略`,
      );
      return;
    }
    this._terminated = true;
    this._terminationReason = "error";
    if (typeof this._error === "function") {
      this._error(err);
    } else {
      // 未提供 error 处理器：重新抛出
      throw err;
    }
  }

  /**
   * 发送完成（终止信号）
   */
  complete() {
    if (this._terminated) {
      console.warn(
        `  [SafeObserver] 已 ${this._terminationReason}，complete() 被忽略`,
      );
      return;
    }
    this._terminated = true;
    this._terminationReason = "complete";
    if (typeof this._complete === "function") this._complete();
  }

  /** 是否已终止 */
  get closed() {
    return this._terminated;
  }
}

// ------------------------------------------------------------
// 3. 一个简单的 Observable，用于驱动 observer
// ------------------------------------------------------------
/**
 * 创建一个会向 observer 发送一组预设信号的 Observable
 * @param {(observer: {next, error, complete}) => void} emit
 */
function makeObservable(emit) {
  return {
    subscribe(observer) {
      emit(observer);
    },
  };
}

// ============================================================
// 测试用例
// ============================================================
console.log("===== 959. 手写 RxJS Observer =====");

// --- 测试 1：不安全 observer —— 违反契约（complete 后仍 next）---
console.log("\n--- 测试 1：不安全 observer（complete 后 next 仍会执行）---");
const unsafeObserver = createObserver(
  (v) => console.log("  unsafe next:", v),
  (e) => console.log("  unsafe error:", e),
  () => console.log("  unsafe complete"),
);

makeObservable((obs) => {
  obs.next(1);
  obs.next(2);
  obs.complete();
  // 违反契约：complete 后再 next，普通 observer 仍会执行
  obs.next(3);
}).subscribe(unsafeObserver);
console.log("结论：unsafe 的 next(3) 仍然执行，违反了 RxJS 契约\n");

// --- 测试 2：SafeObserver —— complete 后 next 被忽略 ---
console.log("--- 测试 2：SafeObserver（complete 后 next 被忽略）---");
const safeObserver = new SafeObserver({
  next: (v) => console.log("  safe next:", v),
  error: (e) => console.log("  safe error:", e),
  complete: () => console.log("  safe complete"),
});

makeObservable((obs) => {
  obs.next(1);
  obs.next(2);
  obs.complete();
  obs.next(3); // 应被忽略并打印警告
  obs.complete(); // 应被忽略并打印警告
}).subscribe(safeObserver);
console.log("");

// --- 测试 3：SafeObserver —— error 后所有调用被忽略 ---
console.log("--- 测试 3：SafeObserver（error 为终止信号）---");
const safeObserver2 = new SafeObserver({
  next: (v) => console.log("  safe next:", v),
  error: (e) => console.log("  safe error:", e.message),
  complete: () => console.log("  safe complete"),
});

makeObservable((obs) => {
  obs.next("a");
  obs.error(new Error("something went wrong"));
  obs.next("b"); // 应被忽略
  obs.complete(); // 应被忽略
}).subscribe(safeObserver2);
console.log("");

// --- 测试 4：SafeObserver —— next 中抛错会转为 error 信号 ---
console.log("--- 测试 4：SafeObserver（next 抛错 -> error 信号）---");
const safeObserver3 = new SafeObserver({
  next: (v) => {
    console.log("  safe next:", v);
    if (v === 2) throw new Error("next handler crashed");
  },
  error: (e) => console.log("  safe error:", e.message),
  complete: () => console.log("  safe complete"),
});

makeObservable((obs) => {
  obs.next(1);
  obs.next(2); // next 处理器抛错 -> 自动转为 error
  obs.next(3); // error 后被忽略
  obs.complete(); // error 后被忽略
}).subscribe(safeObserver3);
console.log("");

// --- 测试 5：SafeObserver 的 closed 属性 ---
console.log("--- 测试 5：SafeObserver.closed 状态 ---");
const obs = new SafeObserver({ next: () => {} });
console.log("初始 closed:", obs.closed);
obs.next(1);
console.log("next 后 closed:", obs.closed);
obs.complete();
console.log("complete 后 closed:", obs.closed);
obs.next(2);
console.log("");

// --- 测试 6：函数式重载（next, error, complete 三参数）---
console.log("--- 测试 6：函数式重载 ---");
const fnObserver = new SafeObserver(
  (v) => console.log("  fn next:", v),
  (e) => console.log("  fn error:", e),
  () => console.log("  fn complete"),
);
makeObservable((o) => {
  o.next("hello");
  o.complete();
  o.next("world"); // 被忽略
}).subscribe(fnObserver);

console.log("\n--- 全部测试结束 ---");
