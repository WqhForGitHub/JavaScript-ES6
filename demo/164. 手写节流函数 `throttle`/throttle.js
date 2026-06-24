/**
 * 手写节流函数 throttle
 *
 * 作用：
 *   - 在连续触发的高频事件中，限制函数以固定频率执行（如每 N 毫秒最多一次）
 *   - 典型场景：滚动、拖拽、resize、鼠标移动
 *   - 与防抖区别：防抖只在停止后才执行；节流在过程中按固定间隔执行
 *
 * 实现思路（时间戳版本 + 定时器版本结合）：
 *   1. 用上一次执行时间戳判断是否达到间隔
 *   2. 首次触发立即执行（时间戳版特性）
 *   3. 最后一次触发后还能再执行一次（定时器版特性，避免尾调用丢失）
 */

function throttle(fn, interval = 300) {
  let lastTime = 0; // 上次执行时间
  let timer = null; // 尾部定时器
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    lastArgs = args;
    lastThis = this;

    // 已超过间隔，可立即执行
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timer) {
      // 还没到间隔，安排尾部执行，保证最后一次触发也能执行
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };
}

// 时间戳版（首次立即执行，但最后一次可能丢失）
function throttleTimestamp(fn, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 定时器版（首次不立即执行，但最后一次会执行）
function throttleTimer(fn, interval = 300) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, args);
      }, interval);
    }
  };
}

// ===== 测试 =====

// 模拟高频调用
let calls = [];
const log = throttle((v) => {
  calls.push(v);
  console.log(`  执行: ${v} @ ${Date.now()}`);
}, 100);

console.log("=== 节流测试（间隔 100ms）===");
const start = Date.now();
const values = [];
for (let i = 0; i < 10; i++) {
  values.push(i);
  log(i);
}
// 同步循环里多次调用，由于间隔未到，只会执行第一次
console.log("同步阶段执行次数:", calls.length); // 1（首次立即执行）

// 时间戳版：首次立即执行
let tsCalls = 0;
const tsFn = throttleTimestamp(() => tsCalls++, 50);
tsFn();
tsFn();
tsFn();
console.log("时间戳版首次执行:", tsCalls); // 1

// 定时器版：首次不立即执行
let tCalls = 0;
const tFn = throttleTimer(() => tCalls++, 50);
tFn();
tFn();
console.log("定时器版首次未执行:", tCalls); // 0
setTimeout(() => {
  console.log("定时器版延迟后执行:", tCalls); // 1
}, 60);

// 实际应用：滚动处理
const scrollHandler = throttle((scrollTop) => {
  console.log(`  处理滚动: ${scrollTop}`);
}, 100);
// 模拟快速连续滚动
scrollHandler(0);
scrollHandler(50);
scrollHandler(100);

// 测试间隔后的执行
setTimeout(() => {
  console.log("=== 100ms 后再次触发 ===");
  log(99);
  console.log("总执行次数:", calls.length);
}, 110);
