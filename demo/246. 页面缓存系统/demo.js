// 246. 页面缓存系统

class PageCache {
  constructor(limit = 3) {
    this.limit = limit;
    this.cache = new Map();
  }
  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.limit) this.cache.delete(this.cache.keys().next().value);
  }
  get(key) {
    return this.cache.get(key);
  }
}
const cache = new PageCache(2);
cache.set('home', 'html');
console.log(cache.get('home'));
