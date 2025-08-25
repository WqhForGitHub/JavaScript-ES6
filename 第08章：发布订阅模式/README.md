# deepseek

**发布订阅模式**是一种消息传递范式，用于解耦代码组件。核心思想是：

**发布者（Publisher）** 不直接通知接收者，而是通过一个**事件中心（Event Channel）** 广播消息。**订阅者（Subscriber）** 按需监听特定事件并响应。

## 核心概念：

1. **发布者（Publisher）**：触发事件的对象
2. **订阅者（Subscriber）**：监听事件的对象
3. **事件中心（Event Bus）**：管理事件与订阅者的映射关系
4. **事件（Event）**：消息的标识符（如 `'userLogin'`）

## 实现示例

```javascript
class EventEmitter {
  constructor() {
    this.events = {}; // 存储事件回调：{ eventName: [callback1, callback2] }
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 发布事件
  emit(eventName, ...args) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach(cb => cb.apply(null, args));
    }
  }

  // 取消订阅
  off(eventName, callback) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      this.events[eventName] = callbacks.filter(cb => cb !== callback);
    }
  }
}

// 使用示例
const eventBus = new EventEmitter();

// 订阅登录事件
eventBus.on('userLogin', (user) => {
  console.log(`日志记录：用户 ${user.name} 登录`);
});

// 另一个订阅者
eventBus.on('userLogin', (user) => {
  console.log(`发送欢迎邮件至 ${user.email}`);
});

// 发布事件
eventBus.emit('userLogin', { name: "Alice", email: "alice@example.com" });

// 输出：
// 日志记录：用户 Alice 登录
// 发送欢迎邮件至 alice@example.com
```

## 关键优势

1. **解耦性**：发布者和订阅者无需知道彼此存在
2. **可扩展性**：新增订阅者不影响现有逻辑
3. **灵活性**：支持一对多通信（一个事件触发多个动作）

## 常见应用场景

1. 模块间通信（如 Vue 的 `EventBus`）
2. 异步操作完成通知
3. 跨组件状态更新（React/Vue 非父子组件通信）
4. 插件系统的事件钩子

## 与观察者模式的区别

| 发布订阅模式             | 观察者模式                     |
| ------------------------ | ------------------------------ |
| 通过事件中心中转消息     | 观察者直接订阅目标对象         |
| 松耦合（双方无直接联系） | 较强耦合（目标维护观察者列表） |

> 实际开发中常使用现成库：
>
> - Node.js：内置 `EventEmitter`
> - 浏览器环境：Vue 的 `$emit/$on`、RxJS 等