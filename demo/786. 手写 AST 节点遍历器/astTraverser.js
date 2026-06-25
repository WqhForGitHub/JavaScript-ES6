/**
 * 手写 AST 节点遍历器
 *
 * 功能：深度优先遍历 AST，支持 enter/exit 两个阶段
 * 实现思路：
 *   1. 递归遍历节点
 *   2. enter: 进入节点时调用
 *   3. 递归子节点
 *   4. exit: 离开节点时调用
 *   5. 支持 skip 跳过子树
 */

function traverse(ast, visitor) {
  function visit(node, parent, key, index) {
    if (!node || typeof node !== "object" || typeof node.type !== "string")
      return;
    const path = {
      node,
      parent,
      key,
      index,
      type: node.type,
      skip: false,
      replaceWith(n) {
        if (index !== undefined && Array.isArray(parent[key]))
          parent[key][index] = n;
        else if (parent && key) parent[key] = n;
      },
      remove() {
        if (index !== undefined && Array.isArray(parent[key]))
          parent[key].splice(index, 1);
        else if (parent && key) delete parent[key];
      },
    };
    if (visitor.enter) visitor.enter(path);
    if (visitor[node.type]) {
      if (typeof visitor[node.type] === "function") visitor[node.type](path);
      else if (visitor[node.type].enter) visitor[node.type].enter(path);
    }
    if (path.skip) return;
    for (const k in node) {
      if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
      if (Array.isArray(node[k])) {
        for (let i = 0; i < node[k].length; i++) visit(node[k][i], node, k, i);
      } else if (node[k] && typeof node[k] === "object" && node[k].type)
        visit(node[k], node, k);
    }
    if (visitor.exit) visitor.exit(path);
    if (visitor[node.type] && visitor[node.type].exit)
      visitor[node.type].exit(path);
  }
  visit(ast, null, null, null);
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
          id: { type: "Identifier", name: "x" },
          init: {
            type: "BinaryExpression",
            operator: "+",
            left: { type: "NumericLiteral", value: 1 },
            right: { type: "NumericLiteral", value: 2 },
          },
        },
      ],
    },
  ],
};
const visited = [];
traverse(ast, {
  enter(p) {
    visited.push("enter: " + p.node.type);
  },
  exit(p) {
    visited.push("exit: " + p.node.type);
  },
  Identifier(p) {
    visited.push("  found: " + p.node.name);
  },
  BinaryExpression(p) {
    visited.push("  op: " + p.node.operator);
  },
});
console.log(visited.join("\n"));

// 替换测试
traverse(ast, {
  NumericLiteral(p) {
    p.node.value *= 10;
  },
});
console.log(
  "\n替换后:",
  ast.body[0].declarations[0].init.left.value,
  "+",
  ast.body[0].declarations[0].init.right.value,
); // 10 + 20
