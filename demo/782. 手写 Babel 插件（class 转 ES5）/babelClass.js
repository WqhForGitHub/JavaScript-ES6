/**
 * 手写 Babel 插件（class 转 ES5）
 *
 * 转换：class A { constructor(x){this.x=x} foo(){} }
 *    -> function A(x){this.x=x} A.prototype.foo=function(){}
 *
 * 实现思路：
 *   1. constructor -> 构造函数体
 *   2. 普通方法 -> Constructor.prototype.method = function(){}
 *   3. static 方法 -> Constructor.method = function(){}
 */

const classPlugin = function () {
  return {
    name: 'transform-classes',
    visitor: {
      ClassDeclaration(path) {
        const { node } = path;
        const className = node.id.name;
        const body = node.body.body;
        const ctor = body.find(m => m.type === 'MethodDefinition' && m.kind === 'constructor');
        const ctorFn = { type: 'FunctionDeclaration', id: { type: 'Identifier', name: className }, params: ctor ? ctor.value.params : [], body: ctor ? ctor.value.body : { type: 'BlockStatement', body: [] } };
        const statements = [ctorFn];
        for (const method of body) {
          if (method.type !== 'MethodDefinition' || method.kind === 'constructor') continue;
          const fn = { type: 'FunctionExpression', id: null, params: method.value.params, body: method.value.body, async: false, generator: false };
          const target = method.static ? { type: 'Identifier', name: className } : { type: 'MemberExpression', object: { type: 'Identifier', name: className }, property: { type: 'Identifier', name: 'prototype' }, computed: false };
          statements.push({ type: 'ExpressionStatement', expression: { type: 'AssignmentExpression', operator: '=', left: { type: 'MemberExpression', object: target, property: method.key, computed: false }, right: fn } });
        }
        path.replaceWithMultiple(statements);
      },
    },
  };
};

// 简易遍历器（支持 replaceWithMultiple）
function transformAST(ast, plugin) {
  const visitor = plugin({}).visitor;
  function visit(node, parent, key, index) {
    if (!node || typeof node.type !== 'string') return;
    const h = visitor[node.type];
    if (h) { h({ node, parent, key, index, replaceWithMultiple(nodes) { if (index !== undefined) parent[key].splice(index, 1, ...nodes); } }); }
    const cur = index !== undefined && parent ? parent[key][index] : (parent ? parent[key] : node);
    if (!cur) return;
    for (const k in cur) { if (Array.isArray(cur[k])) cur[k].forEach((c, i) => visit(c, cur, k, i)); else if (cur[k] && typeof cur[k].type === 'string') visit(cur[k], cur, k); }
  }
  visit(ast, null, null, null);
  return ast;
}

// ===== 测试 =====
const ast = { type: 'Program', body: [{ type: 'ClassDeclaration', id: { type: 'Identifier', name: 'Person' }, superClass: null, body: { type: 'ClassBody', body: [
  { type: 'MethodDefinition', kind: 'constructor', static: false, key: { type: 'Identifier', name: 'constructor' }, value: { type: 'FunctionExpression', params: [{ type: 'Identifier', name: 'name' }], body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement', expression: { type: 'AssignmentExpression', operator: '=', left: { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'name' }, computed: false }, right: { type: 'Identifier', name: 'name' } } }] } },
  { type: 'MethodDefinition', kind: 'method', static: false, key: { type: 'Identifier', name: 'greet' }, value: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'StringLiteral', value: 'hello' } }] } } },
  { type: 'MethodDefinition', kind: 'method', static: true, key: { type: 'Identifier', name: 'create' }, value: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } } },
] } }] };
const result = transformAST(ast, classPlugin);
console.log('转换后语句数:', result.body.length); // 3
console.log('语句1:', result.body[0].type, result.body[0].id.name); // FunctionDeclaration Person
console.log('语句2 方法:', result.body[1].expression.left.property.name); // greet (原型)
console.log('语句3 静态:', result.body[2].expression.left.object.name); // Person (静态)
