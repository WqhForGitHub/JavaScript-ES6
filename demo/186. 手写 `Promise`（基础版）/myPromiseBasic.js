/**
 * 手写 Promise（基础版）
 *
 * 实现要点：
 *   1. 三种状态：pending（等待）、fulfilled（成功）、rejected（失败）
 *   2. 状态一旦从 pending 变为 fulfilled / rejected 就不可再变
 *   3. 保存成功值 value 与失败原因 reason
 *   4. executor 是同步执行的，用 try/catch 捕获异常并 reject
 *   5. then 方法注册成功/失败回调（基础版先实现同步执行回调，
 *      并支持简单的链式：then 返回一个新的 MyPromiseBasic）
 *
 * 注意：基础版暂未处理 then 回调返回 Promise 的异步穿透，
 *      完整版见 myPromiseFull.js
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromiseBasic {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;

    // 基础版仅保存单个回调（不支持多次 then 累积）
    this.onFulfilled = null;
    this.onRejected = null;

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilled && this.onFulfilled(this.value);
      }
    };

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejected && this.onRejected(this.reason);
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    // 值穿透：非函数时直接把值/原因传下去
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (e) => {
            throw e;
          };

    return new MyPromiseBasic((resolve, reject) => {
      const handleFulfilled = (value) => {
        try {
          const result = onFulfilled(value);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      const handleRejected = (reason) => {
        try {
          const result = onRejected(reason);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      if (this.state === FULFILLED) {
        handleFulfilled(this.value);
      } else if (this.state === REJECTED) {
        handleRejected(this.reason);
      } else {
        // pending：暂存，等 resolve/reject 时触发
        this.onFulfilled = handleFulfilled;
        this.onRejected = handleRejected;
      }
    });
  }
}

// ===== 测试 =====

// 1. 基本成功
const p1 = new MyPromiseBasic((resolve) => resolve(1));
p1.then((v) => console.log("p1:", v)); // p1: 1

// 2. 基本失败
const p2 = new MyPromiseBasic((_, reject) => reject("err"));
p2.then(
  (v) => console.log("p2 ok:", v),
  (e) => console.log("p2 fail:", e) // p2 fail: err
);

// 3. 异步 resolve
const p3 = new MyPromiseBasic((resolve) => {
  setTimeout(() => resolve(3), 50);
});
p3.then((v) => console.log("p3:", v)); // p3: 3

// 4. executor 抛错自动 reject
const p4 = new MyPromiseBasic(() => {
  throw new Error("boom");
});
p4.then(null, (e) => console.log("p4 fail:", e.message)); // p4 fail: boom

// 5. 简单链式（同步值传递）
new MyPromiseBasic((resolve) => resolve(10))
  .then((v) => v + 1)
  .then((v) => console.log("chain:", v)); // chain: 11
