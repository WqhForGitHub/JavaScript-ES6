# 026 - 用 setTimeout 模拟实现 setInterval

> `setInterval` 存在两个问题：
> 1. 后一次定时任务会在前一次**执行完之前**被忽略（时间间隔不准）；
> 2. 某些环境下（如页面隐藏）会堆积定时器。
>
> 用 `setTimeout` 递归调用的方式可以保证：**上一次执行完之后再等待固定时间**，时间更精确。

## 基础版

```js
function mySetInterval(fn, interval) {
  let timerId = null;

  function loop() {
    timerId = setTimeout(() => {
      fn(); // 先执行回调
      loop(); // 再安排下一次（保证执行时间不影响间隔）
    }, interval);
  }

  loop();

  // 返回取消函数（也可返回句柄对象）
  return {
    clear() {
      clearTimeout(timerId);
    },
  };
}

// 测试
let count = 0;
const timer = mySetInterval(() => {
  console.log(++count);
  if (count >= 5) timer.clear(); // 打印到 5 停止
}, 1000);
// 每 1 秒打印 1、2、3、4、5
```

## 防止 timerId 被覆盖问题（完善版）

```js
function mySetInterval(fn, interval) {
  let timerId = null;
  let cleared = false;

  const loop = () => {
    if (cleared) return;
    timerId = setTimeout(() => {
      fn();
      loop();
    }, interval);
  };

  loop();

  return {
    clear() {
      cleared = true;
      clearTimeout(timerId);
      timerId = null;
    },
  };
}

// 使用
const timer = mySetInterval(() => console.log(new Date().toLocaleTimeString()), 2000);

setTimeout(() => timer.clear(), 10000); // 10 秒后停止
```

## 对照：原生 setInterval 的间隔误差演示

```js
// 原生 setInterval：回调耗时会被忽略，导致实际间隔不准
setInterval(() => {
  const start = Date.now();
  // 模拟耗时 500ms 的同步任务
  while (Date.now() - start < 500) {}
  console.log('setInterval 触发');
}, 1000);

// mySetInterval：每次执行完再计时，间隔 = 1000 + 执行时间，但每次都有完整间隔
```
