/**
 * 手写 Promise 缓存（请求去重）
 *
 * 需求：对同一个 key 的并发请求，只真正发起一次，所有调用方共享同一个
 *      进行中的 Promise，并拿到相同结果。即「请求去重 / inflight cache」。
 *
 * 场景：前端短时间内多次点击同一接口、SSR 同一数据被多处请求等。
 *
 * 思路：
 *   - 用 Map<key, Promise> 保存「正在进行」的 Promise
 *   - get(key, fetcher)：
 *       若 cache 有该 key 的进行中 Promise -> 直接返回它（去重）
 *       否则调用 fetcher()，把 Promise 存入 cache，并设置完成后清理
 *   - 成功/失败都要从 cache 移除（失败后允许下次重试）
 *   - 可选：成功结果额外缓存（带 TTL），实现短期缓存命中
 */

class PromiseCache {
  constructor(options = {}) {
    this.ttl = options.ttl ?? 0; // 0 表示不缓存已完成的值
    this._inflight = new Map(); // key -> 进行中的 Promise
    this._valueCache = new Map(); // key -> { value, expireAt }
  }

  get(key, fetcher) {
    // 1. 命中已完成值缓存
    if (this.ttl > 0 && this._valueCache.has(key)) {
      const entry = this._valueCache.get(key);
      if (entry.expireAt > Date.now()) {
        return Promise.resolve(entry.value);
      }
      this._valueCache.delete(key); // 过期
    }

    // 2. 命中进行中的 Promise -> 去重
    if (this._inflight.has(key)) {
      return this._inflight.get(key);
    }

    // 3. 发起新请求
    const p = Promise.resolve()
      .then(() => fetcher(key))
      .then(
        (value) => {
          // 成功：可选写入值缓存
          if (this.ttl > 0) {
            this._valueCache.set(key, {
              value,
              expireAt: Date.now() + this.ttl,
            });
          }
          return value;
        },
        (err) => {
          // 失败：抛出，但不要缓存错误
          throw err;
        }
      )
      .finally(() => {
        // 无论成功失败，从进行中移除（失败后允许重试）
        this._inflight.delete(key);
      });

    this._inflight.set(key, p);
    return p;
  }

  // 主动失效
  invalidate(key) {
    this._inflight.delete(key);
    this._valueCache.delete(key);
  }

  clear() {
    this._inflight.clear();
    this._valueCache.clear();
  }
}

// ===== 测试 =====

// 模拟一个会真正发起网络请求的 fetcher：用计数器统计调用次数
function makeFetcher() {
  let count = 0;
  return {
    count: () => count,
    fetch: (key) =>
      new Promise((resolve) => {
        count++;
        console.log(`  [fetcher] real call #${count} for key=${key}`);
        setTimeout(() => resolve("data for " + key), 30);
      }),
  };
}

(async () => {
  // 1. 并发去重：5 个并发请求，fetcher 只被调用 1 次
  const f1 = makeFetcher();
  const cache1 = new PromiseCache();
  const results = await Promise.all([
    cache1.get("user:1", f1.fetch),
    cache1.get("user:1", f1.fetch),
    cache1.get("user:1", f1.fetch),
    cache1.get("user:1", f1.fetch),
    cache1.get("user:1", f1.fetch),
  ]);
  console.log("all same:", results.every((r) => r === results[0])); // all same: true
  console.log("fetcher called:", f1.count(), "times"); // fetcher called: 1 times

  // 2. 失败后允许重试
  let calls = 0;
  const cache2 = new PromiseCache();
  const failTwice = () =>
    new Promise((_, rej) => {
      calls++;
      if (calls <= 2) rej(new Error("fail " + calls));
      else return Promise.resolve("ok"); // 不会走到，因为下面同步逻辑
    });
  // 用同步 reject 模拟
  const flaky = () => {
    calls++;
    if (calls <= 2) return Promise.reject(new Error("fail " + calls));
    return Promise.resolve("ok on " + calls);
  };
  try {
    await cache2.get("k", flaky);
  } catch (e) {
    console.log("1st call failed:", e.message);
  }
  try {
    await cache2.get("k", flaky);
  } catch (e) {
    console.log("2nd call failed:", e.message);
  }
  const ok = await cache2.get("k", flaky);
  console.log("3rd call:", ok); // 3rd call: ok on 3

  // 3. 带 TTL 的值缓存：第二次命中缓存，不再调用 fetcher
  const f3 = makeFetcher();
  const cache3 = new PromiseCache({ ttl: 1000 });
  await cache3.get("k1", f3.fetch);
  await cache3.get("k1", f3.fetch); // 命中值缓存
  await cache3.get("k1", f3.fetch); // 命中值缓存
  console.log("ttl fetcher called:", f3.count(), "times"); // ttl fetcher called: 1 times
  cache3.invalidate("k1");
  await cache3.get("k1", f3.fetch); // 失效后再次调用
  console.log("after invalidate called:", f3.count(), "times"); // after invalidate called: 2 times
})();
