/**
 * 手写简易 AMD 模块加载器
 *
 * AMD 规范：define(id?, deps?, factory)
 * 实现思路：
 *   1. define 注册模块，存储依赖和工厂函数
 *   2. require 异步加载依赖，递归解析后执行回调
 *   3. factory 返回值即模块导出
 */

const moduleRegistry = {};

function define(id, deps, factory) {
  if (typeof id === 'function') { factory = id; deps = ['require','exports','module']; id = null; }
  else if (Array.isArray(id)) { factory = deps; deps = id; id = null; }
  if (!deps) deps = ['require','exports','module'];
  moduleRegistry[id] = { deps, factory, exports: {}, _executed: false };
}

function requireModules(deps, callback) {
  const resolved = deps.map(dep => {
    if (dep === 'require') return requireModules;
    if (dep === 'exports') return {};
    if (dep === 'module') return { exports: {} };
    const mod = moduleRegistry[dep];
    if (!mod) return undefined;
    if (!mod._executed) {
      mod._executed = true;
      const args = mod.deps.map(d => {
        if (d === 'require') return requireModules;
        if (d === 'exports') return mod.exports;
        if (d === 'module') return { exports: mod.exports };
        return moduleRegistry[d]?.exports;
      });
      const result = mod.factory(...args);
      if (result !== undefined) mod.exports = result;
    }
    return mod.exports;
  });
  if (callback) callback(...resolved);
  return resolved;
}

// ===== 测试 =====
define('math', [], function() {
  return { add: (a, b) => a + b, sub: (a, b) => a - b };
});
define('calc', ['math'], function(math) {
  return { compute: (a, b) => math.add(a, b) * 2 };
});

requireModules(['calc', 'math'], function(calc, math) {
  console.log('math.add(3, 4):', math.add(3, 4));       // 7
  console.log('calc.compute(3, 4):', calc.compute(3, 4)); // 14
});
