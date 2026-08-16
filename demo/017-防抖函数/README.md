# 017 - 防抖函数（debounce）

> 防抖：事件触发后延迟 n 秒执行回调，若在这 n 秒内**再次触发**，则重新计时。
> 应用场景：搜索框输入联想、窗口 resize、按钮防重复点击、表单提交。

## 基础版

```js
function debounce(fn, delay = 500) {
  let timer = null;
  return function (...args) {
    // 每次触发先清除上一次的定时器
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args); // 保持 this 和参数
    }, delay);
  };
}

// 使用
const onSearch = debounce(function (keyword) {
  console.log('搜索：', keyword, this);
}, 500);

onSearch('j');
onSearch('ja');
onSearch('jav'); // 只有最后一次会执行：搜索：jav
```

## 立即执行版（首次触发马上执行，之后冷却）

```js
function debounce(fn, delay = 500, immediate = false) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);

    if (immediate) {
      // 没有定时器说明处于冷却期外，立即执行
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null; // 冷却结束
      }, delay);
      if (callNow) fn.apply(this, args);
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    }
  };
}
```

## 完整版：支持取消

```js
function debounce(fn, delay = 500, immediate = false) {
  let timer = null;

  const debounced = function (...args) {
    clearTimeout(timer);
    if (immediate) {
      const callNow = !timer;
      timer = setTimeout(() => (timer = null), delay);
      if (callNow) fn.apply(this, args);
    } else {
      timer = setTimeout(() => fn.apply(this, args), delay);
    }
  };

  // 取消防抖
  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

// 测试立即执行版
const say = debounce(
  function (msg) {
    console.log(msg);
  },
  1000,
  true
);

say('hello'); // 立即打印 hello
say('world'); // 冷却期内，忽略
say('!!!'); // 冷却期内，忽略
```
