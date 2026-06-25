/**
 * 手写 Promise 延迟函数 sleep
 *
 * 需求：实现一个 sleep(ms) 函数，返回一个 Promise，在 ms 毫秒后 resolve，
 *      配合 async/await 可以「暂停」执行。
 *
 * 进阶：
 *   - sleep(ms, value)：延迟后 resolve 一个值
 *   - sleep 可被中断（AbortSignal）
 *   - sleep 失败版：delay 后 reject（用于测试超时分支）
 *
 * 基础实现极简：new Promise(r => setTimeout(r, ms))
 * 这里给出几个常用变体。
 */

// 基础版：延迟 ms 后 resolve（不传值）
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 带值版：延迟后 resolve(value)
function sleepValue(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// 可中断版：传入 AbortSignal，abort 时立即 reject
function sleepCancelable(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      return reject(new Error("aborted before start"));
    }
    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    };
    if (signal) signal.addEventListener("abort", onAbort);
  });
}

// 延迟后 reject（测试超时用）
function sleepReject(ms, reason = "timeout") {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(reason)), ms),
  );
}

// ===== 测试 =====

(async () => {
  // 1. 基础用法
  const t0 = Date.now();
  await sleep(50);
  console.log("basic slept:", Date.now() - t0, "ms (≈50)"); // ≈50

  // 2. 带值
  const v = await sleepValue(30, "hello");
  console.log("with value:", v); // with value: hello

  // 3. 串行多个 sleep
  const t1 = Date.now();
  await sleep(30);
  await sleep(30);
  console.log("serial slept:", Date.now() - t1, "ms (≈60)"); // ≈60

  // 4. 并行 sleep（Promise.all）
  const t2 = Date.now();
  await Promise.all([sleep(40), sleep(40), sleep(40)]);
  console.log("parallel slept:", Date.now() - t2, "ms (≈40)"); // ≈40

  // 5. 可中断：sleep 100ms，50ms 后 abort
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 30);
  try {
    await sleepCancelable(100, ctrl.signal);
    console.log("should not reach");
  } catch (e) {
    console.log("canceled:", e.message); // canceled: aborted
  }

  // 6. 延迟 reject
  try {
    await sleepReject(20, "boom");
  } catch (e) {
    console.log("rejected:", e.message); // rejected: boom
  }
})();
