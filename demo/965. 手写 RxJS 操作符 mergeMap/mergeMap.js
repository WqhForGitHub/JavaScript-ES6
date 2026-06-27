/**
 * 手写 RxJS 操作符 mergeMap（flatMap）
 * ===========================================================================
 * mergeMap 是 RxJS 中最重要的"高阶映射"操作符之一。
 *
 * 它对源 Observable 发出的每一个值，调用 projectFn 把它映射成一个"内部 Observable"，
 * 然后订阅这个内部 Observable，并把内部 Observable 发出的值合并（merge）到下游。
 *
 * 关键特点：
 *   - 并发订阅：每当源发出一个值，就会立即订阅对应的新内部 Observable。
 *   - 多个内部 Observable 同时运行，它们的输出交织合并到下游。
 *   - 不会等待前一个内部 Observable 完成才订阅下一个。
 *
 * 与其他高阶操作符对比：
 *   - mergeMap（flatMap）：并发合并所有内部 Observable。
 *   - switchMap：新值到来时取消上一个内部 Observable，切换到新的。
 *   - concatMap：排队依次订阅内部 Observable，前一个完成才下一个。
 *   - exhaustMap：新值到来时如果当前内部 Observable 未完成则丢弃新值。
 *
 * 本文件实现：
 *   1. 函数式：mergeMap(source, projectFn) => 新 Observable
 *   2. 管道式：mergeMap(projectFn) => 操作符函数
 *   3. 演示用 mergeMap 为每个源值创建一个"interval Observable"
 */

// ------------------------------ 简易 Observable ------------------------------

class Observable {
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  subscribe(observer) {
    if (typeof observer === "function") {
      observer = {
        next: observer,
        error: (e) => {
          throw e;
        },
        complete: () => {},
      };
    }
    const safeObserver = {
      next: observer.next ? observer.next.bind(observer) : () => {},
      error: observer.error
        ? observer.error.bind(observer)
        : (e) => {
            throw e;
          },
      complete: observer.complete ? observer.complete.bind(observer) : () => {},
    };
    return this._subscribeFn(safeObserver) || (() => {});
  }

  pipe(...operators) {
    return operators.reduce((source, op) => op(source), this);
  }
}

/** 从数组创建 Observable（同步完成） */
function fromArray(arr) {
  return new Observable((observer) => {
    arr.forEach((v) => observer.next(v));
    observer.complete();
    return () => {};
  });
}

/** 创建一个同步立即发出单个值后完成的 Observable */
function of(value) {
  return new Observable((observer) => {
    observer.next(value);
    observer.complete();
    return () => {};
  });
}

// ------------------------------ mergeMap 实现 ------------------------------

/**
 * 函数式 mergeMap
 * @param {Observable} source 源 Observable
 * @param {Function} projectFn (value, index) => innerObservable
 * @returns {Observable} 合并后的新 Observable
 */
function mergeMap(source, projectFn) {
  return new Observable((observer) => {
    let activeSubscriptions = 0; // 当前活跃的内部 Observable 订阅数
    let outerComplete = false; // 源是否已完成
    let outerIndex = 0;
    let unsubscribed = false;
    /** @type {Function[]} 内部订阅的取消函数 */
    const innerUnsubs = [];

    const checkComplete = () => {
      // 源已完成，且所有内部 Observable 都已完成，则整体完成
      if (outerComplete && activeSubscriptions === 0 && !unsubscribed) {
        observer.complete();
      }
    };

    const outerUnsub = source.subscribe({
      next: (value) => {
        try {
          const inner = projectFn(value, outerIndex++);
          activeSubscriptions++;
          const innerUnsub = inner.subscribe({
            next: (innerValue) => {
              if (!unsubscribed) observer.next(innerValue);
            },
            error: (err) => observer.error(err),
            complete: () => {
              activeSubscriptions--;
              checkComplete();
            },
          });
          innerUnsubs.push(innerUnsub);
        } catch (err) {
          observer.error(err);
        }
      },
      error: (err) => observer.error(err),
      complete: () => {
        outerComplete = true;
        checkComplete();
      },
    });

    // 返回取消订阅函数：取消源 + 所有内部 Observable
    return () => {
      unsubscribed = true;
      outerUnsub();
      innerUnsubs.forEach((u) => u && u());
    };
  });
}

/** 管道式 mergeMap */
function mergeMapOperator(projectFn) {
  return (source) => mergeMap(source, projectFn);
}

// ============================ 测试用例 ============================

console.log("===== 测试 1：每个源值映射为一个 of(x)，合并发出 =====");
// projectFn 把每个数字 x 映射成一个立即发出 x*10 的 Observable
fromArray([1, 2, 3])
  .pipe(mergeMapOperator((x) => of(x * 10)))
  .subscribe({
    next: (v) => console.log("收到:", v),
    complete: () => console.log("完成"),
  });
// 输出：收到: 10 / 收到: 20 / 收到: 30 / 完成

console.log("\n===== 测试 2：每个源值映射为多个值的内部 Observable =====");
// 把每个数 x 映射成 [x, x+1, x+2] 的数组 Observable
fromArray([1, 10])
  .pipe(mergeMapOperator((x) => fromArray([x, x + 1, x + 2])))
  .subscribe({
    next: (v) => console.log("收到:", v),
    complete: () => console.log("完成"),
  });
// 输出：1 / 2 / 3 / 10 / 11 / 12 / 完成（同步合并，按顺序）

console.log(
  "\n===== 测试 3：模拟为每个源值创建 interval Observable（异步） =====",
);
/**
 * 创建一个每隔 intervalMs 发出一个递增整数的 Observable，发出 count 次后完成。
 */
function intervalSeries(intervalMs, count) {
  return new Observable((observer) => {
    let i = 0;
    const id = setInterval(() => {
      observer.next(i++);
      if (i >= count) {
        clearInterval(id);
        observer.complete();
      }
    }, intervalMs);
    return () => clearInterval(id);
  });
}

// 源发出三个 id：0、1、2，每个 id 都创建一个每隔 100ms 发 3 次的 interval
const merged = fromArray([0, 1, 2]).pipe(
  mergeMapOperator((id) => {
    // 用标签标记来自哪个内部 Observable
    return new Observable((observer) => {
      let i = 0;
      const id2 = setInterval(() => {
        observer.next(`内部${id}-${i++}`);
        if (i >= 3) {
          clearInterval(id2);
          observer.complete();
        }
      }, 100);
      return () => clearInterval(id2);
    });
  }),
);

console.log("异步合并中（每 100ms 各内部 Observable 各发一个）...");
merged.subscribe({
  next: (v) => console.log("  ", v),
  complete: () => console.log("  全部完成"),
});

// 等待异步完成（300ms 足够）
setTimeout(() => {
  console.log("\n===== 测试 4：mergeMap 中错误会传给下游 error =====");
  fromArray([1, 2, 3])
    .pipe(
      mergeMapOperator((x) =>
        x === 2
          ? new Observable((o) => {
              o.error(new Error("内部错误"));
            })
          : of(x),
      ),
    )
    .subscribe({
      next: (v) => console.log("next:", v),
      error: (e) => console.log("error:", e.message),
    });
  // 输出：next: 1 / error: 内部错误

  console.log("\n所有测试已结束。");
}, 400);
