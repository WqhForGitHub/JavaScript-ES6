/**
 * 手写请求去重（相同请求合并）
 *
 * 短时间内多次发起相同请求时，只发一次真实请求，所有调用共享同一个 Promise。
 * 区别于缓存（缓存可设 TTL），去重关注"进行中"的请求合并。
 *
 * 这里实现 createDedupRequest 工厂，支持：
 *   - 相同 key 的并发请求复用同一个 Promise
 *   - 请求完成后移除 inflight 记录（下次重新发起）
 *   - 失败也会移除记录，避免后续永远失败
 *
 * 实现思路：
 *   1. 维护 inflight Map: key -> Promise
 *   2. 请求前查 inflight，命中直接返回
 *   3. 未命中则发起请求并写入 inflight
 *   4. 无论成功失败，finally 中删除 inflight 记录
 */

function createDedupRequest(requestFn, options = {}) {
  const { keyGenerator = defaultKeyGenerator } = options;
  const inflight = new Map();
  const stats = { deduped: 0, total: 0 };

  function wrapped(...args) {
    stats.total++;
    const key = keyGenerator(args);

    if (inflight.has(key)) {
      stats.deduped++;
      return inflight.get(key);
    }

    const promise = Promise.resolve()
      .then(() => requestFn(...args))
      .finally(() => {
        inflight.delete(key);
      });

    inflight.set(key, promise);
    return promise;
  }

  wrapped.inflight = inflight;
  wrapped.stats = stats;
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
let requestCount = 0;
function fetchProduct(id) {
  requestCount++;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: `product${id}` }), 30);
  });
}

const getProduct = createDedupRequest(fetchProduct);

// 同时发起 3 次相同请求
Promise.all([
  getProduct(101),
  getProduct(101),
  getProduct(101),
]).then((results) => {
  console.log("结果相同:", results[0] === results[1] && results[1] === results[2]); // 结果相同: true
  console.log("实际请求次数:", requestCount); // 实际请求次数: 1
  console.log("stats:", getProduct.stats); // stats: { deduped: 2, total: 3 }
});

// 不同参数不合并
Promise.all([getProduct(102), getProduct(103)]).then((res) => {
  console.log("不同参数结果:", res.map((r) => r.name)); // 不同参数结果: [ 'product102', 'product103' ]
  console.log("累计请求次数:", requestCount); // 累计请求次数: 3
});

// 请求完成后再次发起会重新请求
setTimeout(() => {
  getProduct(101).then(() => {
    console.log("完成后再次请求, 累计次数:", requestCount); // 完成后再次请求, 累计次数: 4
    console.log("stats:", getProduct.stats);
  });
}, 80);

// 失败场景去重
let failCount = 0;
const failFn = createDedupRequest(function () {
  failCount++;
  return Promise.reject(new Error("fail"));
});
Promise.allSettled([failFn("x"), failFn("x"), failFn("x")]).then(() => {
  console.log("失败去重实际调用次数:", failCount); // 失败去重实际调用次数: 1
});
