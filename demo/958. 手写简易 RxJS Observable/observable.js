/**
 * 手写简易 RxJS Observable
 * ========================
 * Observable 是 RxJS 的核心数据结构，代表"可被订阅的惰性数据流"。
 *
 * 关键概念：
 *   1. Observable 本身不执行任何逻辑，只有在被 subscribe 时才执行（惰性）
 *   2. subscribe 函数接收 observer（next/error/complete），返回 teardown（清理函数）
 *   3. Subscription 提供 unsubscribe() 用于释放资源
 *   4. 调用 observer.complete() 或 observer.error() 后，后续 next/error/complete 应被忽略
 *      （这一安全语义在本实现中由内部 _closed 标志保证）
 *
 * 本实现包含：
 *   - Observable 类
 *   - Subscription 类
 *   - 工厂方法：interval、fromArray、fromPromise、of
 *   - 操作符（简化）：map、filter
 */

// ------------------------------------------------------------
// 1. Subscription：表示一次订阅，可清理资源
// ------------------------------------------------------------
class Subscription {
  constructor(teardown) {
    this._teardown = typeof teardown === "function" ? teardown : null;
    this._closed = false;
    this._children = [];
  }

  /** 是否已取消 */
  get closed() {
    return this._closed;
  }

  /** 取消订阅，执行清理函数 */
  unsubscribe() {
    if (this._closed) return;
    this._closed = true;
    // 先清理子订阅，再执行自身 teardown
    for (const child of this._children) child.unsubscribe();
    this._children.length = 0;
    if (this._teardown) {
      try {
        this._teardown();
      } catch (e) {
        // teardown 中的错误不应中断清理
        console.error("[Subscription] teardown 抛错:", e);
      }
    }
  }

  /** 添加子订阅（统一管理） */
  add(child) {
    if (this._closed) {
      child.unsubscribe();
      return;
    }
    this._children.push(child);
  }
}

// ------------------------------------------------------------
// 2. Observable：可被订阅的惰性数据流
// ------------------------------------------------------------
class Observable {
  /**
   * @param {(observer: {next, error, complete}) => (() => void) | void} subscribeFn
   */
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  /**
   * 订阅本 Observable
   * @param {Function|{next?:Function,error?:Function,complete?:Function}} observerOrNext
   * @param {Function} [error]
   * @param {Function} [complete]
   * @returns {Subscription}
   */
  subscribe(observerOrNext, error, complete) {
    // 标准化 observer
    let observer;
    if (typeof observerOrNext === "function") {
      observer = { next: observerOrNext, error, complete };
    } else {
      observer = observerOrNext || {};
    }
    const next = typeof observer.next === "function" ? observer.next : () => {};
    const errCb =
      typeof observer.error === "function"
        ? observer.error
        : (e) => {
            throw e;
          };
    const completeCb =
      typeof observer.complete === "function" ? observer.complete : () => {};

    // 安全 observer：终止后忽略后续调用
    let terminated = false;
    const safeObserver = {
      next: (v) => {
        if (terminated) return;
        try {
          next(v);
        } catch (e) {
          errCb(e);
          terminate("error");
        }
      },
      error: (e) => {
        if (terminated) return;
        try {
          errCb(e);
        } finally {
          terminate("error");
        }
      },
      complete: () => {
        if (terminated) return;
        try {
          completeCb();
        } finally {
          terminate("complete");
        }
      },
    };
    function terminate() {
      terminated = true;
    }

    // 调用用户定义的订阅逻辑，获取 teardown
    let teardown;
    try {
      teardown = this._subscribeFn(safeObserver);
    } catch (e) {
      safeObserver.error(e);
      return new Subscription();
    }

    const subscription = new Subscription(teardown);
    // 若已终止，立即清理
    if (terminated) subscription.unsubscribe();
    return subscription;
  }

  // ---------- 操作符（简化）----------

  /**
   * map：对每个值应用投影函数
   * @param {(value: any) => any} project
   * @returns {Observable}
   */
  map(project) {
    const source = this;
    return new Observable((observer) => {
      const sub = source.subscribe({
        next: (v) => {
          try {
            observer.next(project(v));
          } catch (e) {
            observer.error(e);
          }
        },
        error: (e) => observer.error(e),
        complete: () => observer.complete(),
      });
      return () => sub.unsubscribe();
    });
  }

  /**
   * filter：按谓词过滤
   * @param {(value: any) => boolean} predicate
   * @returns {Observable}
   */
  filter(predicate) {
    const source = this;
    return new Observable((observer) => {
      const sub = source.subscribe({
        next: (v) => {
          try {
            if (predicate(v)) observer.next(v);
          } catch (e) {
            observer.error(e);
          }
        },
        error: (e) => observer.error(e),
        complete: () => observer.complete(),
      });
      return () => sub.unsubscribe();
    });
  }
}

// ------------------------------------------------------------
// 3. 工厂方法
// ------------------------------------------------------------

/**
 * interval：每隔 ms 毫秒发送一个递增整数（0,1,2,...）
 * @param {number} ms
 * @returns {Observable}
 */
function interval(ms) {
  return new Observable((observer) => {
    let i = 0;
    const id = setInterval(() => observer.next(i++), ms);
    // 返回 teardown
    return () => clearInterval(id);
  });
}

/**
 * fromArray：同步依次发送数组元素，然后 complete
 * @param {Array<any>} arr
 * @returns {Observable}
 */
function fromArray(arr) {
  return new Observable((observer) => {
    for (const item of arr) {
      observer.next(item);
    }
    observer.complete();
    // 无需 teardown
    return () => {};
  });
}

/**
 * of：发送一组值，然后 complete
 */
function of(...values) {
  return fromArray(values);
}

/**
 * fromPromise：把 Promise 转为 Observable
 */
function fromPromise(promise) {
  return new Observable((observer) => {
    promise.then(
      (v) => {
        observer.next(v);
        observer.complete();
      },
      (e) => observer.error(e),
    );
    // Promise 无法取消，teardown 为空
    return () => {};
  });
}

// ============================================================
// 测试用例
// ============================================================
console.log("===== 958. 手写简易 RxJS Observable =====");

// 测试 1：fromArray + map + filter
console.log("\n--- fromArray + filter + map ---");
fromArray([1, 2, 3, 4, 5, 6])
  .filter((x) => x % 2 === 0) // 2, 4, 6
  .map((x) => x * 10) // 20, 40, 60
  .subscribe({
    next: (v) => console.log("  next:", v),
    error: (e) => console.log("  error:", e),
    complete: () => console.log("  complete"),
  });

// 测试 2：interval + 取消订阅
console.log("\n--- interval（每 50ms 发送，3 次后取消）---");
const sub = interval(50).subscribe({
  next: (v) => console.log("  interval next:", v),
  complete: () => console.log("  interval complete"),
});
// 150ms 后取消
setTimeout(() => {
  sub.unsubscribe();
  console.log("  已取消订阅");
}, 165);

// 测试 3：of
console.log("\n--- of ---");
of("a", "b", "c").subscribe({
  next: (v) => console.log("  of next:", v),
  complete: () => console.log("  of complete"),
});

// 测试 4：错误传播
console.log("\n--- 错误传播（map 中抛错）---");
fromArray([1, 2, 3])
  .map((x) => {
    if (x === 2) throw new Error("boom at 2");
    return x;
  })
  .subscribe({
    next: (v) => console.log("  next:", v),
    error: (e) => console.log("  error:", e.message),
    complete: () => console.log("  complete"),
  });

// 测试 5：complete 后的 next 应被忽略
console.log("\n--- complete 后 next 被忽略 ---");
const custom$ = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
  observer.complete();
  observer.next(3); // 应被忽略
  observer.complete(); // 应被忽略
  return () => console.log("  [teardown] custom$ 清理");
});
custom$.subscribe({
  next: (v) => console.log("  next:", v),
  complete: () => console.log("  complete"),
});

// 测试 6：fromPromise
console.log("\n--- fromPromise ---");
fromPromise(Promise.resolve(42)).subscribe({
  next: (v) => console.log("  next:", v),
  complete: () => console.log("  complete"),
});
fromPromise(Promise.reject(new Error("rejected"))).subscribe({
  next: (v) => console.log("  next:", v),
  error: (e) => console.log("  error:", e.message),
});

// 让异步测试完成后再退出
setTimeout(() => {
  console.log("\n--- 全部测试结束 ---");
}, 300);
