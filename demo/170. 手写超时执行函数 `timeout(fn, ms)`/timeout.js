/**
 * 手写超时执行函数 timeout(fn, ms)
 *
 * 作用：
 *   - 限制函数执行时间，超时则抛错 / 返回超时结果
 *   - 若函数在 ms 内完成则正常返回结果
 *   - 典型场景：请求超时控制、防止卡死
 *
 * 实现思路：
 *   1. 用 Promise.race 让 fn 与一个超时 Promise 竞争
 *   2. 超时 Promise 在 ms 后 reject（或 resolve 默认值）
 *   3. 注意：fn 若是同步阻塞函数无法真正中断，本方案适合异步函数
 */

function timeout(fn, ms, message = "Timeout") {
  return function (...args) {
    let id;
    const task = Promise.resolve().then(() => fn(...args));
    const timer = new Promise((_, reject) => {
      id = setTimeout(() => reject(new Error(message)), ms);
    });
    // 任务完成后清除定时器避免泄漏；用 then 的双回调而非 finally，
    // 这样产生的派生 Promise 是 fulfilled，不会因 task 拒绝而变成 unhandledRejection
    task.then(
      () => clearTimeout(id),
      () => clearTimeout(id),
    );
    return Promise.race([task, timer]);
  };
}

// 返回默认值版（不抛错）
function timeoutWithDefault(fn, ms, defaultValue) {
  return function (...args) {
    const task = Promise.resolve().then(() => fn(...args));
    const timer = new Promise((resolve) => {
      setTimeout(() => resolve(defaultValue), ms);
    });
    // 若 timer 先胜出而 task 随后拒绝，吞掉该拒绝避免 unhandledRejection
    task.catch(() => {});
    return Promise.race([task, timer]);
  };
}

// 可中断版：返回带 cancel 的方法
function timeoutCancelable(fn, ms) {
  let timerId = null;
  const promise = new Promise((resolve, reject) => {
    timerId = setTimeout(() => reject(new Error("Timeout")), ms);
    Promise.resolve()
      .then(() => fn())
      .then(
        (v) => {
          clearTimeout(timerId);
          resolve(v);
        },
        (e) => {
          clearTimeout(timerId);
          reject(e);
        },
      );
  });
  promise.cancel = () => {
    if (timerId) clearTimeout(timerId);
  };
  return promise;
}

// ===== 测试 =====

// 正常完成（未超时）
(async () => {
  const fast = timeout(() => Promise.resolve("done"), 200);
  console.log("未超时:", await fast()); // 'done'
})();

// 超时抛错
(async () => {
  const slow = timeout(
    () => new Promise((r) => setTimeout(() => r("late"), 300)),
    100,
  );
  try {
    await slow();
  } catch (e) {
    console.log("超时错误:", e.message); // 'Timeout'
  }
})();

// 自定义超时消息
(async () => {
  const slow = timeout(
    () => new Promise((r) => setTimeout(r, 200)),
    50,
    "请求超时",
  );
  try {
    await slow();
  } catch (e) {
    console.log("自定义消息:", e.message); // '请求超时'
  }
})();

// 带默认值版
(async () => {
  const slow = timeoutWithDefault(
    () => new Promise((r) => setTimeout(() => r("real"), 200)),
    100,
    "default",
  );
  console.log("超时默认值:", await slow()); // 'default'
})();

// 正常返回默认值版
(async () => {
  const fast = timeoutWithDefault(
    () => Promise.resolve("real"),
    100,
    "default",
  );
  console.log("正常返回:", await fast()); // 'real'
})();

// 应用：请求超时控制
async function fetchWithTimeout(url, ms) {
  return timeout(() => Promise.resolve(`response from ${url}`), ms)();
}
(async () => {
  console.log("=== 请求超时控制 ===");
  console.log(await fetchWithTimeout("/api", 100)); // 'response from /api'
  try {
    await fetchWithTimeout("/slow", 50);
  } catch (e) {
    console.log("请求超时:", e.message); // 'Timeout'
  }
})();

// fn 抛错时正常传递
(async () => {
  const mayThrow = timeout(() => Promise.reject(new Error("fn error")), 200);
  try {
    await mayThrow();
  } catch (e) {
    console.log("fn 自身错误:", e.message); // 'fn error'
  }
})();
