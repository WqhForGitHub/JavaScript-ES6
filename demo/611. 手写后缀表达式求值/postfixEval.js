/**
 * 手写后缀表达式求值
 *
 * 对后缀（逆波兰）表达式进行求值，使用栈实现。
 *
 * 实现思路：
 * 1. 将后缀表达式按空格分割为 token。
 * 2. 遍历每个 token：
 *    - 若是操作数，压入栈中。
 *    - 若是操作符，从栈中弹出两个操作数（先弹出的是右操作数），
 *      计算后将结果压回栈中。
 * 3. 遍历结束后，栈中唯一的元素即为结果。
 *
 * @param {string} postfix - 后缀表达式（空格分隔）
 * @returns {number} 计算结果
 */
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
    case "^":
      return Math.pow(a, b);
  }
  throw new Error("未知运算符: " + op);
}

function postfixEval(postfix) {
  const tokens = postfix.trim().split(/\s+/);
  const stack = [];

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) {
      stack.push(parseFloat(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(applyOp(token, b, a));
    }
  }

  if (stack.length !== 1) {
    throw new Error("表达式无效，栈剩余元素: " + stack.length);
  }
  return stack[0];
}

// ===== 测试用例 =====
console.log(postfixEval("1 2 3 * +")); // 期望输出: 7   (1 + 2*3)
console.log(postfixEval("1 2 + 3 *")); // 期望输出: 9   ((1+2)*3)
console.log(postfixEval("3 4 2 * 1 5 - / +")); // 期望输出: 1   (3 + 4*2/(1-5))
console.log(postfixEval("10 2 6 * +")); // 期望输出: 22  (10 + 2*6)
console.log(postfixEval("2 3 + 4 1 - *")); // 期望输出: 15  ((2+3)*(4-1))
console.log(postfixEval("5 1 2 + 4 * + 3 -")); // 期望输出: 14 (5 + (1+2)*4 - 3)
