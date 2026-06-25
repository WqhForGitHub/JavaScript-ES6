/**
 * 简易语法分析器（Parser）
 *
 * 将 Token 数组转换为抽象语法树（AST）。
 * 接收 tokenizer 的输出，生成形如 CallExpression 的 AST。
 *
 * 实现思路（递归下降）：
 * 1. 维护指针 current 遍历 tokens。
 * 2. 遇到 '(' token 时，创建一个 CallExpression 节点：
 *    - 下一个 token 必须是 name，作为函数名。
 *    - 递归读取后续 token 作为参数，直到遇到 ')'。
 * 3. 遇到 number token 时，返回 NumberLiteral 节点。
 * 4. 遇到 string token 时，返回 StringLiteral 节点。
 * 5. 最终把所有顶层节点包装到 Program 根节点中。
 *
 * @param {Array<{type: string, value: string}>} tokens - Token 数组
 * @returns {{type: string, body: Array}} AST 根节点
 */
function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    // 数字字面量
    if (token.type === "number") {
      current++;
      return { type: "NumberLiteral", value: token.value };
    }

    // 字符串字面量
    if (token.type === "string") {
      current++;
      return { type: "StringLiteral", value: token.value };
    }

    // 函数调用（括号开头）
    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current]; // 跳过 '('，读取函数名
      const node = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };
      token = tokens[++current]; // 跳过函数名

      // 递归收集参数，直到遇到 ')'
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++; // 跳过 ')'
      return node;
    }

    throw new TypeError(token.type);
  }

  const ast = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

// ===== 测试用例 =====
const tokens = [
  { type: "paren", value: "(" },
  { type: "name", value: "add" },
  { type: "number", value: "2" },
  { type: "paren", value: "(" },
  { type: "name", value: "subtract" },
  { type: "number", value: "4" },
  { type: "number", value: "2" },
  { type: "paren", value: ")" },
  { type: "paren", value: ")" },
];

const ast = parser(tokens);
console.log(JSON.stringify(ast, null, 2));
// 期望输出:
// {
//   "type": "Program",
//   "body": [
//     {
//       "type": "CallExpression",
//       "name": "add",
//       "params": [
//         { "type": "NumberLiteral", "value": "2" },
//         {
//           "type": "CallExpression",
//           "name": "subtract",
//           "params": [
//             { "type": "NumberLiteral", "value": "4" },
//             { "type": "NumberLiteral", "value": "2" }
//           ]
//         }
//       ]
//     }
//   ]
// }
