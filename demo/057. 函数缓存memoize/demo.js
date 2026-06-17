// 57. 函数缓存memoize

function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
const square = memoize((n) => n * n);
console.log(square(6));
console.log(square(6));
