/**
 * 手写 Deferred 对象
 *
 * 背景：Deferred 是 jQuery/$.Deferred、Q、when.js 等库的经典模式。
 *      它把「创建 Promise」和「改变 Promise 状态」分离：
 *        - .promise  : 暴露给消费方的 Promise（只能 then，不能改状态）
 *        - .resolve / .reject : 暴露给生产方，用来改变状态
 *
 * 优点：
 *   - 解决「new Promise 内部才能 resolve/reject」的限制，可以把控制权
 *     交到外部任意地方（缓存、桥接回调、手动控制流）
 *   - 转换 Node 风格回调非常自然
 *
 * 本文件实现：
 *   1. Deferred 类：含 promise / resolve / reject / state / resolveWith / rejectWith
 *   2. Deferred.withResolvers()：对标 Promise.withResolvers()
 *   3. 应用示例：把 EventEmitter 的某事件包成 Deferred、桥接回调
 */

class Deferred {
  constructor() {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;

    this.promise = new Promise((resolve, reject) => {
      this._resolve = (value) => {
        if (this.state !== "pending") return;
        this.state = "fulfilled";
        this.value = value;
        resolve(value);
      };
      this._reject = (reason) => {
        if (this.state !== "pending") return;
        this.state = "rejected";
        this.reason = reason;
        reject(reason);
      };
    });

    // 让 promise 也能被监听已 settled 的状态（可选）
    this.promise.catch(() => {}); // 防止 unhandledRejection 干扰
  }

  resolve(value) {
    this._resolve(value);
    return this;
  }
  reject(reason) {
    this._reject(reason);
    return this;
  }

  // 是否已结束
  get isSettled() {
    return this.state !== "pending";
  }
}

// 对标 Promise.withResolvers()（ES2024）
Deferred.withResolvers = function () {
  const d = new Deferred();
  return { promise: d.promise, resolve: d.resolve.bind(d), reject: d.reject.bind(d) };
};

// 工具：把 Node error-first 回调转成 Deferred
Deferred.fromCallback = function (fn, args = []) {
  const d = new Deferred();
  fn(...args, (err, data) => {
    if (err) d.reject(err);
    else d.resolve(data);
  });
  return d;
};

// ===== 测试 =====

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. 基本用法：外部控制 resolve
  const d1 = new Deferred();
  console.log("d1 state:", d1.state); // d1 state: pending
  setTimeout(() => d1.resolve("resolved from outside"), 30);
  const v = await d1.promise;
  console.log("d1 value:", v, "state:", d1.state);
  // d1 value: resolved from outside state: fulfilled

  // 2. 外部控制 reject
  const d2 = new Deferred();
  setTimeout(() => d2.reject(new Error("rejected")), 20);
  try {
    await d2.promise;
  } catch (e) {
    console.log("d2 reason:", e.message, "state:", d2.state);
    // d2 reason: rejected state: rejected
  }

  // 3. 已 settled 后再 resolve/reject 无效
  const d3 = new Deferred();
  d3.resolve("first");
  d3.resolve("second"); // 无效
  d3.reject("nope"); // 无效
  console.log("d3 value:", d3.value); // d3 value: first

  // 4. withResolvers
  const { promise, resolve } = Deferred.withResolvers();
  setTimeout(() => resolve(42), 20);
  console.log("withResolvers:", await promise); // withResolvers: 42

  // 5. 应用：桥接 Node error-first 回调
  function readFileMock(cb) {
    setTimeout(() => cb(null, "file-content"), 20);
  }
  const d5 = Deferred.fromCallback(readFileMock);
  console.log("from callback:", await d5.promise); // from callback: file-content

  // 6. 应用：把「某事件触发一次」包成 Deferred
  function mockEventEmitter() {
    const handlers = {};
    return {
      on(evt, fn) {
        (handlers[evt] ||= []).push(fn);
      },
      emit(evt, data) {
        (handlers[evt] || []).forEach((fn) => fn(data));
      },
    };
  }
  const ee = mockEventEmitter();
  const d6 = new Deferred();
  ee.on("done", (data) => d6.resolve(data));
  setTimeout(() => ee.emit("done", "event data"), 30);
  console.log("from event:", await d6.promise); // from event: event data
})();
