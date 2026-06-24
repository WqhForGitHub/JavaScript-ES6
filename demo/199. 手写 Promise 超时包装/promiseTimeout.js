/**
 * 手写 Promise 超时包装
 *
 * 需求：给一个 Promise/任务加上超时限制，超过指定时间未完成则 reject。
 *
 * 实现思路：用 Promise.race 竞争「原任务」与「超时定时器」。
 *   - 原任务先完成 -> 返回原结果（或原错误）
 *   - 超时定时器先触发 -> reject 一个 TimeoutError
 *
 * 注意：JS 无法真正中止一个已发起的异步操作（fetch/定时器等），
 *      超时只是「不再等待」它的结果；底层资源仍可能继续运行。
 *      若任务支持取消（AbortController），可配合实现更彻底的取消。
 */

class TimeoutError extends Error {
  constructor(ms) {
    super(`Promise timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

// 版本一：包装一个返回 Promise 的函数
function withTimeout(task, ms, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(message ?? ms));
    }, ms);

    Promise.resolve()
      .then(() => task())
      .then(
        (value) => {
          clearTimeout(timer); // 任务完成，取消超时定时器
          resolve(value);
        },
        (reason) => {
          clearTimeout(timer);
          reject(reason);
        }
      );
  });
}

// 版本二：包装一个已存在的 Promise（用 race）
function raceTimeout(promise, ms, message) {
  let timer;
  const timeoutP = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(message ?? ms)), ms);
  });
  return Promise.race([promise, timeoutP]).finally(() => clearTimeout(timer));
}

// ===== 测试 =====

// 模拟异步任务：delay 后返回 data
function fetchMock(delay, data) {
  return () =>
    new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

(async () => {
  // 1. 任务在超时前完成
  try {
    const r1 = await withTimeout(fetchMock(50, "ok"), 100);
    console.log("case1 ok:", r1); // case1 ok: ok
  } catch (e) {
    console.log("case1 fail:", e.message);
  }

  // 2. 任务超时
  try {
    await withTimeout(fetchMock(200, "slow"), 80);
    console.log("case2 should not succeed");
  } catch (e) {
    console.log("case2 timeout:", e.name, "-", e.message);
    // case2 timeout: TimeoutError - Promise timed out after 80ms
  }

  // 3. 任务自身抛错（非超时）
  try {
    await withTimeout(
      () => new Promise((_, rej) => setTimeout(() => rej(new Error("net err")), 20)),
      100
    );
  } catch (e) {
    console.log("case3 err:", e.message); // case3 err: net err
  }

  // 4. raceTimeout 包装已有 Promise
  try {
    await raceTimeout(
      new Promise((r) => setTimeout(() => r("done"), 30)),
      10
    );
    console.log("case4 should not reach");
  } catch (e) {
    console.log("case4 timeout:", e.name); // case4 timeout: TimeoutError
  }
})();
