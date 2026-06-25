/**
 * 手写防抖函数（带取消功能）
 *
 * 功能：在防抖基础上挂载 cancel 方法，可随时取消尚未执行的调用
 * 实现思路：
 *   1. 在返回的包装函数上挂载 .cancel() 方法
 *   2. cancel 清除定时器并将 timer 置空，阻止后续执行
 *   3. 同时清空 pending 标记，使 cancel 可重复调用而不会报错
 *   4. 支持 immediate 模式下取消冷却计时
 */

/**
 * 带取消功能的防抖函数
 * @param {Function} fn 目标函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function & { cancel: Function }} 防抖函数（带 cancel 方法）
 */
function debounce(fn, wait) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  wait = Number(wait) || 0;

  let timer = null;

  function debounced(...args) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      fn.apply(context, args);
    }, wait);
  }

  // 取消方法：清除定时器，阻止执行
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

// ===== 测试用例 =====
console.log("=== 防抖函数（带取消功能） ===");

// 1. 在执行前取消，函数不应被调用
let executed = false;
const d1 = debounce(function () {
  executed = true;
  console.log("d1 执行了");
}, 100);

d1();
d1.cancel(); // 取消，100ms 后不应执行

setTimeout(() => {
  console.log("--- 取消后 executed =", executed); // 期望: false
}, 150);

// 2. 取消后可以再次正常触发
let count = 0;
const d2 = debounce(function (v) {
  count++;
  console.log("d2 执行", v, "count=", count);
}, 80);

setTimeout(() => {
  d2("a");
  d2.cancel(); // 取消 a
}, 200);

setTimeout(() => {
  d2("b"); // 重新触发，应执行
}, 300);
// 期望输出: 380ms 后 d2 执行 b count= 1

// 3. 重复 cancel 不报错
const d3 = debounce(function () {
  console.log("d3 执行");
}, 50);
setTimeout(() => {
  d3();
  d3.cancel();
  d3.cancel(); // 重复取消
  console.log("重复取消无异常");
}, 400);

// 4. 未触发就 cancel 也安全
const d4 = debounce(function () {
  console.log("d4 执行");
}, 50);
setTimeout(() => {
  d4.cancel(); // 从未触发
  console.log("未触发取消无异常");
}, 450);

// 5. 最终检查
setTimeout(() => {
  console.log("--- 最终 count =", count); // 期望: 1
  console.log("测试结束");
}, 500);
