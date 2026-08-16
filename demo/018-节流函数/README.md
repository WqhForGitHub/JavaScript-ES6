# 018 - 节流函数（throttle）

> 节流：单位时间内只执行**一次**函数，无论触发多少次。
> 应用场景：滚动加载、滚动位置监听、鼠标移动、高频点击。

## 方式一：时间戳版（首次立即执行，停止触发后不再执行）

```js
function throttle(fn, interval = 500) {
  let lastTime = 0; // 上次执行时间
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

## 方式二：定时器版（首次延迟执行，停止触发后还会执行最后一次）

```js
function throttle(fn, interval = 500) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, interval);
    }
  };
}
```

## 方式三：结合版（首尾都执行，推荐）

```js
function throttle(fn, interval = 500) {
  let lastTime = 0;
  let timer = null;

  return function (...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime); // 距离下次执行的剩余时间

    if (remaining <= 0) {
      // 时间已到，立即执行
      clearTimeout(timer);
      timer = null;
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      // 未到时间且没有等待中的任务：安排最后一次触发
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// 测试
const onScroll = throttle(function (e) {
  console.log('滚动位置：', window.scrollY);
}, 1000);

window.addEventListener('scroll', onScroll);
```

## 浏览器使用示例

```html
<!DOCTYPE html>
<html>
<body style="height: 3000px">
  <script>
    function throttle(fn, interval = 500) {
      let lastTime = 0;
      return function (...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
          lastTime = now;
          fn.apply(this, args);
        }
      };
    }

    window.addEventListener(
      'scroll',
      throttle(() => {
        console.log('scrollY:', window.scrollY);
      }, 1000)
    );
  </script>
</body>
</html>
```

## 防抖 vs 节流

| 对比 | 防抖 debounce | 节流 throttle |
| ---- | ------------- | ------------- |
| 规则 | 停止触发后延迟执行 | 固定时间间隔内只执行一次 |
| 场景 | 搜索输入、resize | 滚动监听、拖拽 |
