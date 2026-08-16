# 044 - 手写 Promise.race 方法

> `Promise.race(iterable)`：返回一个 Promise，**任意一个**入参 Promise
> 状态先变更（fulfilled 或 rejected），结果就采用它的结果；
> 一旦落定，其他 Promise 的结果将被忽略。

## 代码实现

```js
MyPromise.myRace = function (promises) {
  return new MyPromise((resolve, reject) => {
    // 支持数组等可迭代对象
    const list = Array.from(promises);

    for (const item of list) {
      // 非 Promise 值直接 resolve（Promise.resolve 的效果）
      Promise.resolve(item).then(resolve, reject);
      // resolve/reject 一旦调用过一次，后续调用自动失效，
      // 因此无需额外的 settled 标记
    }
  });
};
```

## 不依赖自定义 MyPromise 的独立版本

```js
function myRace(promises) {
  return new Promise((resolve, reject) => {
    // 参数校验
    if (promises === null || typeof promises[Symbol.iterator] !== 'function') {
      return reject(new TypeError('argument is not iterable'));
    }

    for (const item of Array.from(promises)) {
      Promise.resolve(item).then(resolve, reject);
    }
  });
}
```

## 测试

```js
// 1. 最快 resolve 的胜出
const p1 = new Promise((resolve) => setTimeout(() => resolve('慢'), 300));
const p2 = new Promise((resolve) => setTimeout(() => resolve('快'), 100));

myRace([p1, p2]).then((value) => console.log(value)); // 快

// 2. 最先 reject 的胜出
const p3 = new Promise((_, reject) => setTimeout(() => reject(new Error('失败')), 100));
const p4 = new Promise((resolve) => setTimeout(() => resolve('成功'), 200));

myRace([p3, p4]).catch((err) => console.error(err.message)); // 失败

// 3. 普通值（会立即胜出）
myRace([42, new Promise((resolve) => setTimeout(resolve, 1000, '迟到的'))]).then(
  (v) => console.log(v) // 42
);

// 4. 空数组：永远 pending（与原生一致）
const foreverPending = myRace([]);
console.log(foreverPending); // Promise { <pending> }

// 5. 经典应用：请求超时控制
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`请求超时 ${ms}ms`)), ms)
  );
  return myRace([promise, timeout]);
}

const fakeRequest = new Promise((resolve) => setTimeout(() => resolve('数据'), 3000));

withTimeout(fakeRequest, 1000).catch((e) => console.error(e.message)); // 请求超时 1000ms
```

## 注意点

- 入参中任何一个先落定，race 的状态就随之落定，**不可逆转**；
- 后续 Promise 即使 reject，也不会触发 race 的 catch（unhandledrejection 需自行注意）；
- 空数组时 race 永远处于 pending 状态。
