/**
 * 手写支持括号的四则运算解析器
 *
 * 解析支持括号的四则运算表达式（+ - * / 和 ()），
 * 使用递归下降法，括号内的子表达式作为一个整体参与运算。
 *
 * 实现思路：
 * 1. 词法分析：把表达式切分为 number、operator、paren 三种 token。
 * 2. 递归下降：
 *    - parseExpr：处理加减（低优先级），循环消费 + - 。
 *    - parseTerm：处理乘除（高优先级），循环消费 * / 。
 *    - parseFactor：处理数字和括号；遇到 '(' 则递归调用 parseExpr，
 *      遇到 ')' 结束返回。
 * 3. 直接在解析过程中求值返回数字。
 *
 * @param {string} expr - 四则运算表达式
 * @returns {number} 计算结果
 */
function tokenize(expr) {
  const tokens = [];
  const regex = /\s*([0-9]+(?:\.[0-9]+)?|[-+*/()])\s*/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    const v = match[1];
    if (/[-+*/()]/.test(v)) {
      tokens.push({ type: v === "(" || v === ")" ? "paren" : "op", value: v });
    } else {
      tokens.push({ type: "num", value: parseFloat(v) });
    }
  }
  return tokens;
}

function createParser(tokens) {
  let pos = 0;
  function peek() {
    return tokens[pos];
  }
  function next() {
    return tokens[pos++];
  }

  function parseExpr() {
    let left = parseTerm();
    while (
      peek() &&
      peek().type === "op" &&
      (peek().value === "+" || peek().value === "-")
    ) {
      const op = next().value;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (
      peek() &&
      peek().type === "op" &&
      (peek().value === "*" || peek().value === "/")
    ) {
      const op = next().value;
      const right = parseFactor();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parseFactor() {
    const token = peek();
    if (token.type === "num") {
      return next().value;
    }
    if (token.type === "paren" && token.value === "(") {
      next(); // 消费 '('
      const value = parseExpr();
      next(); // 消费 ')'
      return value;
    }
    throw new Error("意外的 token: " + JSON.stringify(token));
  }

  return parseExpr();
}

function arithmeticParserWithParens(expr) {
  const tokens = tokenize(expr);
  return createParser(tokens);
}

// ===== 测试用例 =====
console.log(arithmeticParserWithParens("(1 + 2) * 3")); // 期望输出: 9
console.log(arithmeticParserWithParens("1 + 2 * 3")); // 期望输出: 7
console.log(arithmeticParserWithParens("((2 + 3) * 4)")); // 期望输出: 20
console.log(arithmeticParserWithParens("10 / (2 + 3)")); // 期望输出: 2
console.log(arithmeticParserWithParens("(1 + (2 + 3)) * 4")); // 期望输出: 24
console.log(arithmeticParserWithParens("2 * (3 + 4) - 5")); // 期望输出: 9
