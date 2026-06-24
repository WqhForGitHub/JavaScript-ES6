/**
 * 手写带立即执行选项的防抖
 *
 * 作用：
 *   - 在防抖基础上增加 immediate 选项：
 *       - immediate=true：触发后立即执行一次，之后在等待期内不再执行
 *       - immediate=false（默认）：与普通防抖一致，等待期结束后执行
 *   - 典型场景：按钮点击立即响应但防连点（immediate=true）
 *
 * 实现思路：
 *   1. immediate=true 时：首次触发立即执行，之后定时器内不再执行，
 *      直到等待期结束才"解锁"，允许下次立即执行
 *   2. immediate=false 时：标准防抖逻辑
 */

function debounce(fn, interval = 300, immediate = false) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;

    if (timer) clearTimeout(timer);

    if (immediate) {
      // 立即执行模式：定时器未在跑时才立即执行
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null; // 解锁，允许下次立即执行
      }, interval);
      if (callNow) {
        return fn.apply(lastThis, lastArgs);
      }
    } else {
      // 非立即执行：延迟执行
      timer = setTimeout(() => {
        timer = null;
        return fn.apply(lastThis, lastArgs);
      }, interval);
    }
  };

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

// 立即执行模式
console.log("=== 立即执行模式 ===");
let immCalls = [];
const immLog = debounce(
  (v) => {
    immCalls.push(v);
    console.log(`  执行: ${v}`);
  },
  100,
  true
);

immLog(1); // 立即执行
immLog(2); // 等待期内，不执行
immLog(3); // 等待期内，不执行
console.log("同步阶段执行次数:", immCalls.length); // 1
console.log("执行值:", immCalls[0]); // 1

setTimeout(() => {
  console.log("等待后执行次数:", immCalls.length); // 1（仍是首次）
  // 解锁后再次触发会立即执行
  immLog(4); // 立即执行
  console.log("解锁后执行次数:", immCalls.length); // 2
}, 120);

// 非立即执行模式对比
setTimeout(() => {
  console.log("=== 非立即执行模式 ===");
  let lateCalls = [];
  const lateLog = debounce(
    (v) => {
      lateCalls.push(v);
      console.log(`  执行: ${v}`);
    },
    100,
    false
  );
  lateLog(1);
  lateLog(2);
  lateLog(3);
  console.log("同步阶段执行次数:", lateCalls.length); // 0
  setTimeout(() => {
    console.log("等待后执行次数:", lateCalls.length); // 1
    console.log("执行值:", lateCalls[0]); // 3（最后一次）
  }, 120);
}, 300);

// 应用：按钮防连点（立即响应）
setTimeout(() => {
  console.log("=== 按钮防连点 ===");
  let clicks = 0;
  const onClick = debounce(
    () => {
      clicks++;
      console.log(`  按钮响应 #${clicks}`);
    },
    500,
    true
  );
  // 模拟用户快速连点 5 次
  onClick();
  onClick();
  onClick();
  onClick();
  onClick();
  console.log("连点后响应次数:", clicks); // 1（只响应第一次）
}, 500);

// cancel 测试
setTimeout(() => {
  console.log("=== cancel 测试 ===");
  let c = 0;
  const d = debounce(() => c++, 100, true);
  d(); // 立即执行 → c=1
  d(); // 被防抖
  d.cancel();
  d(); // 解锁，立即执行 → c=2
  console.log("响应次数:", c); // 2
}, 1100);
