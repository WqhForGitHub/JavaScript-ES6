/**
 * 手写 RxJS 操作符 filter
 * ===========================================================================
 * filter 是 RxJS 中的过滤操作符。它对源 Observable 发出的每一个值
 * 应用一个断言函数 predicate，只有返回 true 的值才会传给下游。
 *
 * 数学定义：filter(predicate) 把 Observable<A> 变成 Observable<A>，
 *           只保留满足 predicate(x) === true 的值。
 *
 * 本文件同时实现：
 *   1. 函数式：filter(observable, predicate) => 新 Observable
 *   2. 管道式（pipeable）：filter(predicate) => 操作符函数
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

/**
 * 从数组创建 Observable
 */
function fromArray(arr) {
  return new Observable((observer) => {
    arr.forEach((v) => observer.next(v));
    observer.complete();
    return () => {};
  });
}

// ------------------------------ 实现 1：函数式 filter ------------------------------

/**
 * 函数式 filter
 * @param {Observable} source 源 Observable
 * @param {Function} predicate 断言函数 (value, index) => boolean
 * @returns {Observable} 新的 Observable
 */
function filter(source, predicate) {
  return new Observable((observer) => {
    let index = 0;
    return source.subscribe({
      next: (value) => {
        try {
          if (predicate(value, index++)) {
            observer.next(value);
          }
        } catch (err) {
          observer.error(err);
        }
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
  });
}

// ------------------------------ 实现 2：管道式 filter ------------------------------

/**
 * 管道式 filter：返回操作符函数
 * @param {Function} predicate
 * @returns {(source: Observable) => Observable}
 */
function filterOperator(predicate) {
  return (source) => filter(source, predicate);
}

// 顺便提供一个 map 实现，方便组合演示
function map(source, projectFn) {
  return new Observable((observer) => {
    let i = 0;
    return source.subscribe({
      next: (v) => {
        try {
          observer.next(projectFn(v, i++));
        } catch (e) {
          observer.error(e);
        }
      },
      error: (e) => observer.error(e),
      complete: () => observer.complete(),
    });
  });
}
function mapOperator(projectFn) {
  return (source) => map(source, projectFn);
}

// ============================ 测试用例 ============================

console.log("===== 测试 1：函数式 filter，只保留偶数 =====");
const numbers1 = fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const evens = filter(numbers1, (x) => x % 2 === 0);
evens.subscribe({
  next: (v) => console.log("偶数:", v),
  complete: () => console.log("偶数 完成"),
});
// 输出：偶数: 2 / 4 / 6 / 8 / 10 / 偶数 完成

console.log("\n===== 测试 2：管道式 filter =====");
fromArray([1, 2, 3, 4, 5, 6])
  .pipe(filterOperator((x) => x > 3))
  .subscribe({
    next: (v) => console.log("大于3:", v),
  });
// 输出：大于3: 4 / 5 / 6

console.log("\n===== 测试 3：filter + map 组合 =====");
fromArray([1, 2, 3, 4, 5, 6, 7, 8])
  .pipe(
    filterOperator((x) => x % 2 === 0), // 取偶数
    mapOperator((x) => x * 10), // 乘以 10
  )
  .subscribe({
    next: (v) => console.log("组合结果:", v),
  });
// 输出：组合结果: 20 / 40 / 60 / 80

console.log("\n===== 测试 4：filter 使用索引 =====");
fromArray([10, 20, 30, 40, 50])
  .pipe(filterOperator((_, index) => index < 3)) // 只取前 3 个
  .subscribe({
    next: (v) => console.log("前3个:", v),
  });
// 输出：前3个: 10 / 20 / 30

console.log("\n===== 测试 5：filter 过滤字符串数组 =====");
fromArray(["apple", "bat", "cat", "avocado", "dog"])
  .pipe(filterOperator((s) => s.startsWith("a")))
  .subscribe({
    next: (v) => console.log("以 a 开头:", v),
  });
// 输出：以 a 开头: apple / avocado

console.log("\n===== 测试 6：filter 中 predicate 抛错会传给 error =====");
fromArray([1, 2, 3])
  .pipe(
    filterOperator((x) => {
      if (x === 2) throw new Error("断言出错");
      return true;
    }),
  )
  .subscribe({
    next: (v) => console.log("next:", v),
    error: (e) => console.log("error:", e.message),
  });
// 输出：next: 1 / error: 断言出错

console.log("\n===== 测试 7：filter 全部不满足时下游不收到任何值 =====");
fromArray([1, 3, 5])
  .pipe(filterOperator((x) => x % 2 === 0))
  .subscribe({
    next: (v) => console.log("偶数:", v),
    complete: () => console.log("complete（一个偶数都没有）"),
  });
// 输出：complete（一个偶数都没有）
