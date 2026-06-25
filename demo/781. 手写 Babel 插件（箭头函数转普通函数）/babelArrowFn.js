/**
 * 手写 Babel 插件（箭头函数转普通函数）
 *
 * 转换：const add = (a, b) => a + b
 *    ->  const add = function(a, b) { return a + b; }
 *
 * 实现思路：
 *   1. 遍历 ArrowFunctionExpression 节点
 *   2. 表达式体包装为 BlockStatement + ReturnStatement
 *   3. 替换为 FunctionExpression
 */

const arrowFnPlugin = function () {
  return {
    name: "transform-arrow-functions",
    visitor: {
      ArrowFunctionExpression(path) {
        const { node } = path;
        let body = node.body;
        if (node.body.type !== "BlockStatement") {
          body = {
            type: "BlockStatement",
            body: [{ type: "ReturnStatement", argument: node.body }],
          };
        }
        path.replaceWith({
          type: "FunctionExpression",
          id: null,
          params: node.params,
          body,
          async: node.async,
          generator: false,
        });
      },
    },
  };
};

// 简易遍历器
function transformAST(ast, plugin) {
  const visitor = plugin({}).visitor;
  function visit(node, parent, key, index) {
    if (!node || typeof node.type !== "string") return;
    const h = visitor[node.type];
    if (h) {
      h({
        node,
        replaceWith(n) {
          if (index !== undefined) parent[key][index] = n;
          else if (parent) parent[key] = n;
        },
      });
    }
    for (const k in node) {
      if (Array.isArray(node[k]))
        node[k].forEach((c, i) => visit(c, node, k, i));
      else if (node[k] && typeof node[k].type === "string")
        visit(node[k], node, k);
    }
  }
  visit(ast, null, null, null);
  return ast;
}

// ===== 测试 =====
const ast = {
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "add" },
          init: {
            type: "ArrowFunctionExpression",
            params: [
              { type: "Identifier", name: "a" },
              { type: "Identifier", name: "b" },
            ],
            body: {
              type: "BinaryExpression",
              operator: "+",
              left: { type: "Identifier", name: "a" },
              right: { type: "Identifier", name: "b" },
            },
            async: false,
          },
        },
      ],
    },
  ],
};
const result = transformAST(ast, arrowFnPlugin);
const fn = result.body[0].declarations[0].init;
console.log("转换前: ArrowFunctionExpression");
console.log("转换后类型:", fn.type); // FunctionExpression
console.log("Body 类型:", fn.body.type); // BlockStatement
console.log("Body[0] 类型:", fn.body.body[0].type); // ReturnStatement
