// 264. 模块缓存机制

const moduleCache = new Map();
function requireMock(name, factory) {
  if (moduleCache.has(name)) return moduleCache.get(name).exports;
  const module = { exports: {} };
  moduleCache.set(name, module);
  factory(module, module.exports);
  return module.exports;
}
const a = requireMock('counter', (m) => (m.exports.count = 1)),
  b = requireMock('counter', () => {});
console.log(a === b, b.count);
