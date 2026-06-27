/**
 * 手写 RxJS 操作符 map
 * ===========================================================================
 * map 是 RxJS 中最常用的变换操作符之一。它对源 Observable 发出的每一个值
 * 应用一个投影函数 projectFn，把结果传给下游。
 *
 * 数学定义：map(projectFn) 把 Observable<A> 变成 Observable<B>，
 *           其中 B = projectFn(A)。
 *
 * 本文件实现两种形式：
 *   1. 函数式：map(observable, projectFn) => 新 Observable
 *   2. 管道式（pipeable）：map(projectFn) => 一个操作符函数，
 *      可配合 pipe 使用：source.pipe(map(x => x * 2))
 *
 * 同时实现一个简易的 Observable 和 pipe 工具，便于演示。
 */

// ------------------------------ 简易 Observable ------------------------------

/**
 * 简易 Observable 实现
 * 构造函数接收一个 subscribeFn，描述订阅时如何向观察者发送数据。
 */
class Observable {
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  subscribe(observer) {
    // 兼容函数形式的 observer
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

  /**
   * pipe：依次把若干操作符应用到当前 Observable 上
   * @param  {...Function} operators
   * @returns {Observable}
   */
  pipe(...operators) {
    return operators.reduce((source, op) => op(source), this);
  }
}

// ------------------------------ 工具：从数组创建 Observable ------------------------------

/**
 * @param {Array} arr
 * @returns {Observable}
 */
function fromArray(arr) {
  return new Observable((observer) => {
    arr.forEach((v) => observer.next(v));
    observer.complete();
    return () => {};
  });
}

// ------------------------------ 实现 1：函数式 map ------------------------------

/**
 * 函数式 map：把 projectFn 应用到 source 的每个值
 * @param {Observable} source 源 Observable
 * @param {Function} projectFn 投影函数 (value, index) => newValue
 * @returns {Observable} 新的 Observable
 */
function map(source, projectFn) {
  return new Observable((observer) => {
    let index = 0;
    const unsubscribe = source.subscribe({
      next: (value) => {
        try {
          observer.next(projectFn(value, index++));
        } catch (err) {
          observer.error(err);
        }
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
    return unsubscribe;
  });
}

// ------------------------------ 实现 2：管道式（pipeable）map ------------------------------

/**
 * 管道式 map：返回一个操作符函数，接收 source Observable
 * @param {Function} projectFn
 * @returns {(source: Observable) => Observable}
 */
function mapOperator(projectFn) {
  return (source) => map(source, projectFn);
}

// ============================ 测试用例 ============================

console.log("===== 测试 1：函数式 map，把每个数乘以 2 =====");
const source1 = fromArray([1, 2, 3, 4, 5]);
const doubled = map(source1, (x) => x * 2);
doubled.subscribe({
  next: (v) => console.log("doubled:", v),
  complete: () => console.log("doubled 完成"),
});
// 输出：2 / 4 / 6 / 8 / 10 / doubled 完成

console.log("\n===== 测试 2：管道式 map（pipe 链式调用） =====");
const result2 = fromArray([1, 2, 3, 4]).pipe(
  mapOperator((x) => x * 2),
  mapOperator((x) => x + 1),
);
result2.subscribe({
  next: (v) => console.log("pipe 结果:", v),
});
// 输出：3 / 5 / 7 / 9（先 *2 再 +1）

console.log("\n===== 测试 3：map 使用索引 =====");
const result3 = fromArray(["a", "b", "c"]).pipe(
  mapOperator((value, index) => `${index}:${value}`),
);
result3.subscribe({
  next: (v) => console.log("带索引:", v),
});
// 输出：0:a / 1:b / 2:c

console.log("\n===== 测试 4：map 转换对象字段 =====");
const users = fromArray([
  { name: "Alice", age: 20 },
  { name: "Bob", age: 30 },
]);
const names = map(users, (u) => u.name.toUpperCase());
names.subscribe({
  next: (v) => console.log("名字:", v),
});
// 输出：ALICE / BOB

console.log("\n===== 测试 5：map 中抛错会传给 error 回调 =====");
const result5 = fromArray([1, 2, 3]).pipe(
  mapOperator((x) => {
    if (x === 2) throw new Error("出错了！");
    return x;
  }),
);
result5.subscribe({
  next: (v) => console.log("next:", v),
  error: (e) => console.log("error:", e.message),
});
// 输出：next: 1 / error: 出错了！
