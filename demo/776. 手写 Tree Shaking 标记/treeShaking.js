/**
 * 手写 Tree Shaking 标记
 *
 * 功能：分析模块导出，标记未使用的导出（死代码消除）
 * 实现思路：
 *   1. 解析模块 export 列表
 *   2. 解析所有 import 引用
 *   3. 标记被引用的导出为 used
 *   4. 未被引用的导出即为可摇除的 dead code
 */

class TreeShaker {
  constructor() { this.modules = new Map(); this.sources = {}; }
  setSources(s) { this.sources = s; }

  parseExports(code) {
    const exports = new Set();
    let m;
    const r1 = /export\s+\{([^}]+)\}/g;
    while ((m = r1.exec(code)) !== null) m[1].split(',').forEach(n => exports.add(n.trim()));
    if (/export\s+default/.test(code)) exports.add('default');
    const r2 = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    while ((m = r2.exec(code)) !== null) exports.add(m[1]);
    return exports;
  }

  parseImports(code) {
    const imports = [];
    let m;
    const r1 = /import\s+\{([^}]+)\}\s+from\s+['"`](.+?)['"`]/g;
    while ((m = r1.exec(code)) !== null) imports.push({ source: m[2], names: m[1].split(',').map(s=>s.trim()).filter(Boolean) });
    const r2 = /import\s+(\w+)\s+from\s+['"`](.+?)['"`]/g;
    while ((m = r2.exec(code)) !== null) imports.push({ source: m[2], names: ['default'] });
    return imports;
  }

  analyze(entry) {
    const visited = new Set(), queue = [entry];
    while (queue.length) {
      const p = queue.shift();
      if (visited.has(p)) continue;
      visited.add(p);
      const code = this.sources[p] || '';
      const info = { id: this.modules.size, path: p, exports: this.parseExports(code), imports: this.parseImports(code), usedExports: new Set() };
      this.modules.set(p, info);
      info.imports.forEach(imp => queue.push(imp.source));
    }
    for (const [, info] of this.modules) {
      for (const imp of info.imports) {
        const dep = this.modules.get(imp.source);
        if (dep) imp.names.forEach(n => dep.usedExports.add(n));
      }
    }
  }

  getShakeable() {
    const result = [];
    for (const [p, info] of this.modules) {
      const unused = [...info.exports].filter(e => !info.usedExports.has(e));
      if (unused.length) result.push({ path: p, unused, used: [...info.usedExports] });
    }
    return result;
  }
}

// ===== 测试 =====
const shaker = new TreeShaker();
shaker.setSources({
  'entry.js': "import { add } from './math'; console.log(add(1,2));",
  './math': "export function add(a,b){return a+b} export function sub(a,b){return a-b} export function mul(a,b){return a*b}",
});
shaker.analyze('entry.js');
const shakeable = shaker.getShakeable();
console.log('可摇除的导出:');
shakeable.forEach(s => console.log('  ' + s.path + ': 未使用 [' + s.unused.join(', ') + ']'));
// ./math: 未使用 [sub, mul]
