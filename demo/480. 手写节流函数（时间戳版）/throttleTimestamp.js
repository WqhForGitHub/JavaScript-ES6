/**
 * 手写节流函数（时间戳版）
 *
 * 功能：高频触发事件时，保证每隔 wait 毫秒最多执行一次目标函数
 * 实现思路（时间戳版）：
 *   1. 记录上次执行时间戳 previous
 *   2. 每次调用时取当前时间 now，若 now - previous >= wait，则立即执行
 *   3. 执行后更新 previous = now
 *   4. 特点：第一次触发会立即执行，之后每隔 wait 执行一次；
 *      但停止触发后不会再补执行最后一次（与定时器版的区别）
 *   5. 保留 this 与参数
 */

/**
 * 时间戳版节流函数
 * @param {Function} fn 目标函数
 * @param {number} wait 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(fn, wait) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  wait = Number(wait) || 0;

  let previous = 0; // 上次执行时间，初始 0 表示首次必定执行

  return function (...args) {
    const context = this;
    const now = Date.now();

    if (now - previous >= wait) {
      previous = now;
      fn.apply(context, args);
      return true; // 表示本次触发了执行
    }
    return false; // 表示本次被节流忽略
  };
}

// ===== 测试用例 =====
console.log("=== 节流函数（时间戳版） ===");

// 1. 首次触发立即执行
let count = 0;
const th = throttle(function (v) {
  count++;
  console.log("执行", v, "count=", count, "time=", Date.now());
}, 100);

console.log("首次触发:", th("a")); // 期望: true，并打印执行 a count= 1
console.log("立刻再次触发:", th("b")); // 期望: false（被节流，不执行）

// 2. 间隔 100ms 内多次触发只执行一次
let triggered = 0;
const t2 = throttle(function () {
  triggered++;
}, 100);

// 模拟高频触发：每 20ms 触发一次，共 10 次（200ms）
let times = 0;
const interval = setInterval(() => {
  t2();
  times++;
  if (times >= 10) {
    clearInterval(interval);
    // 在 200ms 内每隔 100ms 执行一次，约执行 2~3 次
    setTimeout(() => {
      console.log("--- 高频触发结束 triggered =", triggered); // 期望: 2 或 3
      console.log("测试结束");
    }, 150);
  }
}, 20);

// 3. 验证时间戳版特性：停止触发后不补执行最后一次
let last = 0;
const t3 = throttle(function () {
  last++;
}, 100);
setTimeout(() => {
  t3(); // 立即执行 last=1
  setTimeout(() => t3(), 50); // 被忽略
  setTimeout(() => t3(), 90); // 被忽略
  // 不再有触发，时间戳版不会补执行
  setTimeout(() => {
    console.log("--- 时间戳版 last =", last); // 期望: 1（停止后不补执行）
  }, 200);
}, 50);
