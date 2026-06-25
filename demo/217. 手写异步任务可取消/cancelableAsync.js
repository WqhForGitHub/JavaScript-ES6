/**
 * 手写异步任务可取消
 *
 * 需求：让一个进行中的异步任务「可取消」——取消后：
 *   - 调用方得到一个 CancelError
 *   - 底层尽量停止后续无效操作（如清除定时器、abort 请求）
 *   - 已 settle 的任务无法再取消
 *
 * 这里提供两种典型实现：
 *   1. makeCancelable(promise)：用 race + 暴露 cancel，经典实现（来自 TC39 提案）
 *   2. CancelToken：基于「取消令牌」模式，任务内部可感知取消并清理资源
 *
 * 注意：JS 的 Promise 本身不可取消，所谓「取消」是「不再关心结果」+「清理副作用」。
 */

class CancelError extends Error {
  constructor(reason = "cancelled") {
    super(typeof reason === "string" ? reason : "cancelled");
    this.name = "CancelError";
    this.reason = reason;
  }
}

// 方案一：makeCancelable —— race 一个可控的 reject
function makeCancelable(promise) {
  let hasCanceled = false;
  let settled = false; // 底层 promise 是否已落定
  let cancelFn;

  const wrapped = new Promise((resolve, reject) => {
    cancelFn = (reason) => {
      if (hasCanceled || settled) return; // 已取消或已落定则无效
      hasCanceled = true;
      reject(new CancelError(reason));
    };
    promise.then(
      (val) => {
        settled = true;
        if (!hasCanceled) resolve(val);
      },
      (err) => {
        settled = true;
        if (!hasCanceled) reject(err);
      },
    );
  });

  return {
    promise: wrapped,
    cancel: cancelFn,
    isCanceled: () => hasCanceled,
  };
}

// 方案二：CancelToken —— 任务内部可注册清理、感知取消
class CancelToken {
  constructor() {
    this._canceled = false;
    this._reason = undefined;
    this._listeners = [];
  }

  cancel(reason) {
    if (this._canceled) return;
    this._canceled = true;
    this._reason = reason ?? new CancelError();
    const err = reason instanceof Error ? reason : new CancelError(reason);
    this._listeners.forEach((fn) => {
      try {
        fn(err);
      } catch (_) {}
    });
    this._listeners = [];
  }

  get canceled() {
    return this._canceled;
  }

  // 注册「取消时执行的清理回调」，返回取消注册的函数
  onCancel(fn) {
    if (this._canceled) {
      fn(new CancelError(this._reason));
      return () => {};
    }
    this._listeners.push(fn);
    return () => {
      const i = this._listeners.indexOf(fn);
      if (i !== -1) this._listeners.splice(i, 1);
    };
  }

  // 抛出可被 await 的取消信号：被取消时 throw
  throwIfCanceled() {
    if (this._canceled) {
      throw this._reason instanceof Error
        ? this._reason
        : new CancelError(this._reason);
    }
  }
}

// 一个支持取消令牌的可取消任务示例
function runCancelableTask(token) {
  return new Promise((resolve, reject) => {
    // 关键：注册清理回调，取消时清除定时器并 reject
    const timer = setTimeout(() => {
      resolve("completed normally");
    }, 100);

    token.onCancel((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// ===== 测试 =====

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 方案一：makeCancelable
  console.log("== makeCancelable ==");
  const c1 = makeCancelable(sleep(80).then(() => "result"));
  setTimeout(() => c1.cancel("user abort"), 30);
  try {
    await c1.promise;
  } catch (e) {
    console.log("c1 cancelled:", e.name, "-", e.message); // c1 cancelled: CancelError - user abort
  }

  // 方案一：未取消正常完成
  const c2 = makeCancelable(sleep(20).then(() => "ok"));
  console.log("c2 result:", await c2.promise); // c2 result: ok
  c2.cancel(); // 已 settle，取消无效
  console.log("c2 canceled flag:", c2.isCanceled()); // c2 canceled flag: false

  // 方案二：CancelToken
  console.log("\n== CancelToken ==");
  const token = new CancelToken();
  const task = runCancelableTask(token);
  setTimeout(() => token.cancel("abort task"), 30);
  try {
    await task;
  } catch (e) {
    console.log("task cancelled:", e.name, "-", e.message); // task cancelled: CancelError - abort task
  }

  // 方案二：正常完成（不取消），定时器正常 resolve
  const token2 = new CancelToken();
  const ok = await runCancelableTask(token2);
  console.log("task ok:", ok); // task ok: completed normally

  // 方案二：throwIfCanceled 用法（在循环里主动检查）
  const token3 = new CancelToken();
  setTimeout(() => token3.cancel(), 25);
  let step = 0;
  try {
    for (let i = 0; i < 10; i++) {
      token3.throwIfCanceled(); // 取消则抛出
      step++;
      await sleep(10);
    }
  } catch (e) {
    console.log("loop cancelled at step", step, ":", e.message);
    // loop cancelled at step 3 : cancelled
  }
})();
