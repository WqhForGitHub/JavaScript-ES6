/**
 * 手写四则运算表达式解析器
 *
 * 解析不含括号的四则运算表达式（仅支持 + - * / 和数字），
 * 按运算符优先级生成 AST 并求值。
 *
 * 实现思路：
 * 1. 词法分析：用正则把表达式切分为 number 和 operator 两种 token。
 * 2. 语法分析：两遍扫描法 —— 先扫描高优先级运算符（* /）组成乘除节点，
 *    再扫描低优先级运算符（+ -）组成加减节点。这样自然实现优先级。
 * 3. 求值：递归遍历 AST 计算结果。
 *
 * @param {string} expr - 四则运算表达式
 * @returns {number} 计算结果
 */
function tokenize(expr) {
  const tokens = [];
  const regex = /\s*([0-9]+(?:\.[0-9]+)?|[-+*/])\s*/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    const v = match[1];
    if (/[-+*/]/.test(v)) {
      tokens.push({ type: "op", value: v });
    } else {
      tokens.push({ type: "num", value: parseFloat(v) });
    }
  }
  return tokens;
}

// 构建乘除层（高优先级）
function buildMulDiv(tokens) {
  const nodes = [{ type: "num", value: tokens[0].value }];
  let i = 1;
  while (i < tokens.length) {
    const op = tokens[i].value;
    const right = tokens[i + 1].value;
    if (op === "*" || op === "/") {
      const left = nodes.pop();
      nodes.push({
        type: "binop",
        op,
        left,
        right: { type: "num", value: right },
      });
    } else {
      nodes.push({ type: "op", value: op });
      nodes.push({ type: "num", value: right });
    }
    i += 2;
  }
  return nodes;
}

// 构建加减层（低优先级）
function buildAddSub(nodes) {
  let root = nodes[0];
  let i = 1;
  while (i < nodes.length) {
    const op = nodes[i].value;
    const right = nodes[i + 1];
    root = { type: "binop", op, left: root, right };
    i += 2;
  }
  return root;
}

function parse(tokens) {
  if (tokens.length === 0) return null;
  return buildAddSub(buildMulDiv(tokens));
}

function evaluate(node) {
  if (node.type === "num") return node.value;
  const l = evaluate(node.left);
  const r = evaluate(node.right);
  switch (node.op) {
    case "+":
      return l + r;
    case "-":
      return l - r;
    case "*":
      return l * r;
    case "/":
      return l / r;
  }
}

function arithmeticParser(expr) {
  const tokens = tokenize(expr);
  const ast = parse(tokens);
  return evaluate(ast);
}

// ===== 测试用例 =====
console.log(arithmeticParser("1 + 2 * 3")); // 期望输出: 7
console.log(arithmeticParser("2 * 3 + 4")); // 期望输出: 10
console.log(arithmeticParser("10 - 2 - 3")); // 期望输出: 5
console.log(arithmeticParser("8 / 2 / 2")); // 期望输出: 2
console.log(arithmeticParser("2 + 3 * 4 - 5")); // 期望输出: 9
console.log(arithmeticParser("100 / 5 * 2")); // 期望输出: 40
