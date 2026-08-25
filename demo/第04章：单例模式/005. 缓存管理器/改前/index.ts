class Cache {
  private store: Map<string, any> = new Map();
  set(k: string, v: any) { this.store.set(k, v); }
  get(k: string) { return this.store.get(k); }
}

const cache1 = new Cache();
cache1.set('user', { name: 'Alice' });
const cache2 = new Cache();
console.log(cache2.get('user')); // undefined —— 不是同一个缓存

export { }