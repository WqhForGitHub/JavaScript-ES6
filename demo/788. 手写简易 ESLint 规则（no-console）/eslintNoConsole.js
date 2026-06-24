/**
 * 手写简易 ESLint 规则（no-console）
 *
 * 功能：检测代码中是否使用了 console 方法调用
 * 实现思路：遍历 CallExpression，检查 callee.object.name === 'console'
 */

class LintContext {
  constructor(filename) { this.filename = filename; this.reportings = []; }
  report(node, msg) { this.reportings.push({ node, msg, loc: node.loc || { line: 0 } }); }
}

const noConsoleRule = {
  meta: { type: 'suggestion', docs: { description: 'disallow console' } },
  create(ctx) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'console') {
          ctx.report(node, 'Unexpected console statement.');
        }
      },
    };
  },
};

// 简易解析：提取 console 调用
function parseConsoleCalls(code) {
  const nodes = [];
  const re = /console\.(\w+)\s*\(/g;
  let m, line = 1, last = 0;
  while ((m = re.exec(code)) !== null) {
    for (let i = last; i < m.index; i++) if (code[i] === '\n') line++;
    last = m.index;
    nodes.push({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: m[1] } }, loc: { line, column: m.index } });
  }
  return nodes;
}

function runRule(code, rule, filename = 'test.js') {
  const ctx = new LintContext(filename);
  const visitors = rule.create(ctx);
  parseConsoleCalls(code).forEach(node => { if (visitors.CallExpression) visitors.CallExpression(node); });
  return ctx.reportings;
}

// ===== 测试 =====
const testCode = "const x = 1;\nconsole.log(x);\nconsole.warn('w');\nconsole.error('e');";
const reports = runRule(testCode, noConsoleRule);
console.log('违规报告数:', reports.length); // 3
reports.forEach((r, i) => console.log('  [' + (i+1) + '] 行' + r.loc.line + ': ' + r.msg));
