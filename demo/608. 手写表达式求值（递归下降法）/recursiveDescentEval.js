/**
 * 手写表达式求值（递归下降法）
 *
 * 使用经典递归下降（Recursive Descent）方法对表达式求值，
 * 支持 + - * / 、括号、以及一元负号。
 *
 * 文法（BNF）：
 *   expr   -> term (('+' | '-') term)*
 *   term   -> factor (('*' | '/') factor)*
 *   factor -> NUMBER | '(' expr ')' | '-' factor
 *
 * 实现思路：
 * 每个非终结符对应一个函数，函数间互相递归调用。
 * 通过 peek/advance 维护当前位置。一元负号在 factor 中处理。
 *
 * @param {string} expr - 算术表达式
 * @returns {number} 计算结果
 */
function recursiveDescentEval(expr) {
  let pos = 0;

  function skipSpaces() {
    while (pos < expr.length && /\s/.test(expr[pos])) pos++;
  }

  function peek() {
    skipSpaces();
    return expr[pos];
  }

  function match(ch) {
    skipSpaces();
    if (expr[pos] === ch) {
      pos++;
      return true;
    }
    return false;
  }

  function parseNumber() {
    skipSpaces();
    let str = "";
    while (pos < expr.length && /[0-9.]/.test(expr[pos])) {
      str += expr[pos++];
    }
    return parseFloat(str);
  }

  function parseExpr() {
    let value = parseTerm();
    while (true) {
      if (match("+")) value += parseTerm();
      else if (match("-")) value -= parseTerm();
      else break;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (true) {
      if (match("*")) value *= parseFactor();
      else if (match("/")) value /= parseFactor();
      else break;
    }
    return value;
  }

  function parseFactor() {
    skipSpaces();
    // 一元负号
    if (match("-")) return -parseFactor();
    if (match("+")) return parseFactor();
    // 括号
    if (match("(")) {
      const value = parseExpr();
      if (!match(")")) throw new Error("缺少右括号");
      return value;
    }
    // 数字
    return parseNumber();
  }

  const result = parseExpr();
  skipSpaces();
  if (pos < expr.length) throw new Error("未消费的字符: " + expr.slice(pos));
  return result;
}

// ===== 测试用例 =====
console.log(recursiveDescentEval("1 + 2 * 3")); // 期望输出: 7
console.log(recursiveDescentEval("(1 + 2) * 3")); // 期望输出: 9
console.log(recursiveDescentEval("-5 + 3")); // 期望输出: -2
console.log(recursiveDescentEval("-(2 + 3) * 4")); // 期望输出: -20
console.log(recursiveDescentEval("3 + 4 * 2 / (1 - 5)")); // 期望输出: 1
console.log(recursiveDescentEval("2 * -3")); // 期望输出: -6
