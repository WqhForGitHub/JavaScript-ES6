/**
 * 手写防抖函数（带返回值）
 *
 * 功能：防抖函数能返回最近一次执行的返回值，供调用方读取结果
 * 实现思路：
 *   1. 用闭包变量 lastResult 缓存最近一次真正执行后的返回值
 *   2. 包装函数被调用时，先返回上次缓存的结果（本次尚未真正执行）
 *   3. 定时器触发真正执行时，将 fn 的返回值存入 lastResult
 *   4. 由于防抖是异步执行，同步调用拿到的是上一次结果；
 *      若希望拿到本次结果，可在 fn 执行后通过回调/事件通知（本示例同时支持 resultCallback）
 */

/**
 * 带返回值的防抖函数
 * @param {Function} fn 目标函数
 * @param {number} wait 等待时间（毫秒）
 * @param {(result: *) => void} [onResult] 真正执行后的结果回调
 * @returns {Function & { getResult: Function, cancel: Function }} 防抖函数
 */
function debounce(fn, wait, onResult) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  wait = Number(wait) || 0;

  let timer = null;
  let lastResult = undefined;
  let pendingArgs = null;

  function debounced(...args) {
    const context = this;
    pendingArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      // 真正执行，缓存返回值
      lastResult = fn.apply(context, pendingArgs);
      pendingArgs = null;
      if (typeof onResult === "function") onResult(lastResult);
    }, wait);
    // 同步返回上次缓存的结果（本次尚未执行）
    return lastResult;
  }

  // 主动获取上次结果
  debounced.getResult = function () {
    return lastResult;
  };

  // 取消方法
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    pendingArgs = null;
  };

  return debounced;
}

// ===== 测试用例 =====
console.log("=== 防抖函数（带返回值） ===");

// 1. 同步调用返回上次结果（首次为 undefined）
const calc = debounce(
  function (x) {
    console.log("  [真正执行] 计算", x, "=>", x * 2);
    return x * 2;
  },
  100,
  function (result) {
    console.log("  [回调] 结果 =", result);
  },
);

console.log("第一次调用返回:", calc(5)); // 期望: undefined（尚未执行）
calc(6);
calc(7); // 7 将在 100ms 后执行

// 2. 等待执行后，getResult 可拿到结果
setTimeout(() => {
  console.log("getResult() =>", calc.getResult()); // 期望: 14
}, 150);

// 3. 再次调用，同步返回上次结果 14
setTimeout(() => {
  console.log("同步返回上次结果:", calc(10)); // 期望: 14（本次还没执行）
  console.log("getResult() 仍是:", calc.getResult()); // 期望: 14
}, 200);

// 4. 等待本次执行完毕
setTimeout(() => {
  console.log("最终 getResult() =>", calc.getResult()); // 期望: 20
  console.log("测试结束");
}, 400);
