/**
 * 手写防抖函数（带立即执行）
 *
 * 功能：在防抖基础上增加 immediate 选项，首次触发立即执行，之后 wait 内的触发被忽略
 * 实现思路：
 *   1. 当 immediate 为 true：第一次调用立即执行 fn，并开启定时器
 *   2. 在定时器未结束前再次触发不执行，只是重置计时；定时器结束后解锁，允许下次立即执行
 *   3. 当 immediate 为 false：退化为普通防抖（等待结束后执行）
 *   4. 保留 this 与参数
 */

/**
 * 带立即执行选项的防抖函数
 * @param {Function} fn 目标函数
 * @param {number} wait 等待时间（毫秒）
 * @param {boolean} [immediate=false] 是否立即执行
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, wait, immediate) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  wait = Number(wait) || 0;
  if (immediate === undefined) immediate = false;

  let timer = null;

  return function (...args) {
    const context = this;

    if (timer) clearTimeout(timer);

    if (immediate) {
      // 是否处于"等待冷却"中：timer 存在表示还未到冷却结束
      const callNow = !timer;
      // 开启冷却定时器，冷却结束后解锁
      timer = setTimeout(function () {
        timer = null;
      }, wait);
      // 首次（冷却外）立即执行
      if (callNow) fn.apply(context, args);
    } else {
      // 普通防抖：等待结束后执行最后一次
      timer = setTimeout(function () {
        timer = null;
        fn.apply(context, args);
      }, wait);
    }
  };
}

// ===== 测试用例 =====
console.log("=== 防抖函数（带立即执行） ===");

// 1. immediate=true：首次立即执行，后续冷却期内触发被忽略
let count1 = 0;
const d1 = debounce(
  function (v) {
    count1++;
    console.log("[immediate] 执行", v, "count=", count1);
  },
  100,
  true,
);

d1("first"); // 立即执行
d1("second"); // 被忽略
d1("third"); // 被忽略
// 期望输出: [immediate] 执行 first count= 1

setTimeout(() => {
  console.log("--- 冷却后 count1 =", count1); // 期望: 1
  d1("after-cooldown"); // 冷却结束，再次立即执行
}, 150);
// 期望输出: [immediate] 执行 after-cooldown count= 2

// 2. immediate=false：退化为普通防抖
let count2 = 0;
const d2 = debounce(
  function (v) {
    count2++;
    console.log("[normal] 执行", v, "count=", count2);
  },
  100,
  false,
);

setTimeout(() => {
  d2("x");
  d2("y");
  d2("z");
}, 200);
// 期望输出: 300ms 后 [normal] 执行 z count= 1

// 3. 最终检查
setTimeout(() => {
  console.log("--- 最终 count1 =", count1, "count2 =", count2); // 期望: 2 1
  console.log("测试结束");
}, 500);
