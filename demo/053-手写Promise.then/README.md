# 053 - 手写 Promise 的 then 方法

> then 是 Promise 的核心：注册状态回调 + 返回新 Promise 实现链式调用。
> 本 demo 单独拆解 then 的实现逻辑（完整版见 [052-手写Promise](../052-手写Promise)）。

## then 的三个核心问题

1. **异步执行**：回调必须等状态落定后异步调用（微任务）；
2. **三种状态的处理**：已成功 / 已失败 / pending（收集回调）；
3. **链式调用**：then 返回新 Promise，处理回调的返回值（thenable 递归解析）。

## 代码实现

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status !== 'pending') return;
      this.status = 'fulfilled';
      this.value = value;
      this.onFulfilledCallbacks.forEach((fn) => fn()); // 触发收集的回调
    };

    const reject = (reason) => {
      if (this.status !== 'pending') return;
      this.status = 'rejected';
      this.reason = reason;
      this.onRejectedCallbacks.forEach((fn) => fn());
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // ===== 第一部分：值穿透 =====
    // 不传回调时构造默认回调，保证值/错误可以穿透到下一个 then
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };

    // ===== 第二部分：返回新 Promise 实现链式调用 =====
    const promise2 = new MyPromise((resolve, reject) => {
      // 封装「成功回调的异步执行」
      const runFulfilled = () => {
        // setTimeout 模拟微任务（原生是 queueMicrotask / MutationObserver）
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value); // 执行回调拿返回值
            resolvePromise(promise2, x, resolve, reject); // 解析返回值
          } catch (e) {
            reject(e); // 回调抛错 -> promise2 rejected
          }
        }, 0);
      };

      // 封装「失败回调的异步执行」
      const runRejected = () => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      };

      // ===== 第三部分：根据当前状态分发 =====
      if (this.status === 'fulfilled') {
        runFulfilled();
      } else if (this.status === 'rejected') {
        runRejected();
      } else {
        // pending：异步任务未完成，先收集回调
        this.onFulfilledCallbacks.push(runFulfilled);
        this.onRejectedCallbacks.push(runRejected);
      }
    });

    return promise2;
  }
}

// ===== 第四部分：解析 then 回调返回值 =====
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    // 返回自身：永远等待，直接报错
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false; // 防止 thenable 的 resolve/reject 被多次调用
    try {
      const then = x.then;
      if (typeof then === 'function') {
        // x 是 thenable：等待其落定
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject); // 递归解析
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x); // 普通对象
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x); // 基本类型
  }
}
```

## 关键场景验证

```js
// 1. 同步落定：立即安排异步执行
MyPromise.resolve(1).then((v) => console.log(v)); // 1（异步输出）

// 2. 异步落定：pending 时收集回调，resolve 时触发
new MyPromise((resolve) => {
  setTimeout(() => resolve('延迟数据'), 500);
}).then((v) => console.log(v)); // 500ms 后输出：延迟数据

// 3. 值穿透：不传回调，值直接传给下一个 then
MyPromise.resolve('穿透值')
  .then()
  .then()
  .then((v) => console.log(v)); // 穿透值

// 4. 错误穿透：reject 后一路传到 catch
MyPromise.reject(new Error('错误'))
  .then(() => {})
  .then(() => {})
  .catch((e) => console.log(e.message)); // 错误

// 5. then 中返回 Promise：链式等待
MyPromise.resolve(1)
  .then((v) => {
    return new MyPromise((resolve) => {
      setTimeout(() => resolve(v + 1), 300);
    });
  })
  .then((v) => console.log(v)); // 300ms 后输出：2

// 6. 多次 then 同一个 Promise：每个 then 相互独立
const p = MyPromise.resolve('共享值');
p.then((v) => console.log('第一个 then:', v)); // 共享值
p.then((v) => console.log('第二个 then:', v)); // 共享值
```
