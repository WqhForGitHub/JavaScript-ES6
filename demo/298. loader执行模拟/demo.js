// 298. loader执行模拟

function runLoaders(source, loaders) {
  return loaders.reduceRight((content, loader) => loader(content), source);
}
console.log(runLoaders('hello', [(s) => `${s}!`, (s) => s.toUpperCase()]));
