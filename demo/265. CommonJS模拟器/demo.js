// 265. CommonJS模拟器

function createCommonJS(factory) {
  const module = { exports: {} };
  factory(module, module.exports, createCommonJS);
  return module.exports;
}
const obj = createCommonJS((module, exports) => {
  exports.name = "CommonJS";
  module.exports.version = "mock";
});
console.log(obj);
