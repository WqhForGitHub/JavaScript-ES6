/**
 * 手写高阶函数 trace（调试用，输出中间值）
 *
 * 作用：
 *   - 在函数管道中打印中间值（带标签），便于调试
 *   - 与 tap 类似但专用于"标记式日志"，输出后原值继续传递
 *   - 典型场景：调试 compose / pipe 中每一步的数据
 *
 * 实现思路：
 *   1. trace(label)(value) → 打印 label + value，返回 value
 *   2. 可扩展为带格式化函数、日志级别
 */

function trace(label) {
  return function (value) {
    console.log(`  [trace] ${label}:`, value);
    return value;
  };
}

// 带格式化器的 trace
function traceFmt(label, formatter) {
  return function (value) {
    const display = typeof formatter === "function" ? formatter(value) : value;
    console.log(`  [trace] ${label}:`, display);
    return value;
  };
}

// 带日志级别的 trace
function traceLevel(label, level = "log") {
  return function (value) {
    const fn = console[level] || console.log;
    fn(`  [trace:${level}] ${label}:`, value);
    return value;
  };
}

// ===== 测试 =====

function pipe(...fns) {
  return (x) => fns.reduce((v, f) => f(v), x);
}

// 基本用法：在管道中插入 trace
const calc = pipe(
  (x) => x + 1,
  trace("after +1"),
  (x) => x * 2,
  trace("after *2"),
  (x) => x - 3,
  trace("after -3"),
);
console.log("result:", calc(5));
// 打印：
//   [trace] after +1: 6
//   [trace] after *2: 12
//   [trace] after -3: 9
// result: 9

// 带格式化：打印数组长度而非整个数组
const data = [{ name: "Tom" }, { name: "Jerry" }, { name: "Spike" }];
const process = pipe(
  (list) => list.map((u) => u.name),
  traceFmt("names", (arr) => arr.length), // 只打印长度 3
  (names) => names.filter((n) => n.length > 3),
  traceFmt("filtered", (arr) => arr.join("|")),
  (names) => names.join(", "),
);
console.log(process(data)); // 'Jerry, Spike'

// 带级别
const leveled = pipe(
  (x) => x * 10,
  traceLevel("multiplied", "log"),
  (x) => {
    if (x > 100) console.warn("  big value!");
    return x;
  },
  traceLevel("final", "info"),
);
leveled(20); // 200

// 应用：调试异步管道
async function asyncPipe(...fns) {
  return async (x) => {
    let r = x;
    for (const fn of fns) r = await fn(r);
    return r;
  };
}
const delay = (ms, v) => new Promise((res) => setTimeout(() => res(v), ms));

(async () => {
  const asyncTrace = (label) => async (value) => {
    console.log(`  [atrace] ${label}:`, value);
    return value;
  };
  const p = await asyncPipe(
    (x) => delay(10, x + 1),
    asyncTrace("step1"),
    (x) => delay(10, x * 2),
    asyncTrace("step2"),
  );
  console.log(await p(10)); // 打印 step1:11, step2:22, 返回 22
})();

// 条件 trace：只在调试模式打印
const DEBUG = true;
const debugTrace = (label) => (value) => {
  if (DEBUG) console.log(`  [debug] ${label}:`, value);
  return value;
};
const fastPipe = pipe(
  (x) => x + 1,
  debugTrace("v"),
  (x) => x * 2,
);
console.log(fastPipe(3)); // 打印 [debug] v: 4，返回 8
