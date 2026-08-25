// 第09章：命令模式 - 撤销命令

// ==================== 接收者：小球对象 ====================

const ball = {
  pos: 0,
  move: function (newPos) {
    console.log('小球从 ' + this.pos + ' 移动到 ' + newPos);
    this.pos = newPos;
  },
};

// ==================== 撤销命令 ====================

const MoveCommand = function (receiver, newPos) {
  this.receiver = receiver;
  this.oldPos = null;
  this.newPos = newPos;
};

MoveCommand.prototype.execute = function () {
  this.oldPos = this.receiver.pos;
  this.receiver.move(this.newPos);
};

MoveCommand.prototype.undo = function () {
  console.log('撤销：小球从 ' + this.receiver.pos + ' 回到 ' + this.oldPos);
  this.receiver.move(this.oldPos);
};

// ==================== 命令栈管理 ====================

const commandStack = [];

const executeCommand = function (command) {
  command.execute();
  commandStack.push(command);
};

const undoCommand = function () {
  if (commandStack.length === 0) {
    console.log('没有可撤销的命令');
    return;
  }
  const command = commandStack.pop();
  command.undo();
};

// ==================== 执行演示 ====================

console.log('=== 撤销命令演示 ===');

console.log('\n--- 执行一系列移动命令 ---');
const moveCommand1 = new MoveCommand(ball, 10);
executeCommand(moveCommand1);

const moveCommand2 = new MoveCommand(ball, 25);
executeCommand(moveCommand2);

const moveCommand3 = new MoveCommand(ball, 40);
executeCommand(moveCommand3);

console.log('\n当前小球位置: ' + ball.pos);

console.log('\n--- 执行撤销 ---');
undoCommand();

console.log('\n当前小球位置: ' + ball.pos);

console.log('\n--- 再撤销 ---');
undoCommand();

console.log('\n当前小球位置: ' + ball.pos);

console.log('\n--- 再撤销 ---');
undoCommand();

console.log('\n当前小球位置: ' + ball.pos);

console.log('\n--- 尝试再撤销（栈已空）---');
undoCommand();
