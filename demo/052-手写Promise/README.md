# 052 - 手写 Promise（含 then，符合 Promises/A+ 规范核心）

## 核心要点

1. 三个状态：`pending`、`fulfilled`、`rejected`，状态只能从 pending -> fulfilled/rejected（不可逆）；
2. `then` 注册的回调在状态落定后**异步执行**（微任务，这里用 setTimeout 模拟）；
3. `then` 返回新 Promise，实现链式调用；
4. 回调返回值会传递给下一个 then；返回 Promise 则等待其落定。

## 完整代码

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.status = PENDING; // 当前状态
    this.value = undefined; // 成功值
    this.reason = undefined; // 失败原因
    this.onFulfilledCallbacks = []; // 成功回调队列
    this.onRejectedCallbacks = []; // 失败回调队列

    const resolve = (value) => {
      // 状态只能从 pending 变更，保证不可逆
      if (this.status !== PENDING) return;
      this.status = FULFILLED;
      this.value = value;
      // 依次执行收集到的回调
      this.onFulfilledCallbacks.forEach((fn) => fn());
    };

    const reject = (reason) => {
      if (this.status !== PENDING) return;
      this.status = REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((fn) => fn());
    };

    // executor 内部抛错直接 reject
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // 值穿透：then() 不传回调时把值/原因传给下一个
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };

    // then 返回新 Promise 实现链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        // 用 setTimeout 模拟微任务异步执行
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            // 把回调返回值传入 resolvePromise 处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e); // 回调抛错 => promise2 失败
          }
        }, 0);
      };

      const handleRejected = () => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      };

      if (this.status === FULFILLED) {
        handleFulfilled(); // 已成功：直接执行
      } else if (this.status === REJECTED) {
        handleRejected(); // 已失败：直接执行
      } else {
        // pending：收集回调，等 resolve/reject 时执行
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (reason) =>
        MyPromise.reject(callback()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}

/**
 * 解析 then 回调的返回值 x（Promises/A+ 2.3）
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 1. 不能返回自身，否则永远 pending
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected'));
  }

  // 2. x 是对象或函数时，检查 thenable
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 保证 then 只被调用一次
    let called = false;
    try {
      const then = x.then; // 取 then 可能抛错（getter）
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            // 递归解析：y 可能还是 thenable
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 普通对象：直接成功
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // 3. 基本类型：直接成功
    resolve(x);
  }
}
```

## 测试

```js
// 1. 基本用法
new MyPromise((resolve) => {
  setTimeout(() => resolve('成功'), 1000);
}).then((value) => console.log(value)); // 1 秒后输出：成功

// 2. 异步执行顺序
console.log('start');
MyPromise.resolve(1).then((v) => console.log('then:', v));
console.log('end');
// 输出顺序：start -> end -> then: 1（then 回调异步执行）

// 3. 链式调用 + 值传递
MyPromise.resolve(1)
  .then((v) => v + 1)
  .then((v) => {
    console.log(v); // 2
    return v * 10;
  })
  .then((v) => console.log(v)); // 20

// 4. 返回 Promise：等待其落定
MyPromise.resolve(1)
  .then((v) => new MyPromise((resolve) => setTimeout(() => resolve(v + 1), 1000)))
  .then((v) => console.log(v)); // 1 秒后输出：2

// 5. 错误捕获与穿透
MyPromise.reject(new Error('失败了'))
  .then(() => console.log('不会执行'))
  .catch((err) => {
    console.log(err.message); // 失败了
    return '已恢复';
  })
  .then((v) => console.log(v)); // 已恢复

// 6. executor 抛错
new MyPromise(() => {
  throw new Error('构造函数出错');
}).catch((e) => console.log(e.message)); // 构造函数出错
```
