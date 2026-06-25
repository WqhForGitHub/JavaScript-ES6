/**
 * 手写限制异步函数执行时间
 *
 * 需求：限制一个异步函数（返回 Promise）的「完成时间」——
 *      若在 timeout 时间内未完成，则视为失败（reject 超时错误）。
 *
 * 与 199（promiseTimeout）的区别：199 是给一个 Promise 加超时；
 *      本题强调「限制一个函数的执行时间」，所以入参是函数 + 超时，
 *      并支持「保留最近一次有效结果」「清理定时器」等增强。
 *
 * 实现：用 Promise.race 竞争「任务 Promise」与「超时 Promise」，
 *      任务先完成则清除超时定时器并返回结果；超时则 reject。
 *
 * 增强版 limitAsyncTime(fn, timeout, options):
 *   - options.errorMessage：自定义超时错误信息
 *   - options.fallback：超时时的兜底返回值（不 reject，而是 resolve 兜底值）
 */

class TimeoutError extends Error {
  constructor(ms) {
    // 兼容传入数字（ms）或自定义字符串消息
    super(typeof ms === "number" ? `Execution timed out after ${ms}ms` : ms);
    this.name = "TimeoutError";
  }
}

function limitAsyncTime(fn, timeout, options = {}) {
  const { errorMessage, fallback } = options;
  return async function (...args) {
    let timer;
    const timeoutP = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        if (fallback !== undefined) resolve(fallback);
        else reject(new TimeoutError(errorMessage ?? timeout));
      }, timeout);
    });

    try {
      // race：任务与超时竞争
      const result = await Promise.race([
        Promise.resolve().then(() => fn.apply(this, args)),
        timeoutP,
      ]);
      return result;
    } finally {
      clearTimeout(timer); // 无论谁赢，都清掉定时器
    }
  };
}

// 变体：返回 [err, data] 元组形式（不抛错）
function limitAsyncTimeSafe(fn, timeout, options = {}) {
  const limited = limitAsyncTime(fn, timeout, options);
  return async function (...args) {
    try {
      const data = await limited.apply(this, args);
      return [null, data];
    } catch (err) {
      return [err, undefined];
    }
  };
}

// ===== 测试 =====

function delay(value, ms, fail = false) {
  return () =>
    new Promise((resolve, reject) =>
      setTimeout(
        () => (fail ? reject(new Error(value + " fail")) : resolve(value)),
        ms,
      ),
    );
}

(async () => {
  // 1. 任务在时限内完成
  const fast = limitAsyncTime(delay("fast", 30), 100);
  console.log("case1:", await fast()); // case1: fast

  // 2. 任务超时 -> reject TimeoutError
  const slow = limitAsyncTime(delay("slow", 200), 50);
  try {
    await slow();
    console.log("case2 should not reach");
  } catch (e) {
    console.log("case2:", e.name, "-", e.message); // case2: TimeoutError - Execution timed out after 50ms
  }

  // 3. 自定义超时信息
  const custom = limitAsyncTime(delay("x", 200), 50, {
    errorMessage: "接口调用超时",
  });
  try {
    await custom();
  } catch (e) {
    console.log("case3:", e.message); // case3: 接口调用超时
  }

  // 4. 超时兜底值（不 reject，返回 fallback）
  const withFallback = limitAsyncTime(delay("slow", 200), 50, {
    fallback: "default-data",
  });
  console.log("case4:", await withFallback()); // case4: default-data

  // 5. 任务自身失败（非超时）-> 透传原错误
  const failing = limitAsyncTime(delay("bad", 20, true), 100);
  try {
    await failing();
  } catch (e) {
    console.log("case5:", e.message); // case5: bad fail
  }

  // 6. safe 元组版
  const safe = limitAsyncTimeSafe(delay("slow", 100), 30);
  const [err, data] = await safe();
  console.log("case6:", err && err.name, data); // case6: TimeoutError undefined

  // 7. 透传参数
  const echo = limitAsyncTime((x) => Promise.resolve(x * 2), 100);
  console.log("case7:", await echo(21)); // case7: 42
})();
