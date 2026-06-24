/**
 * 手写请求缓存
 *
 * 相同参数的请求重复发起时，直接返回缓存结果，减少网络开销。
 * 这里实现 createCachedRequest 工厂，支持：
 *   - 基于 cache key（序列化参数）缓存结果
 *   - TTL 过期时间
 *   - 主动清除 / 清空缓存
 *   - 缓存命中统计
 *
 * 实现思路：
 *   1. 用 Map 存储 { value, expireAt }
 *   2. 请求前先生成 key，命中且未过期直接返回
 *   3. 未命中则发起请求，成功后写入缓存
 *   4. 提供 get / set / delete / clear / has 方法
 */

function createCachedRequest(requestFn, options = {}) {
  const { ttl = 60000, keyGenerator = defaultKeyGenerator } = options;
  const cache = new Map();
  const stats = { hit: 0, miss: 0 };

  function wrapped(...args) {
    const key = keyGenerator(args);
    const entry = cache.get(key);
    const now = Date.now();

    if (entry && entry.expireAt > now) {
      stats.hit++;
      return Promise.resolve(entry.value);
    }

    stats.miss++;
    return requestFn(...args).then((result) => {
      cache.set(key, { value: result, expireAt: now + ttl });
      return result;
    });
  }

  wrapped.cache = cache;
  wrapped.stats = stats;
  wrapped.get = (key) => {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expireAt <= Date.now()) {
      cache.delete(key);
      return undefined;
    }
    return entry.value;
  };
  wrapped.set = (key, value) => {
    cache.set(key, { value, expireAt: Date.now() + ttl });
  };
  wrapped.delete = (key) => cache.delete(key);
  wrapped.clear = () => cache.clear();
  wrapped.has = (key) => {
    const entry = cache.get(key);
    return !!entry && entry.expireAt > Date.now();
  };

  return wrapped;
}

function defaultKeyGenerator(args) {
  try {
    return JSON.stringify(args);
  } catch (e) {
    return String(args);
  }
}

// ===== 测试 =====
let fetchCount = 0;
function fetchUser(id) {
  fetchCount++;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: `user${id}`, fetchCount }), 5);
  });
}

const getUser = createCachedRequest(fetchUser, { ttl: 100 });

getUser(1).then((u) => {
  console.log("第1次:", u.name, "实际请求次数:", fetchCount); // 第1次: user1 实际请求次数: 1
  getUser(1).then((u2) => {
    console.log("第2次(命中缓存):", u2.name, "实际请求次数:", fetchCount); // 第2次(命中缓存): user1 实际请求次数: 1
    console.log("stats:", getUser.stats); // stats: { hit: 1, miss: 1 }
  });
});

getUser(2).then((u) => console.log("不同参数:", u.name, "请求次数:", fetchCount)); // 不同参数: user2 请求次数: 2

// 等待过期后再次请求
setTimeout(() => {
  getUser(1).then((u) => {
    console.log("过期后重新请求:", u.name, "请求次数:", fetchCount); // 过期后重新请求: user1 请求次数: 3
    console.log("最终 stats:", getUser.stats); // hit:1 miss:3 左右
  });
}, 120);

// 主动清除
setTimeout(() => {
  getUser.clear();
  console.log("clear 后 has(1):", getUser.has('[[1]]')); // clear 后 has(1): false
}, 200);
