// 40. 闭包缓存系统

function createCache() {
  const store = new Map();
  return {
    get: (k) => store.get(k),
    set: (k, v) => store.set(k, v),
    has: (k) => store.has(k),
  };
}
const cache = createCache();
cache.set('token', 'abc');
console.log(cache.has('token'), cache.get('token'));
