/**
 * 手写 Babel 插件（可选链转普通判断）
 *
 * 转换：a?.b?.c  ->  a == null ? undefined : a.b
 * 注意：可选链在 null/undefined 时短路返回 undefined
 */

const plugin = function () {
  return {
    name: "transform-optional-chaining",
    visitor: {
      OptionalMemberExpression(path) {
        const { node } = path;
        path.replaceWith({
          type: "ConditionalExpression",
          test: {
            type: "BinaryExpression",
            operator: "==",
            left: node.object,
            right: { type: "NullLiteral" },
          },
          consequent: { type: "Identifier", name: "undefined" },
          alternate: {
            type: "MemberExpression",
            object: node.object,
            property: node.property,
            computed: node.computed,
          },
        });
      },
    },
  };
};

function transformAST(ast, p) {
  const visitor = p({}).visitor;
  function visit(node, parent, key) {
    if (!node || typeof node.type !== "string") return;
    if (visitor[node.type])
      visitor[node.type]({
        node,
        replaceWith(n) {
          if (parent && key !== undefined) {
            if (Array.isArray(parent[key])) {
              const i = parent[key].indexOf(node);
              if (i >= 0) parent[key][i] = n;
            } else parent[key] = n;
          }
        },
      });
    for (const k in node) {
      if (Array.isArray(node[k])) node[k].forEach((c, i) => visit(c, node, k));
      else if (node[k] && typeof node[k].type === "string")
        visit(node[k], node, k);
    }
  }
  visit(ast, null, null);
  return ast;
}

// ===== 测试 =====
const ast = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "OptionalMemberExpression",
        object: {
          type: "OptionalMemberExpression",
          object: { type: "Identifier", name: "a" },
          property: { type: "Identifier", name: "b" },
          computed: false,
          optional: true,
        },
        property: { type: "Identifier", name: "c" },
        computed: false,
        optional: true,
      },
    },
  ],
};
const result = transformAST(ast, plugin);
console.log("转换后类型:", result.body[0].expression.type); // ConditionalExpression
console.log("test 类型:", result.body[0].expression.test.type); // BinaryExpression ==
console.log("alternate 类型:", result.body[0].expression.alternate.type); // MemberExpression

// 行为验证
const oc = (a) => a?.b?.c;
console.log("\nnull?.b?.c:", oc(null)); // undefined
console.log("{b:{c:1}}?.b?.c:", oc({ b: { c: 1 } })); // 1
