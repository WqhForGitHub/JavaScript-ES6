/**
 * 手写 Promise.prototype.finally
 *
 * 行为：
 *   - 无论 Promise 是 fulfilled 还是 rejected，onFinally 都会执行
 *   - onFinally 不接收任何参数（拿不到 value/reason）
 *   - finally 返回的新 Promise，默认沿用原 Promise 的最终状态与值/原因
 *       即「透传」原 Promise 的结果
 *   - 但若 onFinally 自身 rejected 或返回 rejected Promise，则会用该原因覆盖
 *   - onFinally 返回 fulfilled Promise 不会改变透传的值（值会被忽略）
 *
 * 实现关键：用 then 的两个分支，统一调用 Promise.resolve(onFinally())，
 * 然后在此基础上「接续」原来的 value / throw 原来的 reason。
 */

function myFinally(onFinally) {
  return this.then(
    // 成功分支：先执行 onFinally，再透传原 value
    (value) => Promise.resolve(onFinally()).then(() => value),
    // 失败分支：先执行 onFinally，再透传原 reason（继续抛出）
    (reason) =>
      Promise.resolve(onFinally()).then(() => {
        throw reason;
      })
  );
}

// 挂到原型上方便测试（注意这里不污染全局 Promise，只演示函数本身）
function attachFinally(P) {
  P.prototype.myFinally = myFinally;
}

// ===== 测试 =====

(async () => {
  // 用一个本地类做隔离测试：直接给原生 Promise 实例调用 myFinally
  // （通过 Function.prototype.call 方式调用，不污染全局原型）

  // 1. 成功时执行 finally 并透传 value
  const r1 = await myFinally.call(
    Promise.resolve("data"),
    () => console.log("finally-1 runs")
  );
  // finally-1 runs
  console.log("after finally-1:", r1); // after finally-1: data

  // 2. 失败时执行 finally 并透传 reason
  try {
    await myFinally.call(
      Promise.reject("err"),
      () => console.log("finally-2 runs")
    );
  } catch (e) {
    // finally-2 runs
    console.log("after finally-2:", e); // after finally-2: err
  }

  // 3. onFinally 返回 fulfilled Promise，值被忽略，仍透传原 value
  const r3 = await myFinally.call(Promise.resolve(1), () =>
    Promise.resolve("ignored")
  );
  console.log("finally-3 value:", r3); // finally-3 value: 1

  // 4. onFinally 自身抛错，会覆盖原状态（无论原是成功还是失败）
  try {
    await myFinally.call(Promise.resolve("ok"), () => {
      throw new Error("finally throws");
    });
  } catch (e) {
    console.log("finally-4 throws:", e.message); // finally-4 throws: finally throws
  }

  // 5. onFinally 返回 rejected Promise，覆盖原状态
  try {
    await myFinally.call(Promise.reject("orig"), () =>
      Promise.reject("from finally")
    );
  } catch (e) {
    console.log("finally-5 reject:", e); // finally-5 reject: from finally
  }
})();
