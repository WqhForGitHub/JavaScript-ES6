/**
 * 手写 RxJS BehaviorSubject
 * ===========================================================================
 * BehaviorSubject 是一种特殊的 Subject，它会保存"最新"的一个值。
 * 当有新的观察者订阅时，它会立即把当前保存的最新值发送给这个新订阅者。
 *
 * 核心特性：
 *   1. 它是一个 Subject（既是 Observable 又是 Observer）。
 *   2. 它内部维护一个 `_value`，存储最近一次通过 next() 发出的值。
 *   3. 新订阅者订阅时，会立刻收到当前存储的值（无需等待下次 next）。
 *   4. 提供 getValue() 方法同步获取当前值。
 *   5. 提供 complete() / error() 来结束数据流。
 *
 * 与普通 Subject 的区别：
 *   - 普通 Subject：新订阅者只能收到订阅之后发出的值。
 *   - BehaviorSubject：新订阅者会立刻收到当前缓存的最新值。
 *
 * 应用场景：
 *   - 状态管理（如存储当前用户信息、当前主题等）。
 *   - 需要随时同步读取最新值的场景。
 */

/** 简易 Subscriber 包装：统一管理观察者的 next/error/complete 回调 */
class Subscriber {
  constructor(observer) {
    // 兼容部分观察者（可能只提供 next）
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

class BehaviorSubject {
  /**
   * @param {*} initialValue 初始值，新订阅者会立即收到它
   */
  constructor(initialValue) {
    this._value = initialValue;
    /** @type {Subscriber[]} */
    this._subscribers = [];
    this._closed = false; // Subject 是否已完成
    this._hasError = false;
    this._error = null;
  }

  /**
   * 订阅 BehaviorSubject
   * @param {Object} observer 含 next / error / complete 的对象
   * @returns {Function} 取消订阅函数
   */
  subscribe(observer) {
    const subscriber = new Subscriber(observer);

    // 关键点：BehaviorSubject 在订阅时立即把当前值发给新订阅者
    if (!this._closed && !this._hasError) {
      this._subscribers.push(subscriber);
      subscriber.next(this._value);
    } else if (this._hasError) {
      subscriber.error(this._error);
    } else if (this._closed) {
      subscriber.complete();
    }

    // 返回取消订阅函数
    return () => {
      this._subscribers = this._subscribers.filter((s) => s !== subscriber);
    };
  }

  /**
   * 发出新的值，并更新内部缓存
   * @param {*} value
   */
  next(value) {
    if (this._closed) return;
    this._value = value; // 关键：缓存最新值
    this._subscribers.forEach((s) => s.next(value));
  }

  /**
   * 同步获取当前缓存的值
   * @returns {*}
   */
  getValue() {
    if (this._hasError) throw this._error;
    return this._value;
  }

  /**
   * 通知所有观察者发生错误
   * @param {Error} err
   */
  error(err) {
    if (this._closed) return;
    this._closed = true;
    this._hasError = true;
    this._error = err;
    this._subscribers.forEach((s) => s.error(err));
    this._subscribers = [];
  }

  /**
   * 完成数据流
   */
  complete() {
    if (this._closed) return;
    this._closed = true;
    this._subscribers.forEach((s) => s.complete());
    this._subscribers = [];
  }
}

// ============================ 测试用例 ============================

console.log("===== 测试 1：初始值立即发送给第一个订阅者 =====");
const subject1 = new BehaviorSubject(0); // 初始值 0
subject1.subscribe({
  next: (v) => console.log("订阅者A 收到:", v),
});

subject1.next(1);
subject1.next(2);
// 输出：订阅者A 收到: 0 / 1 / 2

console.log("\n===== 测试 2：迟到的订阅者立即收到当前最新值 =====");
// 当前 subject1 的最新值是 2，新订阅者会立刻收到 2
subject1.subscribe({
  next: (v) => console.log("迟到的订阅者B 立即收到:", v),
});
// 输出：迟到的订阅者B 立即收到: 2

console.log("\n===== 测试 3：getValue() 同步读取最新值 =====");
console.log("当前最新值:", subject1.getValue()); // 2

console.log("\n===== 测试 4：模拟状态管理场景 =====");
const currentUser = new BehaviorSubject({ name: "匿名", loggedIn: false });

currentUser.subscribe({
  next: (user) =>
    console.log("UI 更新：", user.name, "| 已登录:", user.loggedIn),
});
// 输出：UI 更新： 匿名 | 已登录: false

currentUser.next({ name: "Alice", loggedIn: true });
// 输出：UI 更新： Alice | 已登录: true

// 一个新组件晚加入，立刻拿到当前用户状态
currentUser.subscribe({
  next: (user) => console.log("新组件初始化，当前用户:", user.name),
});
// 输出：新组件初始化，当前用户: Alice

console.log("\n===== 测试 5：complete 后新订阅者直接收到 complete =====");
const subject2 = new BehaviorSubject("hello");
subject2.subscribe({
  next: (v) => console.log("next:", v),
  complete: () => console.log("订阅者C: 已完成"),
});
subject2.complete();

subject2.subscribe({
  next: (v) => console.log("完成后的新订阅者 next:", v),
  complete: () => console.log("完成后的新订阅者: complete"),
});
// 输出：完成后的新订阅者: complete（不会再收到 next）

console.log("\n===== 测试 6：取消订阅 =====");
const subject3 = new BehaviorSubject(10);
const unsub = subject3.subscribe({
  next: (v) => console.log("订阅者D:", v),
});
subject3.next(11); // 订阅者D: 11
unsub(); // 取消订阅
subject3.next(12); // 订阅者D 不会再收到
console.log("取消订阅后再次 next，订阅者D 不再输出");
