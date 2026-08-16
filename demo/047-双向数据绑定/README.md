# 047 - JS 实现双向数据绑定

> 双向绑定：数据（model）变化自动更新视图（view），视图变化自动更新数据。
> Vue 的核心原理：`Object.defineProperty`（Vue2）/ `Proxy`（Vue3）+ 事件监听。

## 方式一：Object.defineProperty（Vue2 原理）

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>双向绑定 - defineProperty</title>
  </head>
  <body>
    <input id="input" type="text" />
    <p id="text"></p>

    <script>
      const data = { message: 'hello' };
      const input = document.getElementById('input');
      const text = document.getElementById('text');

      // 1. 数据劫持：拦截 message 的读写
      Object.defineProperty(data, 'message', {
        get() {
          return value;
        },
        set(newValue) {
          value = newValue;
          // 数据 -> 视图
          input.value = newValue;
          text.innerHTML = newValue;
        },
        enumerable: true,
        configurable: true,
      });

      // 2. 视图 -> 数据：监听 input 事件
      input.addEventListener('input', function (e) {
        data.message = e.target.value; // 触发 set
      });

      // 3. 初始化
      data.message = 'hello';

      // 2 秒后修改数据，验证 数据 -> 视图
      setTimeout(() => {
        data.message = '数据变了，视图也变了';
      }, 2000);
    </script>
  </body>
</html>
```

## 方式二：Proxy（Vue3 原理，支持整个对象）

```html
<!DOCTYPE html>
<html>
  <body>
    <input id="input" type="text" />
    <p id="text"></p>

    <script>
      const input = document.getElementById('input');
      const text = document.getElementById('text');

      const data = { message: 'hello' };

      const proxy = new Proxy(data, {
        get(target, key, receiver) {
          return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
          const result = Reflect.set(target, key, value, receiver);
          // 数据 -> 视图
          input.value = value;
          text.innerHTML = value;
          return result;
        },
      });

      // 视图 -> 数据
      input.addEventListener('input', (e) => {
        proxy.message = e.target.value;
      });

      // 初始化
      proxy.message = 'hello';
    </script>
  </body>
</html>
```

## 纯 JS 演示版（无 DOM，看原理即可）

```js
// 模拟 Vue 的响应式 + v-model
function defineReactive(obj, key, val) {
  const subscribers = []; // 依赖收集（简化版 watcher）

  Object.defineProperty(obj, key, {
    get() {
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 通知所有订阅者更新
      subscribers.forEach((fn) => fn(newVal));
    },
  });

  obj.__watch = obj.__watch || {};
  obj.__watch[key] = (fn) => subscribers.push(fn);
}

const state = {};
defineReactive(state, 'message', '');

// 订阅变化（模拟视图更新）
state.__watch.message((newVal) => {
  console.log('视图更新为：', newVal);
});

// 模拟输入框输入 -> 修改数据
state.message = '你好';
// 输出：视图更新为：你好

// 2 秒后模拟程序修改数据 -> 视图自动更新
setTimeout(() => {
  state.message = '数据驱动视图';
  // 输出：视图更新为：数据驱动视图
}, 2000);
```

## defineProperty vs Proxy

| 对比            | Object.defineProperty             | Proxy        |
| --------------- | --------------------------------- | ------------ |
| 劫持粒度        | 逐个属性劫持                      | 代理整个对象 |
| 新增/删除属性   | 无法监听（Vue2 需 $set/$delete）  | 可监听       |
| 数组索引/length | 无法直接监听（Vue2 重写数组方法） | 可监听       |
| 兼容性          | IE9+                              | 不支持 IE    |
