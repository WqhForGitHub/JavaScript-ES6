class Cache {
  private static instance: Cache;
  private store: Map<string, any> = new Map();

  private constructor() { }
  static getInstance(): Cache {
    if (!Cache.instance) Cache.instance = new Cache();
    return Cache.instance;
  }

  set(k: string, v: any) { this.store.set(k, v); }
  get(k: string) { return this.store.get(k); }
}

const cache1 = Cache.getInstance();
cache1.set('user', { name: 'Alice' });
const cache2 = Cache.getInstance();
console.log(cache2.get('user')); // { name: 'Alice' } ✅

export { }