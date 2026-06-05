发布-订阅模式（Pub/Sub）在 JS 里本质是**“事件中心解耦通信”**，在企业级系统中非常常见，尤其适合**跨模块、跨服务、跨进程的异步通信**场景。

下面给你按“真实企业业务”来讲 + 配代码，避免停留在玩具 demo。

---

# 一、典型企业级业务场景

## 1）电商系统：订单状态驱动（最经典）

### 场景

用户下单后，会触发一系列“非强耦合流程”：

- 支付系统 → 处理付款
- 库存系统 → 扣库存
- 积分系统 → 加积分
- 通知系统 → 发短信/邮件
- 仓储系统 → 创建发货单

这些系统**不能互相直接调用（否则强耦合爆炸）**

👉 解决方案：订单服务只“发布事件”

---

### 发布-订阅结构

- Publisher：OrderService
- EventBus：消息中心
- Subscribers：
  - PaymentService
  - InventoryService
  - NotificationService

---

### 示例代码（企业级 EventBus）

```js
class EventBus {
  constructor() {
    this.events = {};
  }

  subscribe(event, fn) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(fn);
  }

  publish(event, data) {
    const fns = this.events[event];
    if (!fns) return;

    fns.forEach((fn) => fn(data));
  }

  unsubscribe(event, fn) {
    const fns = this.events[event];
    if (!fns) return;

    this.events[event] = fns.filter((item) => item !== fn);
  }
}

const bus = new EventBus();
```

---

### 业务使用示例（订单系统）

#### ① 各子系统订阅事件

```js
// 支付系统
bus.subscribe("order_created", (order) => {
  console.log("支付系统：开始扣款", order.id);
});

// 库存系统
bus.subscribe("order_created", (order) => {
  console.log("库存系统：扣减库存", order.items);
});

// 通知系统
bus.subscribe("order_created", (order) => {
  console.log("短信通知：订单已创建", order.userId);
});
```

---

#### ② 订单服务只负责发布

```js
function createOrder(order) {
  console.log("创建订单成功");

  bus.publish("order_created", order);
}
```

---

#### ③ 调用

```js
createOrder({
  id: "A1001",
  userId: 123,
  items: [{ sku: "iphone", count: 1 }],
});
```

---

### 👉 企业价值

- 订单服务 ≠ 支付/库存/通知
- 新增系统（如风控）不用改订单代码
- **天然支持微服务拆分**

---

# 二、前端企业场景（Vue/React）

## 2）跨组件通信（替代 props drilling）

### 场景

- 购物车角标更新
- 用户登录状态同步
- 全局通知弹窗

---

### 示例：登录状态广播

```js
const bus = new EventBus();

// Header组件
bus.subscribe("login_success", (user) => {
  console.log("更新头像", user.name);
});

// Sidebar组件
bus.subscribe("login_success", (user) => {
  console.log("更新菜单权限", user.role);
});
```

---

### 登录后发布

```js
function login(user) {
  bus.publish("login_success", user);
}
```

---

# 三、日志/埋点系统（企业后台常见）

## 场景

任何行为都需要埋点：

- 点击按钮
- 页面停留
- 下单行为

---

### 示例

```js
bus.subscribe("track_event", (event) => {
  console.log("发送埋点到 Kafka / ES", event);
});

bus.subscribe("track_event", (event) => {
  console.log("同步写日志系统", event);
});
```

---

### 发布埋点

```js
bus.publish("track_event", {
  type: "click",
  name: "buy_button",
  time: Date.now(),
});
```

---

# 四、微服务消息系统（进阶企业级）

在后端真实架构中，Pub/Sub 会升级为：

- Kafka
- RabbitMQ
- Redis Pub/Sub
- RocketMQ

---

### 举例：Kafka订单事件

```text
order-service → publish → topic: order_created
payment-service → subscribe → 扣款
warehouse-service → subscribe → 发货
```

👉 本质和 JS EventBus 一模一样，只是跨进程/跨机器。

---

# 五、适用场景总结（企业判断标准）

适合发布订阅的情况：

✔ 多模块依赖同一事件
✔ 一对多通知
✔ 不想强耦合调用
✔ 系统需要可扩展（插件化）
✔ 微服务拆分前/后

---

不适合：

❌ 强顺序依赖（必须同步执行）
❌ 强事务一致性场景（如银行转账核心链路）

---

# 六、一句话总结

发布-订阅模式在企业里的核心价值是：

> **把“直接调用”变成“事件驱动”，让系统从耦合结构变成可扩展结构**
