/**
 * 手写 Babel 插件（let/const 转 var）
 *
 * 功能：将 let/const 声明转为 var
 * 注意：let/const 有块级作用域，转 var 后变为函数级作用域
 * 实现思路：遍历 VariableDeclaration，将 kind 改为 'var'
 */

const plugin = function () {
  return {
    name: "transform-block-scoping",
    visitor: {
      VariableDeclaration(path) {
        if (path.node.kind === "let" || path.node.kind === "const") {
          path.node.kind = "var";
        }
      },
    },
  };
};

function transformAST(ast, p) {
  const visitor = p({}).visitor;
  function visit(node) {
    if (!node || typeof node.type !== "string") return;
    if (visitor[node.type]) visitor[node.type]({ node });
    for (const k in node) {
      if (Array.isArray(node[k])) node[k].forEach(visit);
      else if (node[k] && typeof node[k].type === "string") visit(node[k]);
    }
  }
  visit(ast);
  return ast;
}

// ===== 测试 =====
const ast = {
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      kind: "let",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "x" },
          init: { type: "NumericLiteral", value: 1 },
        },
      ],
    },
    {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "y" },
          init: { type: "NumericLiteral", value: 2 },
        },
      ],
    },
    {
      type: "VariableDeclaration",
      kind: "var",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "z" },
          init: { type: "NumericLiteral", value: 3 },
        },
      ],
    },
  ],
};
const result = transformAST(ast, plugin);
console.log("let ->", result.body[0].kind); // var
console.log("const ->", result.body[1].kind); // var
console.log("var ->", result.body[2].kind); // var (不变)
