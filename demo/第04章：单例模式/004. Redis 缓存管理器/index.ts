// 第04章：单例模式 - 004：Redis 缓存管理器
//
// 场景：缓存是为了减轻数据库压力而生的，如果每个业务模块自己维护一份缓存，
// 就会出现「同一份数据有多份缓存，更新时对不上」的脏读问题。
// 全局唯一的缓存管理器才能统一控制过期时间（TTL）、命中率统计和批量清理。

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null 表示永不过期
}

class RedisCacheManager {
  private static instance: RedisCacheManager | null = null;

  private store = new Map<string, CacheEntry<unknown>>();
  private stats = { hits: 0, misses: 0 };

  private constructor() {}

  static getInstance(): RedisCacheManager {
    if (!RedisCacheManager.instance) {
      RedisCacheManager.instance = new RedisCacheManager();
    }
    return RedisCacheManager.instance;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    // 惰性删除：读取时发现过期才清除
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return undefined;
    }
    this.stats.hits++;
    return entry.value as T;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getStats(): { hits: number; misses: number; hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total === 0 ? 'N/A' : `${((this.stats.hits / total) * 100).toFixed(1)}%`;
    return { ...this.stats, hitRate };
  }
}

// ============================================================
// 使用演示
// ============================================================

async function main() {
  const cacheA = RedisCacheManager.getInstance();
  const cacheB = RedisCacheManager.getInstance();

  console.log('两个模块拿到的是同一个缓存：', cacheA === cacheB); // true

  // 「用户服务」写入缓存，200ms 后过期
  cacheA.set('user:1001', { name: '张三', vip: true }, 200);
  // 「配置服务」写入缓存，永不过期
  cacheA.set('config:theme', 'dark');

  // 「订单服务」读取的是同一份缓存
  console.log('\n订单服务读取 user:1001：', cacheB.get('user:1001'));
  console.log('订单服务读取 config:theme：', cacheB.get('config:theme'));

  // 读取一个不存在的 key（未命中）
  cacheB.get('user:9999');

  // 等待 TTL 过期
  await new Promise((r) => setTimeout(r, 300));
  console.log('\n300ms 后再读 user:1001：', cacheA.get('user:1001'), '（已过期，自动清除）');

  // 命中率统计也是全局唯一的
  console.log('\n缓存统计：', cacheB.getStats());
}

main();

export {};
