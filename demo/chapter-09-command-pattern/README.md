命令模式（Command Pattern）在企业级系统里非常常见，但很多人只停留在“封装请求”这个概念，缺少**真实业务落地场景**。下面我给你按“企业级常见场景 + JS代码实现”系统讲清楚。

---

# 一、命令模式核心（快速理解）

命令模式本质：

👉 **把“操作”封装成对象（命令）**
👉 实现 **调用者（Invoker） 和 执行者（Receiver）解耦**

典型结构：

- Command：命令接口
- ConcreteCommand：具体命令
- Receiver：真正执行逻辑
- Invoker：触发命令

👉 常用于：

- 撤销 / 重做
- 操作队列
- 任务调度
- UI 事件抽象 ([runoob.com][1])

---

# 二、企业级典型业务场景（重点）

## 场景1：前端编辑器（撤销 / 重做）

👉 类似：富文本编辑器、低代码平台、画布编辑器

### 场景说明

- 用户操作：输入、删除、拖拽组件
- 需要支持：
  - undo（撤销）
  - redo（重做）

---

### ✅ 代码实现（经典）

```js
// Receiver：文档
class Editor {
  constructor() {
    this.content = "";
  }

  write(text) {
    this.content += text;
  }

  delete(length) {
    this.content = this.content.slice(0, -length);
  }
}

// Command
class WriteCommand {
  constructor(editor, text) {
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.write(this.text);
  }

  undo() {
    this.editor.delete(this.text.length);
  }
}

// Invoker
class CommandManager {
  constructor() {
    this.history = [];
  }

  execute(cmd) {
    cmd.execute();
    this.history.push(cmd);
  }

  undo() {
    const cmd = this.history.pop();
    cmd && cmd.undo();
  }
}

// 使用
const editor = new Editor();
const manager = new CommandManager();

manager.execute(new WriteCommand(editor, "Hello"));
manager.execute(new WriteCommand(editor, " World"));

console.log(editor.content); // Hello World

manager.undo();
console.log(editor.content); // Hello
```

👉 这是命令模式最经典企业场景（编辑器 / IDE / 设计工具）

---

## 场景2：按钮/菜单统一行为（UI事件解耦）

👉 类似：

- 后台管理系统
- 多入口触发同一操作（按钮、快捷键、菜单）

📌 核心问题：
多个入口触发同一逻辑 → 不想重复写代码

---

### ✅ 代码实现

```js
// Receiver
const OrderService = {
  create() {
    console.log("创建订单");
  },
};

// Command
class CreateOrderCommand {
  execute() {
    OrderService.create();
  }
}

// Invoker（按钮/快捷键统一入口）
class Button {
  constructor(command) {
    this.command = command;
  }

  click() {
    this.command.execute();
  }
}

// 使用
const createBtn = new Button(new CreateOrderCommand());

// 点击按钮
createBtn.click();

// 未来：快捷键也可以复用同一个命令
```

👉 好处：

- UI 和业务逻辑彻底解耦
- 多入口复用同一行为 ([Dofactory][2])

---

## 场景3：任务队列 / 异步任务调度（后端常见）

👉 类似：

- 消息队列（MQ）
- 批处理任务
- 定时任务系统

---

### ✅ 代码实现（命令队列）

```js
class TaskQueue {
  constructor() {
    this.queue = [];
  }

  add(command) {
    this.queue.push(command);
  }

  run() {
    while (this.queue.length) {
      const cmd = this.queue.shift();
      cmd.execute();
    }
  }
}

// Command
class SendEmailCommand {
  constructor(user) {
    this.user = user;
  }

  execute() {
    console.log(`发送邮件给 ${this.user}`);
  }
}

// 使用
const queue = new TaskQueue();

queue.add(new SendEmailCommand("A"));
queue.add(new SendEmailCommand("B"));

queue.run();
```

👉 对应企业系统：

- Kafka / RabbitMQ 消费逻辑
- Job Scheduler

---

## 场景4：操作日志 + 回放（审计系统）

👉 企业级非常重要：

- 操作记录（谁做了什么）
- 可回放（重放操作）

---

### ✅ 代码实现

```js
class CommandLogger {
  constructor() {
    this.logs = [];
  }

  execute(command) {
    command.execute();
    this.logs.push(command);
  }

  replay() {
    this.logs.forEach((cmd) => cmd.execute());
  }
}

// 示例命令
class AddUserCommand {
  constructor(user) {
    this.user = user;
  }

  execute() {
    console.log("新增用户:", this.user);
  }
}
```

👉 应用：

- 操作审计系统
- 用户行为回放
- 数据恢复

---

## 场景5：微前端 / 插件系统（高级）

👉 类似：

- 插件机制（VSCode、低代码平台）
- SaaS 可扩展系统

---

### ✅ 思路

```js
// 插件注册命令
class PluginCommand {
  constructor(fn) {
    this.fn = fn;
  }

  execute() {
    this.fn();
  }
}

// 插件系统
class PluginSystem {
  constructor() {
    this.commands = {};
  }

  register(name, command) {
    this.commands[name] = command;
  }

  run(name) {
    this.commands[name]?.execute();
  }
}
```

👉 好处：

- 动态扩展功能
- 解耦核心系统

---

# 三、命令模式 vs 发布订阅（很多人混淆）

| 对比       | 命令模式    | 发布订阅 |
| ---------- | ----------- | -------- |
| 本质       | 封装操作    | 事件广播 |
| 控制       | 主动执行    | 被动触发 |
| 典型场景   | undo / 队列 | 通知系统 |
| 是否有返回 | 有明确执行  | 通常无   |

---

# 四、总结（企业视角）

命令模式在企业中的核心价值：

👉 **解耦调用者和执行者**
👉 **支持操作记录、撤销、队列、事务**
👉 **适用于复杂交互系统**

---

# 五、一句话记忆

👉 命令模式 =
**“把函数变成对象 + 可记录 + 可撤销 + 可排队”**
