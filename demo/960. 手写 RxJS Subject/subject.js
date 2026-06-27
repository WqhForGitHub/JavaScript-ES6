/**
 * 手写 RxJS Subject
 * =================
 * Subject 是一种特殊的对象：它同时是 Observable 和 Observer。
 *
 * 与普通 Observable 的区别：
 *   - 普通 Observable 是"单播"（unicast）：每次 subscribe 都独立执行 subscribeFn
 *   - Subject 是"多播"（multicast）：内部维护 observers 列表，next/error/complete
 *     会广播给所有当前订阅者
 *
 * 关键 API：
 *   - subscribe(observer) -> subscription：添加一个观察者
 *   - next(value)：向所有观察者广播值
 *   - error(err)：向所有观察者广播错误并终止
 *   - complete()：向所有观察者广播完成并终止
 *
 * 契约：
 *   - error/complete 后，所有后续 next/error/complete 都被忽略
 *   - error/complete 后，新 subscribe 的观察者会立即收到对应的终止信号
 *   - 已 unsubscribe 的观察者不再接收任何信号
 *
 * 本实现还包含：
 *   - Subscription 类（与 958 类似）
 *   - BehaviorSubject（保留最新值，新订阅者立即收到当前值）
 *   - ReplaySubject（缓存前 N 个值，新订阅者重放）
 */

// ------------------------------------------------------------
// 1. Subscription
// ------------------------------------------------------------
class Subscription {
  constructor(teardown) {
    this._teardown = typeof teardown === "function" ? teardown : null;
    this._closed = false;
  }
  get closed() {
    return this._closed;
  }
  unsubscribe() {
    if (this._closed) return;
    this._closed = true;
    if (this._teardown) this._teardown();
  }
}

// ------------------------------------------------------------
// 2. Subject：既是 Observable 又是 Observer
// ------------------------------------------------------------
class Subject {
  constructor() {
    /** @type {Set<{next,error,complete}>} */
    this._observers = new Set();
    /** 是否已终止 */
    this._terminated = false;
    /** 终止原因 + 数据：{ reason: 'error'|'complete', error? } */
    this._termination = null;
  }

  /** 是否已终止 */
  get closed() {
    return this._terminated;
  }

  /**
   * 订阅（与 Observable 接口一致）
   * @param {Function|{next?,error?,complete?}} observerOrNext
   * @param {Function} [error]
   * @param {Function} [complete]
   * @returns {Subscription}
   */
  subscribe(observerOrNext, error, complete) {
    let observer;
    if (typeof observerOrNext === "function") {
      observer = { next: observerOrNext, error, complete };
    } else {
      observer = observerOrNext || {};
    }
    // 补全默认值
    const obs = {
      next: typeof observer.next === "function" ? observer.next : () => {},
      error:
        typeof observer.error === "function"
          ? observer.error
          : (e) => {
              throw e;
            },
      complete:
        typeof observer.complete === "function" ? observer.complete : () => {},
      _unsubscribed: false,
    };

    // 若 Subject 已终止：立即向新订阅者发送终止信号
    if (this._terminated) {
      if (this._termination.reason === "error") {
        obs.error(this._termination.error);
      } else {
        obs.complete();
      }
      return new Subscription();
    }

    this._observers.add(obs);

    // 返回 subscription，取消订阅时把自身从列表移除
    const subscription = new Subscription(() => {
      obs._unsubscribed = true;
      this._observers.delete(obs);
    });
    return subscription;
  }

  /**
   * 向所有观察者广播值
   * @param {*} value
   */
  next(value) {
    if (this._terminated) {
      console.warn("  [Subject] 已终止，next 被忽略");
      return;
    }
    // 复制一份，避免迭代过程中 unsubscribe 导致异常
    const snapshot = Array.from(this._observers);
    for (const obs of snapshot) {
      if (obs._unsubscribed) continue;
      try {
        obs.next(value);
      } catch (e) {
        // 单个观察者错误不应影响其他观察者
        console.error("  [Subject] observer.next 抛错:", e);
      }
    }
  }

  /**
   * 向所有观察者广播错误并终止
   * @param {*} err
   */
  error(err) {
    if (this._terminated) {
      console.warn("  [Subject] 已终止，error 被忽略");
      return;
    }
    this._terminated = true;
    this._termination = { reason: "error", error: err };
    const snapshot = Array.from(this._observers);
    for (const obs of snapshot) {
      if (obs._unsubscribed) continue;
      try {
        obs.error(err);
      } catch (e) {
        console.error("  [Subject] observer.error 抛错:", e);
      }
    }
    this._observers.clear();
  }

  /**
   * 向所有观察者广播完成并终止
   */
  complete() {
    if (this._terminated) {
      console.warn("  [Subject] 已终止，complete 被忽略");
      return;
    }
    this._terminated = true;
    this._termination = { reason: "complete" };
    const snapshot = Array.from(this._observers);
    for (const obs of snapshot) {
      if (obs._unsubscribed) continue;
      try {
        obs.complete();
      } catch (e) {
        console.error("  [Subject] observer.complete 抛错:", e);
      }
    }
    this._observers.clear();
  }

  /** 作为 Observable 使用的便捷方法（返回自身） */
  asObservable() {
    const subject = this;
    return {
      subscribe: (...args) => subject.subscribe(...args),
    };
  }
}

// ------------------------------------------------------------
// 3. BehaviorSubject：保留最新值
// ------------------------------------------------------------
class BehaviorSubject extends Subject {
  /**
   * @param {*} initialValue
   */
  constructor(initialValue) {
    super();
    this._value = initialValue;
  }

  /** 当前值 */
  get value() {
    return this._value;
  }

  next(value) {
    this._value = value;
    super.next(value);
  }

  subscribe(observerOrNext, error, complete) {
    let observer;
    if (typeof observerOrNext === "function") {
      observer = { next: observerOrNext, error, complete };
    } else {
      observer = observerOrNext || {};
    }
    // 在 Subject.subscribe 之前包装 next，使其立即收到当前值
    const originalNext = observer.next;
    const wrapped = {
      ...observer,
      next: typeof originalNext === "function" ? originalNext : () => {},
    };
    const sub = super.subscribe(wrapped);
    // 若订阅成功（未立即终止），立即发送当前值
    if (!sub.closed && !this._terminated) {
      wrapped.next(this._value);
    }
    return sub;
  }
}

// ------------------------------------------------------------
// 4. ReplaySubject：缓存并重放前 N 个值
// ------------------------------------------------------------
class ReplaySubject extends Subject {
  /**
   * @param {number} bufferSize - 缓存多少个历史值
   */
  constructor(bufferSize = Infinity) {
    super();
    this._bufferSize = bufferSize;
    /** @type {any[]} */
    this._buffer = [];
  }

  next(value) {
    if (this._terminated) return;
    this._buffer.push(value);
    if (this._buffer.length > this._bufferSize) {
      this._buffer.shift();
    }
    super.next(value);
  }

  subscribe(observerOrNext, error, complete) {
    let observer;
    if (typeof observerOrNext === "function") {
      observer = { next: observerOrNext, error, complete };
    } else {
      observer = observerOrNext || {};
    }
    const sub = super.subscribe(observer);
    // 若订阅成功，重放缓存
    if (!sub.closed && !this._terminated) {
      for (const v of this._buffer.slice()) {
        if (typeof observer.next === "function") observer.next(v);
      }
    }
    return sub;
  }
}

// ============================================================
// 测试用例
// ============================================================
console.log("===== 960. 手写 RxJS Subject =====");

// --- 测试 1：Subject 多播 —— 多个订阅者收到相同值 ---
console.log("\n--- 测试 1：Subject 多播 ---");
const subject = new Subject();

const sub1 = subject.subscribe({
  next: (v) => console.log("  订阅者 A 收到:", v),
  error: (e) => console.log("  订阅者 A error:", e),
  complete: () => console.log("  订阅者 A complete"),
});

const sub2 = subject.subscribe((v) => console.log("  订阅者 B 收到:", v));

console.log("发送 1, 2:");
subject.next(1);
subject.next(2);

// 第三个订阅者较晚加入
console.log("订阅者 C 加入后发送 3:");
const sub3 = subject.subscribe((v) => console.log("  订阅者 C 收到:", v));
subject.next(3);

// 订阅者 A 取消订阅
console.log("订阅者 A 取消订阅后发送 4:");
sub1.unsubscribe();
subject.next(4);

// complete 后所有订阅者收到终止
console.log("调用 complete:");
subject.complete();
// complete 后再 next 应被忽略
subject.next(5);

// --- 测试 2：Subject 终止后新订阅者立即收到终止信号 ---
console.log("\n--- 测试 2：终止后再订阅 ---");
const erroredSubject = new Subject();
erroredSubject.error(new Error("already failed"));
console.log("订阅已 error 的 Subject:");
erroredSubject.subscribe({
  next: (v) => console.log("  next:", v),
  error: (e) => console.log("  立即 error:", e.message),
  complete: () => console.log("  complete"),
});

// --- 测试 3：BehaviorSubject —— 新订阅者立即收到当前值 ---
console.log("\n--- 测试 3：BehaviorSubject ---");
const behavior = new BehaviorSubject(0);
console.log("初始 value:", behavior.value);

behavior.subscribe((v) => console.log("  早期订阅者:", v));
behavior.next(1);
behavior.next(2);

console.log("晚期订阅者（应立即收到 2）:");
behavior.subscribe((v) => console.log("  晚期订阅者:", v));
console.log("当前 value:", behavior.value);

// --- 测试 4：ReplaySubject —— 重放缓存 ---
console.log("\n--- 测试 4：ReplaySubject (bufferSize=2) ---");
const replay = new ReplaySubject(2);
replay.next("a");
replay.next("b");
replay.next("c"); // 'a' 被挤出，缓存为 ['b','c']

console.log("晚期订阅者（应重放 b, c）:");
replay.subscribe((v) => console.log("  重放:", v));

replay.next("d");
console.log("发送 d 后所有订阅者都收到:");

// --- 测试 5：Subject 作为 Observable 使用 ---
console.log("\n--- 测试 5：asObservable 隐藏广播能力 ---");
const secret = new Subject();
const observable = secret.asObservable();
// 外部只能 subscribe，不能 next（无该方法）
observable.subscribe((v) => console.log("  asObservable 订阅者:", v));
// secret.next(...) 仍可在内部使用
secret.next("broadcast via internal reference");
secret.complete();

console.log("\n--- 全部测试结束 ---");
