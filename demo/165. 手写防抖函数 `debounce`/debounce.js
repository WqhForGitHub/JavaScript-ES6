/**
 * 手写防抖函数 debounce
 *
 * 作用：
 *   - 在连续触发的高频事件中，只在停止触发 N 毫秒后才执行一次
 *   - 若在等待期内再次触发，则重新计时
 *   - 典型场景：搜索框输入、按钮防连点、窗口 resize
 *   - 与节流区别：节流固定间隔执行；防抖只在"安静"后执行
 *
 * 实现思路：
 *   1. 每次调用清除上一次的定时器
 *   2. 重新设置定时器，延迟 interval 后执行
 *   3. 返回值用 Promise 或保留最后一次结果（此处用回调记录）
 */

function debounce(fn, interval = 300) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let lastResult;

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;

    // 清除上一次定时器，重新计时
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      lastResult = fn.apply(lastThis, lastArgs);
    }, interval);

    return lastResult; // 注意：异步执行，此处返回的是上一次结果
  };

  // 提供立即执行的方法（见 166 题）
  debounced.flush = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      lastResult = fn.apply(lastThis, lastArgs);
    }
    return lastResult;
  };

  // 提供取消方法
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  return debounced;
}

// ===== 测试 =====

// 基本防抖：连续调用只在最后执行一次
let calls = [];
const log = debounce((v) => {
  calls.push(v);
  console.log(`  执行: ${v}`);
}, 100);

console.log("=== 防抖测试（等待 100ms）===");
log(1);
log(2);
log(3);
// 同步阶段不执行（在等待）
console.log("同步阶段执行次数:", calls.length); // 0

// 100ms 后只执行最后一次
setTimeout(() => {
  console.log("延迟后执行次数:", calls.length); // 1
  console.log("执行的是最后值:", calls[0]); // 3
}, 120);

// 中途再次触发会重置计时
setTimeout(() => {
  console.log("=== 中途追加触发重置计时 ===");
  calls = [];
  log("a");
  setTimeout(() => log("b"), 50); // 50ms 后再触发，重置
  setTimeout(() => {
    console.log("80ms 时执行次数:", calls.length); // 0（被 b 重置）
  }, 80);
  setTimeout(() => {
    console.log("220ms 时执行次数:", calls.length); // 1（b 之后 100ms 已触发）
    console.log("执行值:", calls[0]); // 'b'
  }, 220);
}, 300);

// 应用：搜索框输入
const search = debounce((keyword) => {
  console.log(`  发起搜索: ${keyword}`);
}, 200);
console.log("=== 模拟搜索输入 ===");
search("j");
search("ja");
search("jav");
search("java"); // 只发这一个请求

// flush 立即执行
setTimeout(() => {
  console.log("=== flush 测试 ===");
  let flushed = [];
  const d = debounce((x) => {
    flushed.push(x);
    return x * 10;
  }, 1000);
  d(5);
  console.log("flush 前:", flushed.length); // 0
  d.flush();
  console.log("flush 后:", flushed.length); // 1
}, 600);

// cancel 取消
setTimeout(() => {
  console.log("=== cancel 测试 ===");
  let cc = 0;
  const d2 = debounce(() => cc++, 100);
  d2();
  d2.cancel();
  setTimeout(() => {
    console.log("cancel 后执行次数:", cc); // 0
  }, 120);
}, 1700);
