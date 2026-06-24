/**
 * 手写请求数据缓存与刷新
 *
 * 需求：实现一个带缓存的数据请求器：
 *   - 首次请求真正发起，结果缓存下来
 *   - 后续相同 key 的请求命中缓存，直接返回（不发请求）
 *   - 提供 refresh(key) 主动刷新：忽略缓存重新请求并更新缓存
 *   - 支持 TTL 过期：超过有效期后下次请求自动重新拉取
 *   - 支持「stale-while-revalidate」：过期时立即返回旧值，同时后台刷新
 *
 * 设计：RequestCacheRefresh 类
 *   - get(key, fetcher)：取数据（命中缓存则直接返回）
 *   - refresh(key, fetcher)：强制刷新
 *   - 配置：ttl（有效期 ms）、swr（是否启用 stale-while-revalidate）
 */

class RequestCacheRefresh {
  constructor(options = {}) {
    this.ttl = options.ttl ?? 0; // 0 表示永不过期
    this.swr = options.swr ?? false;
    this._cache = new Map(); // key -> { value, expireAt, inflight }
    this._stats = { hits: 0, misses: 0, refreshes: 0 };
  }

  get stats() {
    return this._stats;
  }

  _isFresh(entry) {
    return this.ttl <= 0 || entry.expireAt > Date.now();
  }

  async _doFetch(key, fetcher) {
    // inflight 去重：同 key 并发刷新只发一次
    const existing = this._cache.get(key);
    if (existing && existing.inflight) return existing.inflight;

    const p = Promise.resolve()
      .then(() => fetcher(key))
      .then((value) => {
        const entry = this._cache.get(key) || {};
        entry.value = value;
        entry.expireAt = this.ttl > 0 ? Date.now() + this.ttl : Infinity;
        entry.inflight = null;
        this._cache.set(key, entry);
        return value;
      })
      .catch((err) => {
        // 失败：清除 inflight，保留旧值（若有），允许下次重试
        const entry = this._cache.get(key);
        if (entry) entry.inflight = null;
        throw err;
      });

    const entry = this._cache.get(key) || {};
    entry.inflight = p;
    this._cache.set(key, entry);
    return p;
  }

  async get(key, fetcher) {
    const entry = this._cache.get(key);

    // 无缓存：拉取
    if (!entry || entry.value === undefined) {
      this._stats.misses++;
      return this._doFetch(key, fetcher);
    }

    // 缓存新鲜：直接命中
    if (this._isFresh(entry)) {
      this._stats.hits++;
      return entry.value;
    }

    // 缓存过期
    if (this.swr) {
      // stale-while-revalidate：立即返回旧值，后台刷新
      this._stats.hits++;
      this._doFetch(key, fetcher).catch(() => {}); // 后台刷新，错误忽略
      return entry.value;
    }

    // 普通过期：重新拉取
    this._stats.misses++;
    return this._doFetch(key, fetcher);
  }

  async refresh(key, fetcher) {
    this._stats.refreshes++;
    return this._doFetch(key, fetcher);
  }

  invalidate(key) {
    this._cache.delete(key);
  }

  clear() {
    this._cache.clear();
  }
}

// ===== 测试 =====

function makeFetcher() {
  let count = 0;
  return {
    count: () => count,
    fetch: (key) =>
      new Promise((resolve) => {
        count++;
        console.log(`  [fetcher] real call #${count} for ${key}`);
        setTimeout(() => resolve({ key, data: "v" + count }), 20);
      }),
  };
}

(async () => {
  // 1. 基本缓存命中
  const f1 = makeFetcher();
  const c1 = new RequestCacheRefresh({ ttl: 1000 });
  await c1.get("k", f1.fetch);
  await c1.get("k", f1.fetch); // 命中
  await c1.get("k", f1.fetch); // 命中
  console.log("case1 fetcher calls:", f1.count()); // case1 fetcher calls: 1

  // 2. refresh 强制刷新
  await c1.refresh("k", f1.fetch);
  console.log("case2 fetcher calls:", f1.count()); // case2 fetcher calls: 2

  // 3. TTL 过期后自动重新拉取
  const f3 = makeFetcher();
  const c3 = new RequestCacheRefresh({ ttl: 50 });
  await c3.get("k3", f3.fetch);
  await new Promise((r) => setTimeout(r, 80)); // 等过期
  await c3.get("k3", f3.fetch); // 过期 -> 重新拉取
  console.log("case3 fetcher calls:", f3.count()); // case3 fetcher calls: 2

  // 4. stale-while-revalidate：过期立即返回旧值，后台刷新
  const f4 = makeFetcher();
  const c4 = new RequestCacheRefresh({ ttl: 50, swr: true });
  const first = await c4.get("k4", f4.fetch);
  console.log("case4 first:", first.data); // v1
  await new Promise((r) => setTimeout(r, 80)); // 过期
  const stale = await c4.get("k4", f4.fetch); // 应立即返回旧值 v1
  console.log("case4 stale returned:", stale.data); // v1
  await new Promise((r) => setTimeout(r, 40)); // 等后台刷新完成
  const after = await c4.get("k4", f4.fetch); // 命中刷新后的新值 v2
  console.log("case4 after revalidate:", after.data); // v2

  // 5. 并发去重：同时多次 get 同一未缓存 key，只发一次请求
  const f5 = makeFetcher();
  const c5 = new RequestCacheRefresh();
  await Promise.all([
    c5.get("k5", f5.fetch),
    c5.get("k5", f5.fetch),
    c5.get("k5", f5.fetch),
  ]);
  console.log("case5 fetcher calls:", f5.count()); // case5 fetcher calls: 1

  console.log("stats:", c5.stats);
})();
