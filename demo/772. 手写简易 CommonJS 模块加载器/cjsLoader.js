/**
 * 手写简易 CommonJS 模块加载器
 *
 * 功能：模拟 Node.js 的 require 机制
 * 实现思路：
 *   1. require(id) 先查缓存
 *   2. 创建 module 对象 { exports: {} }
 *   3. 用 Function 构造器包装模块代码
 *   4. 执行模块函数，返回 module.exports
 */

const moduleCache = {};

function myRequire(moduleId) {
  if (moduleCache[moduleId]) return moduleCache[moduleId].exports;

  const module = { exports: {}, id: moduleId, loaded: false };
  moduleCache[moduleId] = module;

  const code = moduleSource[moduleId];
  if (!code) throw new Error("Cannot find module '" + moduleId + "'");

  const dirname = moduleId.substring(0, moduleId.lastIndexOf("/"));
  // 包装模块代码
  const wrapper =
    "(function(module, exports, require, __dirname, __filename) {\n" +
    code +
    "\n})";
  const fn = new Function("return " + wrapper)();
  fn.call(module.exports, module, module.exports, myRequire, dirname, moduleId);
  module.loaded = true;
  return module.exports;
}

// 模拟模块源码
const moduleSource = {
  "./math":
    "exports.add = function(a, b) { return a + b; };\nexports.mul = function(a, b) { return a * b; };",
  "./app":
    "const math = require('./math');\nexports.result = math.mul(math.add(2, 3), 4);",
};

// ===== 测试 =====
const math = myRequire("./math");
console.log("math.add(2, 3):", math.add(2, 3)); // 5
console.log("math.mul(2, 3):", math.mul(2, 3)); // 6

const app = myRequire("./app");
console.log("(2+3)*4:", app.result); // 20

// 缓存命中
const math2 = myRequire("./math");
console.log("缓存命中:", math === math2); // true
