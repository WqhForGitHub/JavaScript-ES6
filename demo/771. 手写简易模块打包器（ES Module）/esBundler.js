/**
 * 手写简易模块打包器（ES Module）
 *
 * 功能：将多个 ES Module 文件打包成单文件 IIFE 输出
 * 实现思路：
 *   1. 从入口文件开始递归读取内容
 *   2. 用正则解析 import/export 语句提取依赖路径
 *   3. 构建依赖图，将每个模块包装成函数
 *   4. 用 __r() 模拟 require 机制，输出单文件
 */

const fs = require('fs');
const path = require('path');

// 解析 import 依赖
function parseImports(code) {
  const deps = [];
  const re = /import\s+.*?from\s+['"`](.+?)['"`]/g;
  let m;
  while ((m = re.exec(code)) !== null) deps.push(m[1]);
  return deps;
}

// 转换 ES Module 语法为 CommonJS-like
function transform(code) {
  code = code.replace(/import\s+\{([^}]+)\}\s+from\s+['"`](.+?)['"`]/g, "const { $1 } = __r('$2');");
  code = code.replace(/import\s+(\w+)\s+from\s+['"`](.+?)['"`]/g, "const $1 = __r('$2').default;");
  code = code.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"`](.+?)['"`]/g, "const $1 = __r('$2');");
  code = code.replace(/export\s+default\s+/g, 'module.exports.default = ');
  code = code.replace(/export\s+\{([^}]+)\}/g, (_, n) =>
    n.split(',').map(s => 'module.exports.' + s.trim() + ' = ' + s.trim() + ';').join('\n'));
  code = code.replace(/export\s+(const|let|var)\s+(\w+)/g, '$1 $2 = $2; module.exports.$2 = $2;');
  return code;
}

// 构建依赖图
function buildGraph(entry, modules = {}) {
  const p = path.resolve(entry);
  if (modules[p]) return modules;
  const code = fs.readFileSync(p, 'utf8');
  const id = Object.keys(modules).length;
  modules[p] = { id, code: transform(code), deps: [] };
  for (const dep of parseImports(code)) {
    const dp = path.resolve(path.dirname(p), dep + (path.extname(dep) ? '' : '.js'));
    modules[p].deps.push(dp);
    buildGraph(dp, modules);
  }
  return modules;
}

// 打包
function bundle(entry) {
  const modules = buildGraph(entry);
  const arr = Object.entries(modules).map(([k, m]) => {
    const deps = m.deps.map(d => modules[d]?.id ?? 0);
    return '  ' + m.id + ': function(module, exports, __r) {\n' + m.code.split('\n').map(l => '    ' + l).join('\n') + '\n  }';
  }).join(',\n');
  return '(function(modules){\n  var cache={};\n  function __r(id){\n    if(cache[id])return cache[id].exports;\n    var module=cache[id]={exports:{}};\n    modules[id].call(module.exports,module,module.exports,__r);\n    return module.exports;\n  }\n  __r(0);\n})({\n' + arr + '\n});';
}

// ===== 测试（模拟演示） =====
console.log('=== ES Module 打包器逻辑演示 ===');
// 模拟模块源码
const mockModules = {
  '/entry.js': { id: 0, code: "const { add } = __r('./math');\nconsole.log(add(1, 2));", deps: ['/math.js'] },
  '/math.js':  { id: 1, code: "exports.add = function(a, b) { return a + b; };", deps: [] },
};
const mockOutput = Object.entries(mockModules).map(([k, m]) =>
  '  ' + m.id + ': function(module, exports, __r) {\n    ' + m.code.replace(/\n/g, '\n    ') + '\n  }'
).join(',\n');
console.log('打包输出预览:');
console.log('(function(modules){ var cache={}; function __r(id){...} __r(0); })({');
console.log(mockOutput);
console.log('});');
console.log('\n解析 import 正则:', /import\s+.*?from\s+['"`](.+?)['"`]/g.source);
