/**
 * 手写 RxJS ReplaySubject
 * ===========================================================================
 * ReplaySubject 是一种特殊的 Subject，它会缓存最近发出的 N 个值（bufferSize）。
 * 当有新的观察者订阅时，它会把这些缓存的值"重放"（replay）给新订阅者。
 *
 * 核心特性：
 *   1. 它是一个 Subject（既是 Observable 又是 Observer）。
 *   2. 构造函数接收 bufferSize，表示要缓存的最近值的数量。
 *   3. 新订阅者订阅时，会立刻按顺序收到缓存的全部值。
 *   4. 缓存超过 bufferSize 时，最旧的值会被丢弃（FIFO）。
 *
 * 与 BehaviorSubject 的区别：
 *   - BehaviorSubject：只缓存最新一个值，且必须有初始值，提供 getValue()。
 *   - ReplaySubject：缓存最近 N 个值，可以没有初始值，不提供 getValue()。
 *
 * 应用场景：
 *   - 重放缓存最近的若干事件给迟到的订阅者。
 *   - 缓存最近 N 次操作日志供新观察者查看。
 */

/** 简易 Subscriber 包装 */
class Subscriber {
  constructor(observer) {
    this.observer = {
      next: observer.next ? observer.next.bind(observer) : () => {},
      error: observer.error
        ? observer.error.bind(observer)
        : (e) => {
            throw e;
          },
      complete: observer.complete ? observer.complete.bind(observer) : () => {},
    };
    this.closed = false;
  }

  next(value) {
    if (this.closed) return;
    this.observer.next(value);
  }

  error(err) {
    if (this.closed) return;
    this.closed = true;
    this.observer.error(err);
  }

  complete() {
    if (this.closed) return;
    this.closed = true;
    this.observer.complete();
  }
}

class ReplaySubject {
  /**
   * @param {number} bufferSize 缓存的最近值的数量
   */
  constructor(bufferSize = Infinity) {
    this._bufferSize = bufferSize;
    /** @type {*[]} 缓存数组（FIFO） */
    this._buffer = [];
    /** @type {Subscriber[]} */
    this._subscribers = [];
    this._closed = false;
    this._hasError = false;
    this._error = null;
  }

  /**
   * 订阅 ReplaySubject
   * @param {Object} observer
   * @returns {Function} 取消订阅函数
   */
  subscribe(observer) {
    const subscriber = new Subscriber(observer);

    if (this._hasError) {
      subscriber.error(this._error);
      return () => {};
    }

    if (!this._closed) {
      this._subscribers.push(subscriber);
    }

    // 关键点：新订阅者订阅时，立即重放缓存中的所有值
    // 复制一份，避免在重放过程中 buffer 被修改
    const replayValues = this._buffer.slice();
    replayValues.forEach((v) => subscriber.next(v));

    if (this._closed) {
      subscriber.complete();
    }

    return () => {
      this._subscribers = this._subscribers.filter((s) => s !== subscriber);
    };
  }

  /**
   * 发出新值，并写入缓存
   * @param {*} value
   */
  next(value) {
    if (this._closed) return;

    // 维护缓存：超过 bufferSize 时移除最旧的（FIFO）
    this._buffer.push(value);
    if (this._buffer.length > this._bufferSize) {
      this._buffer.shift();
    }

    // 发给当前所有已订阅的观察者
    this._subscribers.forEach((s) => s.next(value));
  }

  error(err) {
    if (this._closed) return;
    this._closed = true;
    this._hasError = true;
    this._error = err;
    this._subscribers.forEach((s) => s.error(err));
    this._subscribers = [];
  }

  complete() {
    if (this._closed) return;
    this._closed = true;
    this._subscribers.forEach((s) => s.complete());
    this._subscribers = [];
  }
}

// ============================ 测试用例 ============================

console.log("===== 测试 1：bufferSize=2，迟到订阅者收到最近 2 个值 =====");
const replay1 = new ReplaySubject(2);

replay1.next(1);
replay1.next(2);
replay1.next(3); // 此时缓存为 [2, 3]（1 被挤出）

replay1.subscribe({
  next: (v) => console.log("迟到的订阅者A 收到重放:", v),
});
// 输出：迟到的订阅者A 收到重放: 2 / 3

console.log("\n===== 测试 2：订阅后继续接收新值 =====");
replay1.next(4); // 迟到的订阅者A 收到重放: 4

console.log("\n===== 测试 3：先订阅再 next 不会重放（只有当前值） =====");
const replay2 = new ReplaySubject(3);
replay2.subscribe({
  next: (v) => console.log("订阅者B 收到:", v),
});
replay2.next("a");
replay2.next("b");
replay2.next("c");
// 输出：订阅者B 收到: a / b / c（没有重放，因为订阅时缓存为空）

console.log("\n===== 测试 4：bufferSize=Infinity 缓存全部 =====");
const replay3 = new ReplaySubject(); // 默认 Infinity
replay3.next(10);
replay3.next(20);
replay3.next(30);
replay3.next(40);

replay3.subscribe({
  next: (v) => console.log("订阅者C 收到全部重放:", v),
});
// 输出：10 / 20 / 30 / 40

console.log("\n===== 测试 5：模拟事件日志重放 =====");
const eventLog = new ReplaySubject(3); // 只保留最近 3 条事件
["点击按钮", "打开菜单", "选择项A", "关闭菜单"].forEach((e) =>
  eventLog.next(e),
);

console.log("新加入的调试器查看最近事件：");
eventLog.subscribe({
  next: (e) => console.log("  -", e),
});
// 输出最近 3 条：打开菜单 / 选择项A / 关闭菜单

console.log(
  "\n===== 测试 6：complete 后新订阅者只重放缓存，不再接收新值 =====",
);
const replay4 = new ReplaySubject(5);
replay4.next(1);
replay4.next(2);
replay4.complete();

replay4.subscribe({
  next: (v) => console.log("完成后的新订阅者 next:", v),
  complete: () => console.log("完成后的新订阅者: complete"),
});
// 输出：完成后的新订阅者 next: 1 / 2，然后 complete
