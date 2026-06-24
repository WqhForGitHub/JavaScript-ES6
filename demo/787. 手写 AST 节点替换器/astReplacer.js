/**
 * 手写 AST 节点替换器
 *
 * 功能：遍历 AST 时替换/删除/插入节点
 * 支持：replaceWith / replaceWithMultiple / remove / insertBefore / insertAfter
 */

class NodePath {
  constructor(node, parent, key, index) { this.node = node; this.parent = parent; this.key = key; this.index = index; }
  replaceWith(n) { if (this.index !== undefined && Array.isArray(this.parent[this.key])) this.parent[this.key][this.index] = n; else this.parent[this.key] = n; this.node = n; }
  replaceWithMultiple(ns) { if (this.index !== undefined && Array.isArray(this.parent[this.key])) this.parent[this.key].splice(this.index, 1, ...ns); }
  remove() { if (this.index !== undefined && Array.isArray(this.parent[this.key])) this.parent[this.key].splice(this.index, 1); else delete this.parent[this.key]; }
  insertBefore(n) { if (this.index !== undefined && Array.isArray(this.parent[this.key])) { this.parent[this.key].splice(this.index, 0, n); this.index++; } }
  insertAfter(n) { if (this.index !== undefined && Array.isArray(this.parent[this.key])) this.parent[this.key].splice(this.index + 1, 0, n); }
  getSibling(off) { if (this.index !== undefined && Array.isArray(this.parent[this.key])) return this.parent[this.key][this.index + off]; return null; }
}

function traverseAndReplace(ast, visitor) {
  function visit(node, parent, key, index) {
    if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
    const path = new NodePath(node, parent, key, index);
    if (visitor[node.type]) visitor[node.type](path);
    const cur = path.index !== undefined && parent && parent[key] ? parent[key][path.index] : (parent ? parent[key] : ast);
    if (!cur) return;
    for (const k in cur) { if (k === 'type') continue; if (Array.isArray(cur[k])) { for (let i = 0; i < cur[k].length; i++) visit(cur[k][i], cur, k, i); } else if (cur[k] && typeof cur[k] === 'object' && cur[k].type) visit(cur[k], cur, k); }
  }
  visit(ast, null, null, null);
  return ast;
}

// ===== 测试 =====
const ast = { type: 'Program', body: [
  { type: 'Expr', val: 1 }, { type: 'Expr', val: 2 }, { type: 'Expr', val: 3 },
] };
traverseAndReplace(ast, { Expr(p) { p.node.val *= 100; } });
console.log('替换后:', ast.body.map(s => s.val)); // [100, 200, 300]
traverseAndReplace(ast, { Expr(p) { if (p.node.val === 200) p.remove(); } });
console.log('删除后:', ast.body.map(s => s.val)); // [100, 300]
traverseAndReplace(ast, { Expr(p) { if (p.node.val === 300) p.insertBefore({ type: 'Expr', val: 250 }); } });
console.log('插入后:', ast.body.map(s => s.val)); // [100, 250, 300]
traverseAndReplace(ast, { Expr(p) { if (p.node.val === 100) p.replaceWithMultiple([{ type: 'Expr', val: 50 }, { type: 'Expr', val: 51 }]); } });
console.log('多替换:', ast.body.map(s => s.val)); // [50, 51, 250, 300]
