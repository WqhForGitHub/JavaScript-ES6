/**
 * 手写请求重试（指数退避策略）
 *
 * 需求：对可能失败的请求实现重试，每次重试前等待时间按指数增长，
 *      避免下游服务在过载时被进一步冲击。
 *
 * 指数退避公式：第 n 次重试前等待 = base * 2^(n-1) + jitter
 *   - base：初始退避基数（如 100ms）
 *   - 指数：2 的幂次，让等待时间快速增大
 *   - jitter（抖动）：随机量，避免多个客户端同时重试造成「惊群」
 *   - 通常会设置 maxBackoff 上限，避免等待过久
 *
 * 参数：
 *   - task(attempt)：返回 Promise 的请求函数
 *   - options.retries：最大重试次数（不含首次），默认 5
 *   - options.base：初始退避毫秒，默认 100
 *   - options.maxBackoff：单次最大退避毫秒，默认 5000
 *   - options.jitter：是否加抖动，默认 true
 *   - options.shouldRetry(err)：根据错误决定是否还要重试，默认总是重试
 */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff(task, options = {}) {
  const {
    retries = 5,
    base = 100,
    maxBackoff = 5000,
    jitter = true,
    factor = 2,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt++;
    try {
      return await task(attempt);
    } catch (err) {
      // 已用尽次数，或错误类型不应重试
      const noMoreAttempts = attempt > retries;
      if (noMoreAttempts || !shouldRetry(err)) {
        throw err;
      }

      // 计算退避时间：base * factor^(attempt-1)
      const expo = base * Math.pow(factor, attempt - 1);
      const capped = Math.min(expo, maxBackoff);
      // jitter：0 ~ capped/2 的随机量，避免惊群
      const jitterAmount = jitter ? Math.random() * (capped / 2) : 0;
      const wait = Math.round(capped + jitterAmount);

      if (typeof onRetry === "function") {
        onRetry(attempt, wait, err);
      }
      await delay(wait);
    }
  }
}

// ===== 测试 =====

// 模拟请求：前 failTimes 次失败
function makeRequest(failTimes) {
  let count = 0;
  return () =>
    new Promise((resolve, reject) => {
      count++;
      if (count <= failTimes) {
        reject(new Error(`request failed (count=${count})`));
      } else {
        resolve(`ok (count=${count})`);
      }
    });
}

(async () => {
  // 1. 前 2 次失败，第 3 次成功；观察退避时间增长
  const t0 = Date.now();
  const r1 = await retryWithBackoff(makeRequest(2), {
    retries: 5,
    base: 50,
    maxBackoff: 1000,
    onRetry: (n, wait) => console.log(`  retry #${n} after ${wait}ms`),
  });
  console.log("case1:", r1, "elapsed≈", Date.now() - t0, "ms");
  // 退避序列约：50, 100, ...（含 jitter），总耗时约 150+ms

  // 2. 用尽重试次数仍失败 -> 抛出最后错误
  try {
    await retryWithBackoff(makeRequest(Infinity), {
      retries: 3,
      base: 20,
      maxBackoff: 100,
    });
  } catch (e) {
    console.log("case2 exhausted:", e.message);
    // case2 exhausted: request failed (count=4)  （首次+3次重试=4次）
  }

  // 3. shouldRetry：仅对特定错误重试
  class TransientError extends Error {}
  class FatalError extends Error {}
  let calls = 0;
  const task = () => {
    calls++;
    return Promise.reject(new FatalError("fatal"));
  };
  try {
    await retryWithBackoff(task, {
      retries: 5,
      base: 10,
      shouldRetry: (err) => err instanceof TransientError,
    });
  } catch (e) {
    console.log("case3 not retried, calls=", calls, "err=", e.message);
    // case3 not retried, calls= 1 err= fatal
  }

  // 4. 一次就成功，不触发重试
  const r4 = await retryWithBackoff(makeRequest(0), { base: 10 });
  console.log("case4:", r4); // case4: ok (count=1)
})();
