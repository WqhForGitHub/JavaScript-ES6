/**
 * 手写简易字节码虚拟机（Bytecode VM）
 *
 * 实现一个基于栈的字节码虚拟机，支持：
 *   - PUSH n：压入常量
 *   - ADD / SUB / MUL / DIV：算术运算
 *   - STORE slot / LOAD slot：局部变量存取
 *   - JUMP target / JUMP_IF_FALSE target：跳转
 *   - CMP_LT / CMP_GT / CMP_EQ：比较
 *   - PRINT：打印栈顶
 *   - HALT：停机
 *
 * 实现思路：
 * 1. 编译器 compile：把简单 AST（表达式/语句）编译为指令数组。
 * 2. 虚拟机 VM：维护指令指针 ip、操作数栈 stack、变量表 slots。
 *    循环取指、译码、执行，直到 HALT。
 *
 * @param {Array} ast - 语句 AST 数组
 * @returns {Object} 运行结果
 */

// ===== 指令定义 =====
const OP = {
  PUSH: "PUSH",
  ADD: "ADD",
  SUB: "SUB",
  MUL: "MUL",
  DIV: "DIV",
  STORE: "STORE",
  LOAD: "LOAD",
  JUMP: "JUMP",
  JUMP_IF_FALSE: "JUMP_IF_FALSE",
  CMP_LT: "CMP_LT",
  CMP_GT: "CMP_GT",
  CMP_EQ: "CMP_EQ",
  PRINT: "PRINT",
  HALT: "HALT",
};

// ===== 编译器：AST -> 字节码 =====
function compile(ast) {
  const instructions = [];

  function emit(op, arg) {
    instructions.push({ op, arg });
    return instructions.length - 1; // 返回指令地址
  }

  function compileNode(node) {
    switch (node.type) {
      case "Number":
        emit(OP.PUSH, node.value);
        break;
      case "BinaryOp":
        compileNode(node.left);
        compileNode(node.right);
        switch (node.operator) {
          case "+":
            emit(OP.ADD);
            break;
          case "-":
            emit(OP.SUB);
            break;
          case "*":
            emit(OP.MUL);
            break;
          case "/":
            emit(OP.DIV);
            break;
          case "<":
            emit(OP.CMP_LT);
            break;
          case ">":
            emit(OP.CMP_GT);
            break;
          case "==":
            emit(OP.CMP_EQ);
            break;
        }
        break;
      case "Assign":
        compileNode(node.value);
        emit(OP.STORE, node.slot);
        break;
      case "Var":
        emit(OP.LOAD, node.slot);
        break;
      case "Print":
        compileNode(node.expr);
        emit(OP.PRINT);
        break;
      case "If": {
        compileNode(node.condition);
        const jumpIfFalse = emit(OP.JUMP_IF_FALSE, null);
        for (const stmt of node.then) compileNode(stmt);
        const jumpEnd = emit(OP.JUMP, null);
        instructions[jumpIfFalse].arg = instructions.length;
        for (const stmt of node.else) compileNode(stmt);
        instructions[jumpEnd].arg = instructions.length;
        break;
      }
    }
  }

  for (const stmt of ast) compileNode(stmt);
  emit(OP.HALT);
  return instructions;
}

// ===== 虚拟机 =====
class VM {
  constructor(instructions) {
    this.instructions = instructions;
    this.ip = 0;
    this.stack = [];
    this.slots = {};
    this.output = [];
  }

  run() {
    while (this.ip < this.instructions.length) {
      const { op, arg } = this.instructions[this.ip++];
      switch (op) {
        case OP.PUSH:
          this.stack.push(arg);
          break;
        case OP.ADD: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a + b);
          break;
        }
        case OP.SUB: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a - b);
          break;
        }
        case OP.MUL: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a * b);
          break;
        }
        case OP.DIV: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a / b);
          break;
        }
        case OP.STORE:
          this.slots[arg] = this.stack.pop();
          break;
        case OP.LOAD:
          this.stack.push(this.slots[arg]);
          break;
        case OP.CMP_LT: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a < b ? 1 : 0);
          break;
        }
        case OP.CMP_GT: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a > b ? 1 : 0);
          break;
        }
        case OP.CMP_EQ: {
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a === b ? 1 : 0);
          break;
        }
        case OP.JUMP:
          this.ip = arg;
          break;
        case OP.JUMP_IF_FALSE:
          if (this.stack.pop() === 0) this.ip = arg;
          break;
        case OP.PRINT:
          this.output.push(this.stack.pop());
          break;
        case OP.HALT:
          return this.output;
      }
    }
    return this.output;
  }
}

function bytecodeVm(ast) {
  const instructions = compile(ast);
  const vm = new VM(instructions);
  return vm.run();
}

// ===== 测试用例 =====
// 计算 (1 + 2) * 3 = 9，然后赋值给变量 x，再打印
const ast1 = [
  {
    type: "Assign",
    slot: "x",
    value: {
      type: "BinaryOp",
      operator: "*",
      left: {
        type: "BinaryOp",
        operator: "+",
        left: { type: "Number", value: 1 },
        right: { type: "Number", value: 2 },
      },
      right: { type: "Number", value: 3 },
    },
  },
  { type: "Print", expr: { type: "Var", slot: "x" } },
];
console.log(bytecodeVm(ast1)); // 期望输出: [ 9 ]

// if 语句：5 > 3 为真，打印 100，否则打印 200
const ast2 = [
  {
    type: "If",
    condition: {
      type: "BinaryOp",
      operator: ">",
      left: { type: "Number", value: 5 },
      right: { type: "Number", value: 3 },
    },
    then: [{ type: "Print", expr: { type: "Number", value: 100 } }],
    else: [{ type: "Print", expr: { type: "Number", value: 200 } }],
  },
];
console.log(bytecodeVm(ast2)); // 期望输出: [ 100 ]

// 循环模拟：x=0; if (x==0) print("zero" -> 用数字 0)
const ast3 = [
  { type: "Assign", slot: "n", value: { type: "Number", value: 10 } },
  {
    type: "Assign",
    slot: "m",
    value: {
      type: "BinaryOp",
      operator: "-",
      left: { type: "Var", slot: "n" },
      right: { type: "Number", value: 4 },
    },
  },
  { type: "Print", expr: { type: "Var", slot: "m" } },
];
console.log(bytecodeVm(ast3)); // 期望输出: [ 6 ]
