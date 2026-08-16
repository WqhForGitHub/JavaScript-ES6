# 054 - 手写 Promise.all 方法

> `Promise.all(iterable)`：接收一组 Promise，**全部** fulfilled 才 fulfilled（结果按原顺序），
> 任何一个 rejected 立即 rejected。

## 代码实现

```js
MyPromise.myAll = function (promises) {
  return new MyPromise((resolve, reject) => {
    // 参数校验：必须可迭代
    if (promises === null || typeof promises[Symbol.iterator] !== 'function') {
      return reject(new TypeError(`${promises} is not iterable`));
    }

    const list = Array.from(promises);
    const result = new Array(list.length); // 保持结果顺序
    let resolvedCount = 0; // 已完成计数
    let count = list.length;

    // 空数组：直接 resolve([])
    if (count === 0) {
      return resolve([]);
    }

    list.forEach((item, index) => {
      // 非 Promise 值用 Promise.resolve 包装
      Promise.resolve(item).then(
        (value) => {
          result[index] = value; // 按原下标存放，保证顺序
          resolvedCount++;

          // 全部完成才 resolve
          if (resolvedCount === count) {
            resolve(result);
          }
        },
        (reason) => {
          reject(reason); // 任一失败：立即 reject（状态不可逆，只生效一次）
        }
      );
    });
  });
};
```

## 独立版本（不依赖 MyPromise）

```js
function myAll(promises) {
  return new Promise((resolve, reject) => {
    const list = Array.from(promises);
    const result = [];
    let resolvedCount = 0;

    if (list.length === 0) return resolve([]);

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          result[index] = value;
          if (++resolvedCount === list.length) {
            resolve(result);
          }
        },
        (reason) => reject(reason)
      );
    });
  });
}
```

## 测试

```js
const delay = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// 1. 全部成功：结果按传入顺序（不管完成先后）
myAll([delay('a', 300), delay('b', 100), delay('c', 200)]).then((values) => {
  console.log(values); // ['a', 'b', 'c']（按原顺序，不是完成顺序）
});

// 2. 任一失败：立即 reject，取第一个失败的值
myAll([delay('a', 300), Promise.reject(new Error('失败了'))]).catch((err) => {
  console.error(err.message); // 失败了
});

// 3. 混合普通值
myAll([1, delay('x', 100), '静态值']).then((values) => {
  console.log(values); // [1, 'x', '静态值']
});

// 4. 空数组
myAll([]).then((values) => {
  console.log(values); // []（注意：是同步 resolve 的微任务）
});

// 5. 传入字符串（可迭代，每个字符作为元素）
myAll('abc').then((values) => {
  console.log(values); // ['a', 'b', 'c']
});

// 6. 实际应用：并发多个请求
function fetchUser(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id }), 200));
}
function fetchOrders(id) {
  return new Promise((resolve) => setTimeout(() => resolve([`订单${id}-1`]), 300));
}

myAll([fetchUser(1), fetchOrders(1)]).then(([user, orders]) => {
  console.log(user, orders); // { id: 1 } ['订单1-1']
});
```

## 注意点

- 结果顺序 = 传入顺序，与完成时间无关（用下标写入 `result[index]`）；
- `resolve` / `reject` 只会生效一次，因此「任一失败立即结束」天然成立；
- 非Promise 值会通过 `Promise.resolve` 包装，普通值直接算成功；
- 空 iterable 返回 fulfilled 的 `[]`。

## 相关：allSettled / any 简单实现

```js
// allSettled：等待全部落定（无论成败）
MyPromise.myAllSettled = function (promises) {
  return new MyPromise((resolve) => {
    const list = Array.from(promises);
    const result = [];
    let settledCount = 0;

    if (list.length === 0) return resolve([]);

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          result[index] = { status: 'fulfilled', value };
          if (++settledCount === list.length) resolve(result);
        },
        (reason) => {
          result[index] = { status: 'rejected', reason };
          if (++settledCount === list.length) resolve(result);
        }
      );
    });
  });
};

// any：任意一个成功即成功（全失败才失败，聚合错误）
MyPromise.myAny = function (promises) {
  return new MyPromise((resolve, reject) => {
    const list = Array.from(promises);
    const errors = [];
    let rejectedCount = 0;

    if (list.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => resolve(value),
        (reason) => {
          errors[index] = reason;
          if (++rejectedCount === list.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};
```
