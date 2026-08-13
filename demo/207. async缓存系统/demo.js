// 207. async缓存系统

function createAsyncCache(loader) {
  const cache = new Map();
  return (key) => (cache.has(key) ? cache.get(key) : cache.set(key, loader(key)).get(key));
}
const loadUser = createAsyncCache((id) => Promise.resolve({ id, name: 'user' + id }));
loadUser(1).then(console.log);
console.log(loadUser(1) === loadUser(1));
