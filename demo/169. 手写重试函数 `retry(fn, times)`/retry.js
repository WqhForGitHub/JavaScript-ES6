/**
 * 手写重试函数 retry(fn, times)
 *
 * 作用：
 *   - 当函数执行失败（抛错或 reject）时，自动重试指定次数
 *   - 全部重试失败后，抛出最后一次的错误
 *   - 典型场景：网络请求重试、不稳定操作重试
 *
 * 实现思路：
 *   1. 循环或递归调用 fn
 *   2. 捕获错误后递减次数继续重试
 *   3. 支持异步函数（fn 返回 Promise）
 *   4. 可选：重试间隔、退避策略
 */

// 基础版：同步 + 异步通用
function retry(fn, times = 3) {
  return function (...args) {
    return attempt(fn, args, times);
  };
}

function attempt(fn, args, left) {
  let result;
  try {
    result = fn(...args);
  } catch (err) {
    // 同步抛错
    if (left <= 1) throw err;
    return attempt(fn, args, left - 1);
  }
  // 异步：处理 Promise
  if (result && typeof result.then === "function") {
    return result.catch((err) => {
      if (left <= 1) throw err;
      return attempt(fn, args, left - 1);
    });
  }
  return result;
}

// 带延迟的增强版
function retryWithDelay(fn, times = 3, delay = 0, backoff = false) {
  return function (...args) {
    return attemptDelay(fn, args, times, delay, 1);
  };

  function attemptDelay(fn, args, left, delayMs, attemptNo) {
    return new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => fn(...args))
        .then(resolve)
        .catch((err) => {
          if (left <= 1) {
            reject(err);
            return;
          }
          const wait = backoff ? delayMs * Math.pow(2, attemptNo - 1) : delayMs;
          setTimeout(() => {
            attemptDelay(fn, args, left - 1, delayMs, attemptNo + 1)
              .then(resolve, reject);
          }, wait);
        });
    });
  }
}

// ===== 测试 =====

// 同步重试
let syncCount = 0;
const flakySync = () => {
  syncCount++;
  if (syncCount < 3) throw new Error("fail");
  return "ok";
};
console.log(retry(flakySync, 5)()); // 'ok'（第 3 次成功）
console.log("同步尝试次数:", syncCount); // 3

// 同步重试耗尽
let alwaysFail = 0;
try {
  retry(() => {
    alwaysFail++;
    throw new Error("always");
  }, 3)();
} catch (e) {
  console.log("同步重试耗尽:", e.message, "尝试:", alwaysFail); // always 3
}

// 异步重试
(async () => {
  let asyncCount = 0;
  const flakyAsync = () =>
    new Promise((resolve, reject) => {
      asyncCount++;
      if (asyncCount < 3) reject(new Error("async fail"));
      else resolve("async ok");
    });
  const r = await retry(flakyAsync, 5)();
  console.log("异步重试结果:", r); // 'async ok'
  console.log("异步尝试次数:", asyncCount); // 3
})();

// 异步重试耗尽
(async () => {
  let asyncFail = 0;
  try {
    await retry(
      () => {
        asyncFail++;
        return Promise.reject(new Error("async always"));
      },
      3
    )();
  } catch (e) {
    console.log("异步重试耗尽:", e.message, "尝试:", asyncFail); // async always 3
  }
})();

// 带延迟的重试（指数退避）
(async () => {
  let count = 0;
  const start = Date.now();
  const r = await retryWithDelay(
    () => {
      count++;
      if (count < 3) return Promise.reject(new Error("retry"));
      return Promise.resolve("success");
    },
    5,
    100,
    true
  )();
  const elapsed = Date.now() - start;
  console.log("退避重试结果:", r); // 'success'
  console.log("退避重试次数:", count); // 3
  console.log("退避耗时>=100+200:", elapsed >= 250); // true（指数退避 100+200）
})();
