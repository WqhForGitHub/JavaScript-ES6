你这段内容其实已经把**设计模式在 JavaScript 中的理论基础讲得很完整了**，但很多人学完之后都会有一个共同困惑：

> “这些东西在真实业务里到底怎么用？不会只是讲故事吧？”

下面我帮你把**原型 / 多态 / 封装**对应到**真实前端业务场景**（不是课堂例子，而是工程里真的会遇到的）。

---

# 一、真实业务中的「多态」：统一调用接口，不关心实现

## 📌 场景1：支付系统（最典型）

你在电商/后台系统里一定见过：

- 微信支付
- 支付宝支付
- 银行卡支付
- Apple Pay

### ❌ if/else 写法（坏味道）

```js
function pay(type, amount) {
  if (type === "wechat") {
    wechatPay(amount);
  } else if (type === "alipay") {
    aliPay(amount);
  } else if (type === "card") {
    cardPay(amount);
  }
}
```

问题：

- 每新增一种支付 → 必改函数
- 越写越臃肿

---

## ✅ 多态写法（设计模式思路）

```js
const payMethods = {
  wechat: {
    pay(amount) {
      console.log("微信支付", amount);
    },
  },
  alipay: {
    pay(amount) {
      console.log("支付宝支付", amount);
    },
  },
  card: {
    pay(amount) {
      console.log("银行卡支付", amount);
    },
  },
};

function pay(type, amount) {
  payMethods[type].pay(amount);
}
```

### ✔ 本质变化

- 不再判断“你是谁”
- 只调用 `pay()`
- **不同对象各自实现行为**

👉 这就是你前面讲的：

> “把做什么和怎么做分离”

---

# 二、真实业务中的「鸭子类型」：只关心能力，不关心类型

## 📌 场景2：前端组件系统 / 插件系统

比如一个 UI 框架：

### toast / modal / notification

只要满足：

```js
show();
hide();
```

就能接入系统。

---

### ❌ 强类型思维（错误方向）

```js
function render(component) {
  if (component instanceof Modal) ...
}
```

---

### ✅ 鸭子类型（JS真实写法）

```js
function render(component) {
  component.show();
}
```

只要你有 `show()`，你就是“可渲染组件”。

---

## 📌 真实例子：富文本编辑器插件

比如：

- 上传图片插件
- emoji 插件
- markdown 插件

只要实现：

```js
init();
destroy();
```

就能插入编辑器系统。

👉 编辑器根本不关心你是谁

---

# 三、真实业务中的「原型模式」：对象复用 / 性能优化核心手段

## 📌 场景3：游戏 / 动画系统（你文中飞机大战就是标准例子）

比如：

- 子弹
- 敌机
- 粒子特效

如果每次都 new 一个完整对象：

```js
new Bullet();
```

会很慢（创建成本高）

---

## ✅ 原型/克隆优化（真实游戏引擎思想）

```js
const bulletPrototype = {
  speed: 10,
  damage: 5,
  move() {
    this.x += this.speed;
  },
};

const bullet1 = Object.create(bulletPrototype);
const bullet2 = Object.create(bulletPrototype);
```

### ✔ 好处

- 共享方法（节省内存）
- 批量生成对象更快
- 非常适合：
  - 粒子系统
  - UI 节点复用
  - 游戏对象池

---

## 📌 真实工业应用：对象池（Object Pool）

```js
const pool = [];

function createBullet() {
  return pool.pop() || Object.create(bulletPrototype);
}

function recycleBullet(bullet) {
  pool.push(bullet);
}
```

👉 Unity / Three.js / 游戏引擎都这么干

---

# 四、真实业务中的「封装」：模块化 + 防污染

## 📌 场景4：大型前端项目（React / Vue / Node）

### ❌ 全局变量污染（老项目常见）

```js
window.user = {};
window.token = "";
```

---

## ✅ 封装（现代工程标准）

### 1. 模块封装（ESM）

```js
// user.js
let user = null;

export function setUser(u) {
  user = u;
}

export function getUser() {
  return user;
}
```

---

### 2. 闭包封装（库开发）

```js
const createStore = () => {
  let state = {};

  return {
    getState() {
      return state;
    },
    setState(newState) {
      state = newState;
    },
  };
};
```

👉 Redux / Pinia 本质就是这个思想

---

# 五、设计模式在真实系统中的本质（重点）

如果你把这些模式放到工程里，会发现一个规律：

## ⭐ 不是“用不用模式”，而是：

> 是否避免 if/else 扩展灾难

| 思想     | 本质                  |
| -------- | --------------------- |
| 多态     | 用对象替代条件判断    |
| 鸭子类型 | 用能力替代类型        |
| 原型     | 用共享替代重复创建    |
| 封装     | 隔离变化 + 控制作用域 |

---

# 六、一个真实项目级综合例子（非常重要）

## 📌 场景：可配置图表系统（ECharts / AntV 思想）

你要支持：

- 折线图
- 柱状图
- 饼图

---

### ❌ if/else版本

```js
function renderChart(type, data) {
  if (type === 'line') ...
  if (type === 'bar') ...
  if (type === 'pie') ...
}
```

---

### ✅ 多态版本（策略模式 + 鸭子类型）

```js
const charts = {
  line: {
    render(data) {
      console.log("折线图", data);
    },
  },
  bar: {
    render(data) {
      console.log("柱状图", data);
    },
  },
};

function renderChart(type, data) {
  charts[type].render(data);
}
```

---

👉 新增图表类型：

```js
charts.scatter = {
  render(data) {
    console.log("散点图", data);
  },
};
```

**无需修改 renderChart**

---

# 总结一句话（核心）

你前面整章内容，在真实业务里可以压缩成一句话：

> ❗JavaScript 设计模式的本质，就是用“对象行为”替代“类型判断”。
