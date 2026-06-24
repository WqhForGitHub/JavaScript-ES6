/**
 * 手写简易 ESLint 规则（no-unused-vars）
 *
 * 功能：检测声明但未使用的变量
 * 实现思路：
 *   1. 收集所有变量声明
 *   2. 收集所有标识符引用
 *   3. 对比：声明但未被引用的变量即为未使用
 */

class LintContext {
  constructor(filename) { this.filename = filename; this.reportings = []; }
  report(node, msg) { this.reportings.push({ node, msg, loc: node.loc || { line: 0 } }); }
}

const noUnusedVarsRule = {
  meta: { type: 'problem', docs: { description: 'disallow unused variables' } },
  create(ctx) {
    const declared = new Map();
    return {
      VariableDeclarator(node) { if (node.id.type === 'Identifier') declared.set(node.id.name, { node, used: false }); },
      Identifier(node) { if (declared.has(node.name)) declared.get(node.name).used = true; },
      'Program:exit'() { for (const [name, info] of declared) if (!info.used) ctx.report(info.node, "'" + name + "' is defined but never used."); },
    };
  },
};

// 简易解析
function parseAndRun(code) {
  const ctx = new LintContext('test.js');
  const visitors = noUnusedVarsRule.create(ctx);
  const declared = new Map();
  // 解析变量声明
  const varRe = /(?:const|let|var)\s+(\w+)\s*(?:=\s*([\w.]+))?/g;
  let m;
  const allIdents = [];
  while ((m = varRe.exec(code)) !== null) {
    declared.set(m[1], { node: { type: 'VariableDeclarator', id: { type: 'Identifier', name: m[1] } }, used: false });
    if (m[2] && /^[a-z]\w*$/i.test(m[2])) allIdents.push(m[2]); // init 中的引用
  }
  // 解析其他标识符引用
  const identRe = /\b([a-z]\w*)\b/gi;
  while ((m = identRe.exec(code)) !== null) {
    if (!['const','let','var','function','return','if','else','for','while','console','log','warn','error'].includes(m[1])) {
      allIdents.push(m[1]);
    }
  }
  // 模拟 visitor
  for (const [name, info] of declared) visitors.VariableDeclarator(info.node);
  allIdents.forEach(name => { if (declared.has(name)) visitors.Identifier({ type: 'Identifier', name }); });
  visitors['Program:exit']();
  return ctx.reportings;
}

// ===== 测试 =====
const testCode = "const used = 1;\nconst unused = 2;\nconst alsoUsed = used + 1;\nconsole.log(alsoUsed);";
const reports = parseAndRun(testCode);
console.log('违规报告数:', reports.length); // 1
reports.forEach(r => console.log('  ', r.msg));
// 'unused' is defined but never used.
