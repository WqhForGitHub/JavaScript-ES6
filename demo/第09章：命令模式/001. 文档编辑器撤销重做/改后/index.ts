// 改后：命令模式 -- 每个操作封装成命令对象（execute/undo），调用者只和命令打交道

// ========== 接收者（Receiver）：真正干活的对象 ==========
class Editor {
  content = '';

  insert(text: string): void {
    this.content += text;
  }

  delete(count: number): void {
    this.content = this.content.slice(0, -count);
  }
}

// ========== 命令（Command）：把"操作 + 参数 + 反操作"封装成对象 ==========
interface Command {
  execute(): void;
  undo(): void;
}

class InsertCommand implements Command {
  constructor(
    private editor: Editor,
    private text: string,
  ) {}

  execute(): void {
    this.editor.insert(this.text);
  }

  undo(): void {
    this.editor.delete(this.text.length);
  }
}

class DeleteCommand implements Command {
  private deletedText = '';

  constructor(
    private editor: Editor,
    private count: number,
  ) {}

  execute(): void {
    // 执行前先记下被删的内容，撤销时才能还原
    this.deletedText = this.editor.content.slice(-this.count);
    this.editor.delete(this.count);
  }

  undo(): void {
    this.editor.insert(this.deletedText);
  }
}

// ========== 调用者（Invoker）：只负责执行命令并维护撤销/重做两个栈 ==========
class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // 新操作会让重做历史失效
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) {
      console.log('没有可撤销的操作');
      return;
    }
    command.undo();
    this.redoStack.push(command);
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) {
      console.log('没有可重做的操作');
      return;
    }
    command.execute();
    this.undoStack.push(command);
  }
}

// ========== 使用：客户端只面对命令对象 ==========
const editor = new Editor();
const manager = new CommandManager();

manager.execute(new InsertCommand(editor, 'Hello'));
manager.execute(new InsertCommand(editor, ' World'));
manager.execute(new DeleteCommand(editor, 6));

console.log('当前内容：', editor.content); // Hello

manager.undo(); // 撤销删除
console.log('撤销删除后：', editor.content); // Hello World

manager.undo(); // 撤销第二次插入
console.log('撤销插入后：', editor.content); // Hello

manager.redo(); // 重做第二次插入
console.log('重做插入后：', editor.content); // Hello World

// 优势：
// 1. 每个命令自带 execute/undo，新增操作 = 新增一个命令类，CommandManager 零修改
// 2. "执行 + 记录"收口在 CommandManager 一处，不可能漏记
// 3. 撤销/重做只是两个栈的进出，天然支持
// 4. 命令是对象：还能排队、记录、回放（见后续示例）
export {};
