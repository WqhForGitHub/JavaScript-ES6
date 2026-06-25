/**
 * 简易编译器（Compiler）
 *
 * 组合 词法分析 -> 语法分析 -> 遍历转换 -> 代码生成 四个阶段，
 * 将 Lisp 风格代码编译为 C 风格代码。
 *
 * 流程：
 *   1. input  --tokenizer-->  tokens
 *   2. tokens --parser-->     ast (Lisp AST)
 *   3. ast    --transformer--> newAst (C AST)
 *   4. newAst --generator-->  output (C 代码)
 *
 * 转换器（transformer）在遍历过程中将 Lisp AST 节点映射为 C AST 节点：
 *   - NumberLiteral / StringLiteral 直接复用
 *   - CallExpression 转为带 callee（Identifier）和 arguments 的结构
 *   - 顶层 CallExpression 包装进 ExpressionStatement
 */

// ===== 1. 词法分析器 =====
function tokenizer(input) {
  const tokens = [];
  let current = 0;
  while (current < input.length) {
    let char = input[current];
    if (/\s/.test(char)) {
      current++;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      current++;
      continue;
    }
    if (/[0-9]/.test(char)) {
      let value = "";
      while (/[0-9]/.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "number", value });
      continue;
    }
    if (char === '"') {
      let value = "";
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({ type: "string", value });
      continue;
    }
    if (/[a-z]/i.test(char)) {
      let value = "";
      while (/[a-z]/i.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "name", value });
      continue;
    }
    throw new TypeError("无法识别的字符: " + char);
  }
  return tokens;
}

// ===== 2. 语法分析器 =====
function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];
    if (token.type === "number") {
      current++;
      return { type: "NumberLiteral", value: token.value };
    }
    if (token.type === "string") {
      current++;
      return { type: "StringLiteral", value: token.value };
    }
    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
      const node = { type: "CallExpression", name: token.value, params: [] };
      token = tokens[++current];
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
    throw new TypeError(token.type);
  }
  const ast = { type: "Program", body: [] };
  while (current < tokens.length) ast.body.push(walk());
  return ast;
}

// ===== 3. 遍历转换器 =====
function transformer(ast) {
  const newAst = { type: "Program", body: [] };
  ast._context = newAst.body;

  function traverser(node, parent) {
    const visitors = {
      NumberLiteral(node, parent) {
        parent._context.push({ type: "NumberLiteral", value: node.value });
      },
      StringLiteral(node, parent) {
        parent._context.push({ type: "StringLiteral", value: node.value });
      },
      CallExpression(node, parent) {
        let expression = {
          type: "CallExpression",
          callee: { type: "Identifier", name: node.name },
          arguments: [],
        };
        node._context = expression.arguments;
        if (parent.type !== "CallExpression") {
          expression = { type: "ExpressionStatement", expression };
        }
        parent._context.push(expression);
      },
    };

    const visitor = visitors[node.type];
    if (visitor) visitor(node, parent);

    switch (node.type) {
      case "Program":
      case "CallExpression":
        (node.params || node.body).forEach((child) => traverser(child, node));
        break;
    }
  }

  traverser(ast, { type: "_root", _context: newAst.body });
  return newAst;
}

// ===== 4. 代码生成器 =====
function codeGenerator(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGenerator).join("\n");
    case "ExpressionStatement":
      return codeGenerator(node.expression) + ";";
    case "CallExpression":
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(", ") +
        ")"
      );
    case "Identifier":
      return node.name;
    case "NumberLiteral":
      return node.value;
    case "StringLiteral":
      return '"' + node.value + '"';
    default:
      throw new TypeError(node.type);
  }
}

// ===== 5. 编译器主函数 =====
function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst);
  return output;
}

// ===== 测试用例 =====
console.log(compiler("(add 2 (subtract 4 2))"));
// 期望输出: add(2, subtract(4, 2));

console.log(compiler("(add 2 3 (subtract 5 1))"));
// 期望输出: add(2, 3, subtract(5, 1));

console.log(compiler('(concat "foo" "bar")'));
// 期望输出: concat("foo", "bar");
