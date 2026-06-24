/**
 * 手写 Promise 重试机制
 *
 * 需求：执行一个返回 Promise 的任务，如果失败，自动重试，直到成功
 *      或达到最大重试次数。
 *
 * 参数：
 *   - task: 返回 Promise 的函数
 *   - retries: 最大重试次数（不含首次执行），默认 3
 *   - delay: 每次重试前等待毫秒，默认 0
 *
 * 行为：
 *   - 首次执行 + retries 次重试 = 最多执行 (retries + 1) 次
 *   - 全部失败后，reject 最后一次的错误
 *   - 成功则立即 resolve 该值
 *
 * 思路：递归调用，用计数器记录已重试次数；失败时若还有次数则延时后重试。
 */

function promiseRetry(task, options = {}) {
  const { retries = 3, delay = 0, onRetry } = options;

  return new Promise((resolve, reject) => {
    let attempt = 0;

    const run = () => {
      attempt++;
      Promise.resolve()
        .then(() => task(attempt))
        .then(resolve)
        .catch((err) => {
          // 还能重试吗？attempt 从 1 开始，已执行 attempt 次，
          // 剩余可重试次数 = retries + 1 - attempt
          if (attempt <= retries) {
            if (typeof onRetry === "function") onRetry(attempt, err);
            setTimeout(run, delay);
          } else {
            reject(err); // 用尽次数
          }
        });
    };

    run();
  });
}

// ===== 测试 =====

// 模拟任务：前 failTimes 次失败，之后成功
function makeFlakyTask(failTimes, delay = 20) {
  let count = 0;
  return (attempt) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        count++;
        if (count <= failTimes) {
          reject(new Error(`attempt ${attempt} failed (count=${count})`));
        } else {
          resolve(`succeeded at attempt ${attempt} (count=${count})`);
        }
      }, delay);
    });
}

(async () => {
  // 1. 第 3 次成功（默认 retries=3，刚好够）
  try {
    const r1 = await promiseRetry(makeFlakyTask(2), {
      onRetry: (n, e) => console.log(`  retry #${n}: ${e.message}`),
    });
    console.log("case1:", r1); // case1: succeeded at attempt 3 (count=3)
  } catch (e) {
    console.log("case1 unexpected fail:", e.message);
  }

  // 2. 总是失败 -> 用尽次数后 reject
  try {
    await promiseRetry(makeFlakyTask(Infinity), { retries: 2, delay: 10 });
    console.log("case2 should not succeed");
  } catch (e) {
    console.log("case2 finally rejected:", e.message);
    // case2 finally rejected: attempt 3 failed (count=3)
  }

  // 3. 一次就成功，不触发重试
  const r3 = await promiseRetry(makeFlakyTask(0));
  console.log("case3:", r3); // case3: succeeded at attempt 1 (count=1)

  // 4. 带 delay 的重试
  const start = Date.now();
  await promiseRetry(makeFlakyTask(1), { retries: 2, delay: 50 });
  console.log("case4 elapsed >= 50ms:", Date.now() - start >= 50);
  // case4 elapsed >= 50ms: true
})();
