// 297. 模块打包模拟器

function bundle(modules, entry) {
  const cache = {};
  function require(id) {
    if (cache[id]) return cache[id].exports;
    const module = { exports: {} };
    cache[id] = module;
    modules[id](require, module, module.exports);
    return module.exports;
  }
  return require(entry);
}
console.log(
  bundle(
    {
      main(req, module) {
        module.exports = "bundle result";
      },
    },
    "main",
  ),
);
