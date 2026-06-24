/**
 * 手写带取消功能的防抖 / 节流
 *
 * 作用：
 *   - 在防抖 / 节流基础上提供 cancel 方法，可取消尚未执行的定时任务
 *   - 同时提供 flush 方法，立即执行当前挂起的任务
 *   - 典型场景：组件卸载时取消未执行的回调、用户主动中断
 *
 * 实现思路：
 *   1. 保存定时器引用与待执行参数
 *   2. cancel：清除定时器并重置状态
 *   3. flush：若有挂起任务，立即执行并清除定时器
 *   4. pending：返回是否有挂起任务（便于调试）
 */

// 带取消的防抖
function debounce(fn, interval = 300) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const a = lastArgs;
      const t = lastThis;
      lastArgs = null;
      lastThis = null;
      return fn.apply(t, a);
    }, interval);
  };

  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      const a = lastArgs;
      const t = lastThis;
      lastArgs = null;
      lastThis = null;
      return fn.apply(t, a);
    }
  };

  debounced.pending = function () {
    return timer !== null;
  };

  return debounced;
}

// 带取消的节流
function throttle(fn, interval = 300) {
  let lastTime = 0;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  const throttled = function (...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };

  throttled.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastTime = 0;
    lastArgs = null;
    lastThis = null;
  };

  throttled.flush = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      lastTime = Date.now();
      return fn.apply(lastThis, lastArgs);
    }
  };

  throttled.pending = function () {
    return timer !== null;
  };

  return throttled;
}

// ===== 测试 =====

console.log("=== 防抖 cancel 测试 ===");
let dCalls = 0;
const debounced = debounce(() => dCalls++, 100);
debounced();
console.log("pending:", debounced.pending()); // true
debounced.cancel();
console.log("cancel 后 pending:", debounced.pending()); // false
setTimeout(() => {
  console.log("防抖 cancel 后执行次数:", dCalls); // 0
}, 120);

console.log("=== 防抖 flush 测试 ===");
let dCalls2 = 0;
const debounced2 = debounce(() => ++dCalls2, 1000);
debounced2();
debounced2();
console.log("flush 前 pending:", debounced2.pending()); // true
console.log("flush 前 执行次数:", dCalls2); // 0
debounced2.flush();
console.log("flush 后 执行次数:", dCalls2); // 1
console.log("flush 后 pending:", debounced2.pending()); // false

console.log("=== 节流 cancel 测试 ===");
let tCalls = 0;
const throttled = throttle(() => tCalls++, 100);
throttled(); // 首次立即执行
console.log("节流首次执行:", tCalls); // 1
throttled(); // 进入尾部定时
console.log("pending:", throttled.pending()); // true
throttled.cancel();
setTimeout(() => {
  console.log("节流 cancel 后执行次数:", tCalls); // 1（尾部被取消）
}, 120);

console.log("=== 节流 flush 测试 ===");
let tCalls2 = 0;
const throttled2 = throttle(() => ++tCalls2, 1000);
throttled2(); // 立即执行 → 1
throttled2(); // 尾部挂起
console.log("flush 前执行次数:", tCalls2); // 1
throttled2.flush();
console.log("flush 后执行次数:", tCalls2); // 2
console.log("flush 后 pending:", throttled2.pending()); // false

// 应用：组件卸载时取消
console.log("=== 模拟组件卸载 ===");
let work = 0;
const handler = debounce(() => work++, 200);
handler();
handler();
handler();
// 假设组件卸载
handler.cancel();
setTimeout(() => {
  console.log("卸载后是否执行:", work); // 0
}, 250);
