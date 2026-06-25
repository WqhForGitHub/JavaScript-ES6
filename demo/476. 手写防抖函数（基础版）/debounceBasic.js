/**
 * 手写防抖函数（基础版）
 *
 * 功能：在事件高频触发时，只在停止触发 wait 毫秒后才执行一次目标函数
 * 实现思路：
 *   1. 维护一个定时器引用 timer
 *   2. 每次调用返回的包装函数时，清除上一次的定时器，重新设定新的定时器
 *   3. 定时器到达 wait 后才真正执行 fn，从而保证只在最后一次触发后执行一次
 *   4. 保留 this 与参数，使用 apply 调用原函数
 */

/**
 * 基础版防抖函数
 * @param {Function} fn 目标函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, wait) {
  if (typeof fn !== "function") throw new TypeError("fn must be a function");
  wait = Number(wait) || 0;

  let timer = null;

  return function (...args) {
    const context = this;
    // 清除上一次定时器，重新计时
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      fn.apply(context, args);
    }, wait);
  };
}

// ===== 测试用例 =====
console.log("=== 防抖函数（基础版） ===");

// 1. 同步演示：连续触发只在最后一次后执行一次
let callCount = 0;
const debounced = debounce(function (val) {
  callCount++;
  console.log("执行，参数：", val, "，第", callCount, "次");
}, 100);

// 模拟连续触发（同步快速调用）
debounced("a");
debounced("b");
debounced("c");
// 期望输出：100ms 后只打印一次「执行，参数：c ，第 1 次」

// 2. 等待结束后再次触发会再次执行
setTimeout(() => {
  console.log("--- 100ms 后 callCount =", callCount); // 期望: 1
  debounced("d");
}, 150);
// 期望输出：250ms 后打印「执行，参数：d ，第 2 次」

// 3. 验证 this 与参数传递
const obj = {
  name: "obj",
  greet: debounce(function (greeting) {
    console.log(greeting + ", I am " + this.name);
  }, 50),
};
setTimeout(() => obj.greet("Hi"), 200);
// 期望输出: Hi, I am obj

// 4. 最终状态检查
setTimeout(() => {
  console.log("--- 最终 callCount =", callCount); // 期望: 2
  console.log("测试结束");
}, 400);
