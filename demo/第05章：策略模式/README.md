在 JavaScript 企业级项目里，**策略模式（Strategy Pattern）**最核心的价值就一句话：

> 把“会变化的一堆业务规则”从 if/else 里拆出来，变成可插拔的策略集合。

下面给你讲**真实企业里最常见的 6 大场景**，都是前端/Node 都会遇到的那种。

---

# 一、电商促销 / 价格计算系统（最典型）

这是策略模式使用频率最高的场景之一。

### 业务复杂点

一个商品可能同时涉及：

- 满减（满 300 - 50）
- 折扣（8 折）
- 优惠券
- 会员价
- 秒杀价
- 新人价

如果不用策略模式，代码会变成：

```js
if (type === "discount") {
} else if (type === "coupon") {
} else if (type === "vip") {
}
```

很快失控。

### 策略模式做法

```js
const strategies = {
  discount: (price) => price * 0.8,
  coupon: (price) => price - 50,
  vip: (price) => price * 0.7,
};

function calcPrice(type, price) {
  return strategies[type]?.(price) ?? price;
}
```

👉 企业意义：

- 新活动上线 = 只加策略，不改主逻辑
- 避免“改一处，崩全站”

---

# 二、支付系统（微信 / 支付宝 / 银联）

([mrsingsing][1])

### 业务特点

支付方式经常变：

- 微信支付
- 支付宝
- Apple Pay
- 数字人民币
- 海外 PayPal

### 策略模式结构

```js
const payStrategies = {
  wechat: (order) => console.log("微信支付", order),
  alipay: (order) => console.log("支付宝支付", order),
  union: (order) => console.log("银联支付", order),
};

function pay(type, order) {
  return payStrategies[type](order);
}
```

👉 企业价值：

- 支付渠道可以“插件化接入”
- 第三方支付接入不会影响核心逻辑

---

# 三、表单验证系统（前端框架核心）

### 业务特点

不同字段不同规则：

- 手机号验证
- 邮箱验证
- 密码强度
- 身份证验证

### 策略模式：

```js
const validators = {
  phone: (v) => /^1[3-9]\d{9}$/.test(v),
  email: (v) => /.+@.+\..+/.test(v),
  password: (v) => v.length >= 8,
};

function validate(type, value) {
  return validators[type]?.(value) ?? false;
}
```

👉 Vue / React 表单库底层思想就是这个

---

# 四、日志上报 / 埋点系统（前端监控）

### 业务特点

不同环境/事件走不同上报策略：

- 控制台打印
- 发送到 Sentry
- 发送到自研日志服务
- 采样上报（10%）

```js
const logStrategies = {
  console: (msg) => console.log(msg),
  sentry: (msg) => sendToSentry(msg),
  server: (msg) => fetch("/log", { method: "POST", body: msg }),
  sample: (msg) => Math.random() < 0.1 && send(msg),
};
```

👉 企业价值：

- 可灰度
- 可降级
- 可动态切换

---

# 五、权限控制系统（RBAC / ABAC）

### 业务特点

同一个按钮，不同角色：

- 管理员：可操作
- 普通用户：只读
- VIP：特殊权限

```js
const permissionStrategies = {
  admin: () => true,
  user: () => false,
  vip: (user) => user.level > 3,
};
```

👉 企业价值：

- 权限逻辑集中管理
- UI 与权限解耦

---

# 六、订单状态处理（状态机场景）

### 业务特点

订单状态变化很多：

- 待支付
- 已支付
- 已发货
- 已取消
- 已完成

```js
const orderStrategies = {
  pending: (order) => "等待支付",
  paid: (order) => "准备发货",
  shipped: (order) => "运输中",
  done: (order) => "已完成",
};
```

👉 企业价值：

- 替代复杂 switch-case 状态判断
- 易扩展（新增状态不影响旧逻辑）

---

# 总结一句话（企业级本质）

策略模式在企业里的本质是：

> 用“可替换的业务规则集合”替代“不断增长的 if/else”。
