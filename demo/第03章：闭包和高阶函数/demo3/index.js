// ==============================
// 节流 (throttle)
// ==============================

console.log('=== 节流函数 ===');

// throttle: 确保函数在指定时间间隔内最多执行一次
const throttle = function (fn, interval) {
  const __self = fn; // 保存原函数
  let timer; // 定时器
  let firstTime = true; // 是否第一次调用

  return function () {
    const args = arguments;
    const __me = this;

    if (firstTime) {
      // 第一次调用，直接执行
      __self.apply(__me, args);
      firstTime = false;
      return;
    }

    if (timer) {
      // 如果定时器还存在，说明上一次延迟执行还没完成
      return;
    }

    timer = setTimeout(function () {
      clearTimeout(timer);
      timer = null;
      __self.apply(__me, args);
    }, interval || 500);
  };
};

// 模拟频繁触发 resize 事件
let count = 0;
const onResize = throttle(function () {
  count++;
  console.log('resize 处理，第', count, '次');
}, 200);

console.log('--- 模拟频繁调用 ---');
onResize(); // 第1次，立即执行
onResize(); // 被节流
onResize(); // 被节流
onResize(); // 被节流

// 模拟一段时间后的调用
setTimeout(function () {
  onResize(); // 间隔后可以执行
}, 300);

setTimeout(function () {
  onResize(); // 再次立即执行（firstTime 之后的首个延迟执行已完成）
  onResize(); // 被节流
}, 600);

// ==============================
// 防抖 (debounce)
// ==============================

console.log('\n=== 防抖函数 ===');

// debounce: 在事件触发 n 秒后才执行，如果 n 秒内再次触发则重新计时
const debounce = function (fn, delay) {
  let timer;

  return function () {
    const args = arguments;
    const __me = this;

    clearTimeout(timer); // 每次调用都清除之前的定时器

    timer = setTimeout(function () {
      fn.apply(__me, args);
    }, delay || 500);
  };
};

// 模拟输入框连续输入
let inputCount = 0;
const onInput = debounce(function () {
  inputCount++;
  console.log('搜索请求发送，第', inputCount, '次');
}, 300);

console.log('--- 模拟连续输入 ---');
onInput(); // 重新计时
onInput(); // 重新计时
onInput(); // 重新计时

// 300ms 后只会发送一次请求

setTimeout(function () {
  onInput(); // 再次输入，重新计时
  onInput(); // 重新计时
}, 400);

// ==============================
// 节流 vs 防抖对比
// ==============================

console.log('\n=== 节流 vs 防抖 ===');

let throttleCount = 0;
let debounceCount = 0;

const throttledFn = throttle(function () {
  throttleCount++;
  console.log('throttle 执行第', throttleCount, '次');
}, 100);

const debouncedFn = debounce(function () {
  debounceCount++;
  console.log('debounce 执行第', debounceCount, '次');
}, 100);

console.log('连续调用 5 次：');

for (let i = 0; i < 5; i++) {
  throttledFn(); // 第1次立即执行，后续被节流
  debouncedFn(); // 全部被防抖，只会在最后一次调用后 100ms 执行
}

console.log('throttle 至少执行了 1 次（首次）');
console.log('debounce 只会在最后一次调用后执行 1 次');
