# 005 - 红黄绿三个灯不断交替重复亮灯

> 红灯亮 3 秒，绿灯亮 2 秒，黄灯亮 1 秒，循环往复。

## 方式一：回调函数（setTimeout 嵌套）

```js
function red() {
  console.log('红灯亮起，持续 3 秒');
}
function green() {
  console.log('绿灯亮起，持续 2 秒');
}
function yellow() {
  console.log('黄灯亮起，持续 1 秒');
}

const step = () => {
  red();
  setTimeout(() => {
    green();
    setTimeout(() => {
      yellow();
      setTimeout(step, 1000); // 递归重启一轮
    }, 2000);
  }, 3000);
};

step();
```

## 方式二：Promise 链式调用

```js
function light(color, duration) {
  return new Promise((resolve) => {
    console.log(`${color}灯亮起，持续 ${duration / 1000} 秒`);
    setTimeout(resolve, duration);
  });
}

function run() {
  light('红', 3000)
    .then(() => light('绿', 2000))
    .then(() => light('黄', 1000))
    .then(run); // 循环
}

run();
```

## 方式三：async/await（推荐）

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function light(color, duration) {
  console.log(`${color}灯亮起，持续 ${duration / 1000} 秒`);
  await sleep(duration);
}

async function main() {
  const config = [
    { color: '红', duration: 3000 },
    { color: '绿', duration: 2000 },
    { color: '黄', duration: 1000 },
  ];
  while (true) {
    for (const item of config) {
      await light(item.color, item.duration);
    }
  }
}

main();
```

## 附：浏览器 DOM 版本

```html
<!DOCTYPE html>
<html>
<body>
  <div id="light" style="width: 50px; height: 50px; border-radius: 50%; background: #ccc"></div>
  <script>
    const lightEl = document.getElementById('light');
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function main() {
      const lights = [
        { color: 'red', name: '红', duration: 3000 },
        { color: 'green', name: '绿', duration: 2000 },
        { color: 'yellow', name: '黄', duration: 1000 },
      ];
      while (true) {
        for (const item of lights) {
          console.log(`${item.name}灯亮起`);
          lightEl.style.background = item.color;
          await sleep(item.duration);
        }
      }
    }

    main();
  </script>
</body>
</html>
```
