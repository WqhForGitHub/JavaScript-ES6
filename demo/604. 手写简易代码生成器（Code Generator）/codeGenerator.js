/**
 * 简易代码生成器（Code Generator）
 *
 * 将 AST 递归转换为 C 风格的目标代码字符串。
 *
 * 实现思路（递归）：
 * 1. Program：对其 body 中每个节点生成代码，用换行符连接。
 * 2. CallExpression：生成 `name(params...)` 的形式。
 * 3. NumberLiteral：直接返回数字字符串。
 * 4. StringLiteral：用双引号包裹字符串值。
 *
 * @param {Object} node - AST 节点
 * @returns {string} 生成的目标代码
 */
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

// ===== 测试用例 =====
// 经过转换后的 C 风格 AST
const ast = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "add" },
        arguments: [
          { type: "NumberLiteral", value: "2" },
          {
            type: "CallExpression",
            callee: { type: "Identifier", name: "subtract" },
            arguments: [
              { type: "NumberLiteral", value: "4" },
              { type: "NumberLiteral", value: "2" },
            ],
          },
        ],
      },
    },
  ],
};

const output = codeGenerator(ast);
console.log(output);
// 期望输出:
// add(2, subtract(4, 2));

const strAst = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "concat" },
        arguments: [
          { type: "StringLiteral", value: "hello" },
          { type: "StringLiteral", value: "world" },
        ],
      },
    },
  ],
};
console.log(codeGenerator(strAst));
// 期望输出:
// concat("hello", "world");
