# 014 - 发布订阅模式（EventEmitter）

> 发布订阅模式：订阅者（Subscriber）通过事件中心（EventEmitter）订阅事件，
> 发布者（Publisher）在合适时机发布事件，事件中心通知所有订阅者。
> 典型应用：Vue 的事件总线、Node.js 的 EventEmitter、DOM 事件。

## 代码实现

```js
class EventEmitter {
  constructor() {
    // 事件中心：{ 事件名: [回调1, 回调2, ...] }
    this.events = {};
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this; // 支持链式调用
  }

  // 订阅一次，触发后自动移除
  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    wrapper.originCallback = callback; // 保存原回调，便于 off 匹配
    this.on(event, wrapper);
    return this;
  }

  // 发布事件
  emit(event, ...args) {
    const callbacks = this.events[event];
    if (!callbacks || callbacks.length === 0) return false;
    // 复制一份，避免回调中 off 导致遍历异常
    callbacks.slice().forEach((cb) => cb.apply(this, args));
    return true;
  }

  // 取消订阅
  off(event, callback) {
    const callbacks = this.events[event];
    if (!callbacks) return this;
    if (!callback) {
      // 不传回调则移除该事件所有订阅
      delete this.events[event];
    } else {
      // 同时匹配 once 包装后的回调与原回调
      const index = callbacks.findIndex((cb) => cb === callback || cb.originCallback === callback);
      if (index !== -1) callbacks.splice(index, 1);
    }
    return this;
  }
}
```

## 使用示例

```js
const bus = new EventEmitter();

// 订阅
function onLogin(user) {
  console.log(`欢迎，${user.name}！`);
}

bus.on('login', onLogin);

bus.once('login', () => {
  console.log('这是一次性订阅，只触发一次');
});

// 发布
bus.emit('login', { name: '张三' });
// 欢迎，张三！
// 这是一次性订阅，只触发一次

bus.emit('login', { name: '李四' });
// 欢迎，李四！

// 取消订阅
bus.off('login', onLogin);
console.log(bus.emit('login', { name: '王五' })); // false，已无订阅者
```
