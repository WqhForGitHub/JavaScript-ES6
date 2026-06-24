/**
 * 手写 Babel 插件（nullish coalescing 转换）
 *
 * 转换：a ?? b  ->  a != null ? a : b
 * 注意：?? 只在 null/undefined 时取右侧，0/false/'' 都保留
 */

const plugin = function () {
  return {
    name: 'transform-nullish-coalescing',
    visitor: {
      LogicalExpression(path) {
        if (path.node.operator !== '??') return;
        path.replaceWith({
          type: 'ConditionalExpression',
          test: { type: 'BinaryExpression', operator: '!=', left: path.node.left, right: { type: 'NullLiteral' } },
          consequent: path.node.left,
          alternate: path.node.right,
        });
      },
    },
  };
};

function transformAST(ast, p) {
  const visitor = p({}).visitor;
  function visit(node, parent, key) {
    if (!node || typeof node.type !== 'string') return;
    if (visitor[node.type]) visitor[node.type]({ node, replaceWith(n) { if (parent && key !== undefined) { if (Array.isArray(parent[key])) { const i = parent[key].indexOf(node); if (i >= 0) parent[key][i] = n; } else parent[key] = n; } } });
    for (const k in node) { if (Array.isArray(node[k])) node[k].forEach((c, i) => visit(c, node, k)); else if (node[k] && typeof node[k].type === 'string') visit(node[k], node, k); }
  }
  visit(ast, null, null);
  return ast;
}

// ===== 测试 =====
const ast = { type: 'Program', body: [{ type: 'ExpressionStatement', expression: { type: 'LogicalExpression', operator: '??', left: { type: 'Identifier', name: 'a' }, right: { type: 'NumericLiteral', value: 0 } } }] };
const result = transformAST(ast, plugin);
const expr = result.body[0].expression;
console.log('转换后类型:', expr.type); // ConditionalExpression
console.log('test operator:', expr.test.operator); // !=
console.log('consequent:', expr.consequent.name); // a
console.log('alternate:', expr.alternate.value); // 0

// 行为验证
const nc = (a, b) => a != null ? a : b;
console.log('\nnull ?? 0:', nc(null, 0));       // 0
console.log('undefined ?? 0:', nc(undefined, 0)); // 0
console.log('0 ?? 1:', nc(0, 1));                 // 0 (保留)
console.log('false ?? 1:', nc(false, 1));         // false (保留)
console.log("'' ?? 'd':", nc('', 'd'));           // '' (保留)
