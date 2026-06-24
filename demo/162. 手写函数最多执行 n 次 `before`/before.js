/**
 * 手写函数最多执行 n 次 before
 *
 * 作用：
 *   - 包装一个函数，使其在前 n-1 次调用时执行原函数（即"在第 n 次之前"执行）
 *   - 第 n 次及之后的调用不再执行，直接返回最后一次的结果
 *   - 与 lodash 的 _.before 一致
 *   - 典型场景：监听器只触发有限次、初始化前置检查
 *
 * 实现思路：
 *   1. 用计数器记录调用次数
 *   2. 当计数 < n 时执行原函数并缓存结果；否则直接返回缓存
 */

function before(n, fn) {
  if (typeof fn !== "function") {
    throw new TypeError("before expects a function");
  }
  let count = 0;
  let result;
  return function (...args) {
    count++;
    if (count < n) {
      result = fn.apply(this, args);
    }
    // count >= n 时不再执行，返回最后一次结果（或 undefined）
    return result;
  };
}

// ===== 测试 =====

// 最多执行 n-1 次（n=3 → 前 2 次执行）
let execCount = 0;
const fn = before(3, (x) => {
  execCount++;
  return x * 2;
});
console.log(fn(1)); // 2（执行）
console.log(fn(2)); // 4（执行）
console.log(fn(3)); // 4（不执行，返回上一次结果）
console.log(fn(4)); // 4（不执行）
console.log("执行次数:", execCount); // 2

// before(1) 表示一次都不执行
execCount = 0;
const never = before(1, () => {
  execCount++;
  return "never";
});
console.log(never()); // undefined
console.log(never()); // undefined
console.log("执行次数:", execCount); // 0

// before(2) 等价于 once（只执行第一次）
execCount = 0;
const onceLike = before(2, () => {
  execCount++;
  return "first";
});
console.log(onceLike()); // 'first'
console.log(onceLike()); // 'first'
console.log(onceLike()); // 'first'
console.log("执行次数:", execCount); // 1

// 应用：事件最多触发有限次
let clicks = 0;
const onFirstThreeClicks = before(4, () => {
  clicks++;
  console.log(`  clicked #${clicks}`);
});
onFirstThreeClicks(); // clicked #1
onFirstThreeClicks(); // clicked #2
onFirstThreeClicks(); // clicked #3
onFirstThreeClicks(); // 无输出
console.log("总点击处理:", clicks); // 3

// this 绑定
const obj = {
  base: 10,
  add(x) {
    return this.base + x;
  },
};
const limitedAdd = before(3, obj.add.bind(obj));
console.log(limitedAdd(1)); // 11
console.log(limitedAdd(2)); // 12
console.log(limitedAdd(3)); // 12（不再执行）
