/**
 * 手写请求重试机制
 *
 * 网络请求可能因瞬时抖动失败，重试机制能提升成功率。
 * 这里实现 requestWithRetry，支持：
 *   - 最大重试次数 retries
 *   - 重试间隔 delay（可指数退避）
 *   - 只对可重试错误（网络错误 / 5xx）重试
 *   - 返回 Promise，全部失败后 reject 最后一个错误
 *
 * 实现思路：
 *   1. 调用一次请求函数，成功直接 resolve
 *   2. 失败时判断是否可重试且剩余次数 > 0
 *   3. 等待 delay 毫秒后递归重试，delay 可按指数增长
 *   4. 用 try/await 写法使逻辑清晰
 */

function requestWithRetry(requestFn, options = {}) {
  const {
    retries = 3,
    delay = 500,
    backoff = "fixed", // 'fixed' | 'exponential'
    shouldRetry = defaultShouldRetry,
    onRetry = () => {},
  } = options;

  return new Promise((resolve, reject) => {
    let attempt = 0;

    function attemptOnce() {
      requestFn()
        .then(resolve)
        .catch((err) => {
          attempt++;
          if (attempt > retries || !shouldRetry(err)) {
            reject(err);
            return;
          }
          const wait =
            backoff === "exponential"
              ? delay * Math.pow(2, attempt - 1)
              : delay;
          onRetry({ attempt, error: err, nextDelay: wait });
          setTimeout(attemptOnce, wait);
        });
    }

    attemptOnce();
  });
}

function defaultShouldRetry(err) {
  // 网络错误或 5xx 可重试，4xx 不重试
  if (!err) return true;
  if (err.status === 0) return true; // 网络错误
  if (err.status >= 500 && err.status < 600) return true;
  return false;
}

// ===== 测试 =====
function makeFlakyRequest(failTimes) {
  let count = 0;
  return function () {
    count++;
    return new Promise((resolve, reject) => {
      if (count <= failTimes) {
        reject({ status: 503, message: "Service Unavailable" });
      } else {
        resolve({ status: 200, data: `success at attempt ${count}` });
      }
    });
  };
}

// 场景1：第 2 次成功
requestWithRetry(makeFlakyRequest(1), {
  retries: 3,
  delay: 10,
  backoff: "exponential",
  onRetry: ({ attempt, nextDelay }) =>
    console.log(`重试第 ${attempt} 次，等待 ${nextDelay}ms`),
})
  .then((res) => console.log("场景1 结果:", res.data)) // 场景1 结果: success at attempt 2
  .catch((err) => console.log("场景1 失败:", err.message));

// 场景2：一直失败，超过重试次数
requestWithRetry(makeFlakyRequest(99), {
  retries: 2,
  delay: 5,
})
  .then((res) => console.log("场景2 结果:", res.data))
  .catch((err) =>
    console.log("场景2 最终失败:", err.message, "status:", err.status),
  ); // 场景2 最终失败: Service Unavailable status: 503

// 场景3：4xx 不重试
requestWithRetry(
  function () {
    return Promise.reject({ status: 404, message: "Not Found" });
  },
  { retries: 3, delay: 5 },
)
  .then((res) => console.log("场景3 结果:", res))
  .catch((err) => console.log("场景3 不重试直接失败:", err.status)); // 场景3 不重试直接失败: 404
