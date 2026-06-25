/**
 * 手写表达式求值（调度场算法）
 *
 * 使用 Dijkstra 的调度场算法（Shunting Yard Algorithm）求值，
 * 支持 + - * / 和括号。该算法通过栈将中缀表达式转为后缀表达式
 * 并在转换过程中直接利用操作数栈求值。
 *
 * 实现思路：
 * 1. 词法分析得到 token 序列。
 * 2. 维护一个操作符栈 operatorStack 和操作数栈 valueStack。
 * 3. 遇到数字 -> 压入 valueStack。
 * 4. 遇到 '(' -> 压入 operatorStack。
 * 5. 遇到 ')' -> 不断弹出操作符并计算，直到遇到 '('。
 * 6. 遇到操作符 -> 当栈顶操作符优先级 >= 当前操作符时，先弹出计算，
 *    再把当前操作符入栈。
 * 7. 最后把栈中剩余操作符依次弹出计算。
 *
 * @param {string} expr - 算术表达式
 * @returns {number} 计算结果
 */
const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2 };

function tokenize(expr) {
  const tokens = [];
  const regex = /\s*([0-9]+(?:\.[0-9]+)?|[-+*/()])\s*/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

function applyOp(op, b, a) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
  }
  throw new Error("未知运算符: " + op);
}

function shuntingYard(expr) {
  const tokens = tokenize(expr);
  const operatorStack = [];
  const valueStack = [];

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) {
      valueStack.push(parseFloat(token));
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        const op = operatorStack.pop();
        valueStack.push(applyOp(op, valueStack.pop(), valueStack.pop()));
      }
      operatorStack.pop(); // 弹出 '('
    } else {
      // 操作符
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] !== "(" &&
        PRECEDENCE[operatorStack[operatorStack.length - 1]] >= PRECEDENCE[token]
      ) {
        const op = operatorStack.pop();
        valueStack.push(applyOp(op, valueStack.pop(), valueStack.pop()));
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length) {
    const op = operatorStack.pop();
    valueStack.push(applyOp(op, valueStack.pop(), valueStack.pop()));
  }

  return valueStack[0];
}

// ===== 测试用例 =====
console.log(shuntingYard("1 + 2 * 3")); // 期望输出: 7
console.log(shuntingYard("(1 + 2) * 3")); // 期望输出: 9
console.log(shuntingYard("3 + 4 * 2 / (1 - 5)")); // 期望输出: 1
console.log(shuntingYard("10 + 2 * 6")); // 期望输出: 22
console.log(shuntingYard("100 * 2 + 12")); // 期望输出: 212
console.log(shuntingYard("(2 + 3) * (4 - 1)")); // 期望输出: 15
