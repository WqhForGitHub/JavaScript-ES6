/**
 * 手写 Promise 链式调用的中断
 *
 * 背景：Promise 一旦开始执行就无法真正「取消」底层操作，但我们可以「中断
 *      链式调用」——让后续的 then/catch 不再执行，相当于跳出整条链。
 *
 * 常见三种方案：
 *   方案一：抛出一个「特殊的中断信号」错误，用专门的 catch 识别并吞掉，
 *           普通错误继续抛出。
 *   方案二：reject + 一个「已中断」标志，链尾统一处理。
 *   方案三：用 Promise.race 与一个「取消 Promise」竞争，取消时直接走 reject 分支。
 *
 * 本文件实现方案一（最常用、最贴近「链中断」语义），
 * 并附带方案三（race 取消）。
 */

// 方案一：中断信号 + 专属 catch
class BreakChainError extends Error {
  constructor(reason = "chain broken") {
    super(reason);
    this.name = "BreakChainError";
    this.isBreakChain = true;
  }
}

// 工具：根据条件决定是否中断
function breakIf(condition, reason) {
  if (condition) throw new BreakChainError(reason);
}

// 链尾兜底 catch：识别中断信号并吞掉，其它错误继续抛
function chainCatch(handler) {
  return (err) => {
    if (err && err.isBreakChain) {
      console.log("  [chain] interrupted:", err.message);
      return; // 吞掉中断，链结束
    }
    if (typeof handler === "function") return handler(err);
    throw err;
  };
}

// 方案三：race 取消器
function makeCancellable(promise) {
  let cancelFn;
  const cancelPromise = new Promise((_, reject) => {
    cancelFn = () => reject(new BreakChainError("cancelled by race"));
  });
  return {
    promise: Promise.race([promise, cancelPromise]),
    cancel: cancelFn,
  };
}

// ===== 测试 =====

// 工具
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 方案一演示：模拟一个多步流程，满足条件时中断后续步骤
async function pipeline(input) {
  return Promise.resolve(input)
    .then(async (v) => {
      console.log("step1:", v);
      await sleep(20);
      breakIf(v <= 0, "input non-positive, abort pipeline"); // v<=0 则中断
      return v + 1;
    })
    .then(async (v) => {
      console.log("step2:", v);
      await sleep(20);
      breakIf(v > 10, "value too large, abort"); // v>10 则中断
      return v * 2;
    })
    .then((v) => {
      console.log("step3:", v);
      return v;
    })
    .catch(
      chainCatch((err) => {
        console.log("  [pipeline] real error:", err.message);
      }),
    );
}

(async () => {
  console.log("== 正常走完 ==");
  const r1 = await pipeline(1);
  console.log("result1:", r1);
  // step1: 1 -> step2: 2 -> step3: 4 -> result1: 4

  console.log("\n== step1 中断（v<=0）==");
  const r2 = await pipeline(0);
  console.log("result2:", r2);
  // step1: 0 -> [chain] interrupted: ... -> result2: undefined（中断后无返回值）

  console.log("\n== step2 中断（v>10）==");
  const r3 = await pipeline(20);
  console.log("result3:", r3);
  // step1: 20 -> step2: 21 -> [chain] interrupted -> result3: undefined

  // 方案三：race 取消
  console.log("\n== race 取消 ==");
  const longTask = sleep(100).then(() => "done after 100ms");
  const { promise, cancel } = makeCancellable(longTask);
  setTimeout(() => cancel(), 30); // 30ms 后取消
  try {
    const r = await promise;
    console.log("race result:", r);
  } catch (e) {
    console.log("race cancelled:", e.message); // race cancelled: cancelled by race
  }
})();
