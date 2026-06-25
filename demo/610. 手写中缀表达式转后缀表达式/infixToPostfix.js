/**
 * 手写中缀表达式转后缀表达式
 *
 * 使用调度场算法将中缀表达式转换为后缀（逆波兰）表达式。
 * 不直接求值，只做转换。
 *
 * 实现思路：
 * 1. 词法分析得到 token 序列。
 * 2. 维护输出队列 output 和操作符栈 stack。
 * 3. 遇到数字 -> 加入 output。
 * 4. 遇到 '(' -> 压入 stack。
 * 5. 遇到 ')' -> 弹出 stack 中的操作符加入 output，直到 '('。
 * 6. 遇到操作符 -> 当栈顶操作符优先级 >= 当前操作符时弹出加入 output，
 *    再将当前操作符入栈。
 * 7. 最后把 stack 中剩余操作符依次弹出加入 output。
 *
 * @param {string} infix - 中缀表达式
 * @returns {string} 后缀表达式（空格分隔）
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

function infixToPostfix(expr) {
  const tokens = tokenize(expr);
  const output = [];
  const stack = [];

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) {
      output.push(token);
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop(); // 弹出 '('
    } else {
      while (
        stack.length &&
        stack[stack.length - 1] !== "(" &&
        PRECEDENCE[stack[stack.length - 1]] >= PRECEDENCE[token]
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length) {
    output.push(stack.pop());
  }

  return output.join(" ");
}

// ===== 测试用例 =====
console.log(infixToPostfix("1 + 2 * 3")); // 期望输出: 1 2 3 * +
console.log(infixToPostfix("(1 + 2) * 3")); // 期望输出: 1 2 + 3 *
console.log(infixToPostfix("3 + 4 * 2 / (1 - 5)")); // 期望输出: 3 4 2 * 1 5 - / +
console.log(infixToPostfix("10 + 2 * 6")); // 期望输出: 10 2 6 * +
console.log(infixToPostfix("(2 + 3) * (4 - 1)")); // 期望输出: 2 3 + 4 1 - *
