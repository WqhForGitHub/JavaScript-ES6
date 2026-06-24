/**
 * 手写函数最少执行 n 次后才执行 after
 *
 * 作用：
 *   - 包装一个函数，使其在前 n 次调用时不执行原函数
 *   - 第 n+1 次及之后的调用才真正执行原函数
 *   - 与 lodash 的 _.after 一致，是 before 的对偶
 *   - 典型场景：等所有异步任务完成后再执行、收集到足够数据后再处理
 *
 * 实现思路：
 *   1. 用计数器记录调用次数
 *   2. 当计数 > n 时才执行原函数，否则返回 undefined
 */

function after(n, fn) {
  if (typeof fn !== "function") {
    throw new TypeError("after expects a function");
  }
  let count = 0;
  return function (...args) {
    count++;
    if (count > n) {
      return fn.apply(this, args);
    }
    // 前 n 次不执行
    return undefined;
  };
}

// ===== 测试 =====

// 第 3 次后才执行（n=3 → 第 4 次起执行）
let execCount = 0;
const fn = after(3, (x) => {
  execCount++;
  return x * 2;
});
console.log(fn(1)); // undefined（不执行）
console.log(fn(2)); // undefined（不执行）
console.log(fn(3)); // undefined（不执行）
console.log(fn(4)); // 8（执行）
console.log(fn(5)); // 10（执行）
console.log("执行次数:", execCount); // 2

// after(0) 表示立即执行（每次都执行）
execCount = 0;
const immediate = after(0, () => {
  execCount++;
  return "go";
});
console.log(immediate()); // 'go'
console.log(immediate()); // 'go'
console.log("执行次数:", execCount); // 2

// after(1) 等价于"跳过第一次，之后都执行"
execCount = 0;
const skipFirst = after(1, () => {
  execCount++;
  return "after-first";
});
console.log(skipFirst()); // undefined
console.log(skipFirst()); // 'after-first'
console.log(skipFirst()); // 'after-first'
console.log("执行次数:", execCount); // 2

// 应用：模拟多个异步请求完成后再渲染
const total = 3;
let done = 0;
const render = after(total, () => {
  console.log("  所有数据加载完成，开始渲染");
  return "rendered";
});
// 模拟 3 个请求依次完成
console.log(render()); // undefined
console.log(render()); // undefined
console.log(render()); // undefined
console.log(render()); // 'rendered'（第 4 次，但其实第 total+1 次）

// 注意：更常见的用法是 after(n) 后第 n 次调用就触发
// 这里提供一个"第 n 次触发"的变体（与 lodash 行为一致：count >= n 时执行）
function afterInclusive(n, fn) {
  let count = 0;
  let result;
  return function (...args) {
    count++;
    if (count >= n) {
      result = fn.apply(this, args);
    }
    return result;
  };
}
let c = 0;
const onThird = afterInclusive(3, () => ++c);
console.log(onThird()); // undefined
console.log(onThird()); // undefined
console.log(onThird()); // 1（第 3 次触发）
console.log(onThird()); // 2（继续触发）

// this 绑定
const obj = {
  base: 100,
  add(x) {
    return this.base + x;
  },
};
const lateAdd = after(2, obj.add.bind(obj));
console.log(lateAdd(1)); // undefined
console.log(lateAdd(2)); // undefined
console.log(lateAdd(3)); // 103
