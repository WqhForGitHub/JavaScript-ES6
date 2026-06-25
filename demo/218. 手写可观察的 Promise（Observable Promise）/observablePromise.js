/**
 * 手写可观察的 Promise（Observable Promise）
 *
 * 需求：在原生 Promise 基础上增加「可观察」能力——外部可以监听
 *      它的状态变化（pending -> fulfilled / rejected），并能读取当前状态。
 *
 * 用途：调试、UI 状态展示（loading/success/error）、日志埋点等。
 *
 * 设计 ObservablePromise：
 *   - 继承/包裹一个 Promise，保留 then/catch/finally 链式能力
 *   - 额外暴露：
 *       .state  -> 'pending' | 'fulfilled' | 'rejected'
 *       .value  -> 成功值（fulfilled 后）
 *       .reason -> 失败原因（rejected 后）
 *       .subscribe(listener) -> 订阅状态变化，返回取消订阅函数
 *       .onFulfilled(cb) / .onRejected(cb) -> 便捷订阅
 *   - 状态变化时通知所有订阅者
 */

class ObservablePromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this._listeners = new Set();

    this._promise = new Promise((resolve, reject) => {
      const settledResolve = (v) => {
        if (this.state !== "pending") return;
        this.state = "fulfilled";
        this.value = v;
        this._notify();
        resolve(v);
      };
      const settledReject = (r) => {
        if (this.state !== "pending") return;
        this.state = "rejected";
        this.reason = r;
        this._notify();
        reject(r);
      };
      try {
        executor(settledResolve, settledReject);
      } catch (e) {
        settledReject(e);
      }
    });
  }

  _notify() {
    const snapshot = {
      state: this.state,
      value: this.value,
      reason: this.reason,
    };
    this._listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (_) {}
    });
  }

  // 订阅状态变化（仅触发一次，因为状态只变一次）
  subscribe(listener) {
    this._listeners.add(listener);
    // 若已 settled，立即通知一次
    if (this.state !== "pending") {
      Promise.resolve().then(() => this._notify());
    }
    return () => this._listeners.delete(listener);
  }

  onFulfilled(cb) {
    return this.subscribe((s) => {
      if (s.state === "fulfilled") cb(s.value);
    });
  }

  onRejected(cb) {
    return this.subscribe((s) => {
      if (s.state === "rejected") cb(s.reason);
    });
  }

  // 透传 then/catch/finally，保持 Promise 接口
  then(onFulfilled, onRejected) {
    return this._promise.then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this._promise.catch(onRejected);
  }
  finally(cb) {
    return this._promise.finally(cb);
  }
}

// ===== 测试 =====

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. 成功：观察状态变化
  const p1 = new ObservablePromise((resolve) => {
    setTimeout(() => resolve("hello"), 40);
  });
  console.log("initial state:", p1.state); // initial state: pending
  p1.subscribe((s) =>
    console.log("  [p1 listener] state:", s.state, "value:", s.value),
  );
  p1.onFulfilled((v) => console.log("  [p1 onFulfilled] got:", v));
  await p1;
  console.log("after await state:", p1.state, "value:", p1.value);
  // after await state: fulfilled value: hello

  // 2. 失败：观察 reason
  const p2 = new ObservablePromise((_, reject) => {
    setTimeout(() => reject(new Error("boom")), 30);
  });
  p2.onRejected((r) => console.log("  [p2 onRejected]:", r.message));
  try {
    await p2;
  } catch (e) {
    console.log("p2 state:", p2.state, "reason:", p2.reason.message);
    // p2 state: rejected reason: boom
  }

  // 3. 同步 resolve：订阅后立即收到通知
  const p3 = new ObservablePromise((resolve) => resolve("sync"));
  let received;
  p3.subscribe((s) => (received = s));
  await sleep(10); // 等微任务
  console.log(
    "sync received:",
    received && received.state,
    received && received.value,
  );
  // sync received: fulfilled sync

  // 4. 取消订阅
  const p4 = new ObservablePromise((resolve) =>
    setTimeout(() => resolve("x"), 30),
  );
  let callCount = 0;
  const unsub = p4.subscribe(() => callCount++);
  unsub();
  await p4;
  console.log("unsubscribed callCount:", callCount); // unsubscribed callCount: 0

  // 5. 链式调用仍可用
  const r5 = await new ObservablePromise((resolve) => resolve(1)).then(
    (v) => v + 41,
  );
  console.log("chained:", r5); // chained: 42
})();
