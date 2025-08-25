# deepseek

**命令模式**是一种行为设计模式，它将**请求或操作封装为独立对象**，从而允许参数化客户端（如传递不同命令）、支持请求排队、记录请求日志，以及实现可撤销操作等功能。核心思想是**解耦请求的发起者（Invoker）和请求的执行者（Receiver）**。

## **核心组成**

1. **命令对象（Command）**

   封装操作的具体细节，包含执行方法（如 `execute()`）和撤销方法（如 `undo()`）。

2. **接收者（Receiver）**

   实际执行操作的对象（如业务逻辑类）。

3. **调用者（Invoker）**

   触发命令的对象（如按钮、事件处理器），无需知道命令的具体实现。

4. **客户端（Client）**

   创建命令对象并关联接收者。

## **代码示例**

```javascript
// 接收者：实际执行操作
class Light {
  turnOn() {
    console.log("灯已打开");
  }
  turnOff() {
    console.log("灯已关闭");
  }
}

// 命令基类
class Command {
  execute() {}
  undo() {}
}

// 具体命令：开灯
class TurnOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  execute() {
    this.light.turnOn();
  }
  undo() {
    this.light.turnOff(); // 撤销操作
  }
}

// 调用者（如遥控器按钮）
class RemoteControl {
  setCommand(command) {
    this.command = command;
  }
  pressButton() {
    this.command.execute();
  }
  pressUndo() {
    this.command.undo();
  }
}

// 客户端
const light = new Light();
const turnOn = new TurnOnCommand(light);
const remote = new RemoteControl();

remote.setCommand(turnOn);
remote.pressButton(); // 输出："灯已打开"
remote.pressUndo();   // 输出："灯已关闭"
```

## **优势**

1. **解耦**：调用者无需知道接收者的具体实现。
2. **扩展性**：新增命令无需修改现有代码（符合开闭原则）。
3. **支持高级操作**：
   - **撤销/重做**：通过记录命令历史实现（如 `undo()`方法）。
   - **事务队列**：将命令存入队列，支持异步或延迟执行。
   - **宏命令**：组合多个命令（如一次执行多个操作）。

## **实际应用场景**

1. **UI 操作**：按钮点击触发不同业务逻辑。
2. **事务管理**：数据库操作的回滚/重做。
3. **日志记录**：保存命令历史用于审计或崩溃恢复。
4. **任务队列**：批量处理命令（如消息队列）。

## **JavaScript 中的简化实现**

借助 JavaScript 的函数式特性，命令模式可简化为**高阶函数**：

```javascript
function createCommand(receiver, action) {
  return {
    execute: () => receiver[action](),
    undo: () => console.log("撤销操作")
  };
}

const light = { turnOn: () => console.log("灯已打开") };
const command = createCommand(light, "turnOn");
command.execute(); // 输出："灯已打开"
```

## **总结**

命令模式通过将操作封装为对象，提升了代码的灵活性和可维护性。在 JavaScript 中，既可基于类实现完整功能（如支持撤销），也可利用函数式特性简化实现，是管理复杂操作和事务的理想选择。

