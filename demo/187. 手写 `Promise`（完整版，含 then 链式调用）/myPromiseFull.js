/**
 * 手写 Promise（完整版，含 then 链式调用）
 *
 * 实现要点：
 *   1. 三态：pending / fulfilled / rejected，状态不可逆
 *   2. 支持同一个 Promise 上多次 then（用数组保存回调）
 *   3. then 回调异步执行（用 queueMicrotask 模拟微任务）
 *   4. then 返回新 Promise，实现完整的「Promise 解析过程」：
 *      - 回调返回普通值 -> 新 Promise fulfilled
 *      - 回调返回 Promise -> 等待该 Promise 决议
 *      - 回调抛错 -> 新 Promise rejected
 *      - 回调返回当前 then 的新 Promise 自身 -> 抛 TypeError
 *   5. 值穿透：then 的非函数参数会被忽略，值/原因继续传递
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function isObject(x) {
  return x !== null && (typeof x === "object" || typeof x === "function");
}

class MyPromiseFull {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCbs = [];
    this.onRejectedCbs = [];

    const resolve = (value) => {
      // resolve 一个 thenable / Promise 需要递归解析
      if (value instanceof MyPromiseFull) {
        value.then(resolve, reject);
        return;
      }
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCbs.forEach((fn) => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCbs.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    // 值穿透
    const realFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    const realRejected =
      typeof onRejected === "function"
        ? onRejected
        : (e) => {
            throw e;
          };

    const promise2 = new MyPromiseFull((resolve, reject) => {
      const wrapFulfilled = () => {
        queueMicrotask(() => {
          try {
            const x = realFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      };

      const wrapRejected = () => {
        queueMicrotask(() => {
          try {
            const x = realRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      };

      if (this.state === FULFILLED) {
        wrapFulfilled();
      } else if (this.state === REJECTED) {
        wrapRejected();
      } else {
        this.onFulfilledCbs.push(wrapFulfilled);
        this.onRejectedCbs.push(wrapRejected);
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(cb) {
    return this.then(
      (value) => MyPromiseFull.resolve(cb()).then(() => value),
      (reason) =>
        MyPromiseFull.resolve(cb()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromiseFull) return value;
    return new MyPromiseFull((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromiseFull((_, reject) => reject(reason));
  }

  static all(list) {
    return new MyPromiseFull((resolve, reject) => {
      const arr = Array.from(list);
      const res = [];
      let count = 0;
      if (arr.length === 0) return resolve([]);
      arr.forEach((p, i) => {
        MyPromiseFull.resolve(p).then(
          (v) => {
            res[i] = v;
            if (++count === arr.length) resolve(res);
          },
          (e) => reject(e)
        );
      });
    });
  }

  static race(list) {
    return new MyPromiseFull((resolve, reject) => {
      Array.from(list).forEach((p) =>
        MyPromiseFull.resolve(p).then(resolve, reject)
      );
    });
  }
}

/** Promise 解析过程：处理 then 回调的返回值 x */
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  if (x instanceof MyPromiseFull) {
    x.then(resolve, reject);
  } else if (isObject(x)) {
    // 处理 thenable
    let then;
    try {
      then = x.then;
    } catch (err) {
      return reject(err);
    }
    if (typeof then === "function") {
      let called = false;
      try {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (err) {
        if (called) return;
        reject(err);
      }
    } else {
      resolve(x);
    }
  } else {
    resolve(x);
  }
}

// ===== 测试 =====

// 1. 链式返回普通值
MyPromiseFull.resolve(1)
  .then((v) => v + 1)
  .then((v) => v * 10)
  .then((v) => console.log("chain value:", v)); // chain value: 20

// 2. 链式返回 Promise（异步穿透）
MyPromiseFull.resolve(1)
  .then((v) => new MyPromiseFull((r) => setTimeout(() => r(v + 2), 50)))
  .then((v) => console.log("chain promise:", v)); // chain promise: 3

// 3. 错误捕获穿透
MyPromiseFull.reject("err")
  .then(() => "should skip")
  .catch((e) => {
    console.log("caught:", e); // caught: err
    return "recovered";
  })
  .then((v) => console.log("after catch:", v)); // after catch: recovered

// 4. 多次 then 同一个 Promise
const shared = MyPromiseFull.resolve(5);
shared.then((v) => console.log("shared 1:", v)); // shared 1: 5
shared.then((v) => console.log("shared 2:", v)); // shared 2: 5

// 5. all
MyPromiseFull.all([
  MyPromiseFull.resolve(1),
  2,
  new MyPromiseFull((r) => setTimeout(() => r(3), 30)),
]).then((arr) => console.log("all:", arr)); // all: [ 1, 2, 3 ]

// 6. finally
MyPromiseFull.resolve("ok")
  .finally(() => console.log("finally runs"))
  .then((v) => console.log("finally then:", v)); // finally runs -> finally then: ok
