/**
 * 手写函数只执行一次 once
 *
 * 作用：
 *   - 包装一个函数，使其无论被调用多少次，真正逻辑只执行一次
 *   - 后续调用直接返回第一次的结果
 *   - 典型场景：弹窗只显示一次、事件只绑定一次、初始化只执行一次
 *
 * 实现思路：
 *   1. 用闭包保存执行标志与结果
 *   2. 第一次调用执行原函数并缓存结果，之后直接返回缓存
 */

function once(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("once expects a function");
  }
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
      // 释放引用，避免内存泄漏（可选）
      fn = null;
    }
    return result;
  };
}

// ===== 测试 =====

// 基本用法
let count = 0;
const initialize = once(() => {
  count++;
  return "initialized";
});
console.log(initialize()); // 'initialized'
console.log(initialize()); // 'initialized'
console.log(initialize()); // 'initialized'
console.log(count); // 1（只执行了一次）

// 保留参数与返回值
const addOnce = once((a, b) => {
  console.log(`  computing ${a}+${b}`);
  return a + b;
});
console.log(addOnce(1, 2)); // 打印 computing，返回 3
console.log(addOnce(3, 4)); // 不打印，返回 3（仍是第一次结果）
console.log(addOnce(10, 20)); // 3

// this 绑定
const obj = {
  name: "Tom",
  greet() {
    return `Hello, ${this.name}`;
  },
};
obj.greetOnce = once(obj.greet);
console.log(obj.greetOnce()); // 'Hello, Tom'
console.log(obj.greetOnce()); // 'Hello, Tom'

// 应用：只绑定一次的事件
const events = {};
const on = once(function (type, handler) {
  events[type] = handler;
  return "registered";
});
console.log(on("click", () => {})); // 'registered'
console.log(on("click", () => {})); // 'registered'（第二次无效）
console.log(events.click); // [Function]

// 应用：单次初始化配置
const loadConfig = once(() => {
  console.log("  loading config...");
  return { api: "/api/v1", timeout: 5000 };
});
console.log(loadConfig().api); // 打印 loading，返回 /api/v1
console.log(loadConfig().api); // 不打印，直接返回 /api/v1
