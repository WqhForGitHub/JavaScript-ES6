// 276. API缓存系统

function cacheApi(fn) {
  const cache = new Map();
  return async (key) => {
    if (cache.has(key)) return cache.get(key);
    const promise = fn(key);
    cache.set(key, promise);
    return promise;
  };
}
cacheApi((id) => Promise.resolve({ id }))(1).then(console.log);
