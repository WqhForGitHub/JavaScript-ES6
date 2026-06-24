/**
 * 手写尾递归优化函数
 *
 * 作用：
 *   - 尾递归优化（TCO）：把递归改写为尾递归形式，并用蹦床（trampoline）技术
 *     避免调用栈溢出，让"递归"能在常数栈空间下运行
 *   - JavaScript 引擎多数未实现真正的 TCO，故用手动蹦床模拟
 *
 * 实现思路：
 *   1. 尾递归：递归调用是函数最后一步（返回值就是递归调用），无需保存上下文
 *   2. 蹦床：让函数返回"一个 thunk（延迟执行的函数）"而非直接递归
 *      外层 while 循环不断执行 thunk，从而避免栈增长
 *   3. 终止条件返回具体值时跳出循环
 */

// 蹦床函数：把返回 thunk 的递归函数变成可安全执行的迭代
function trampoline(fn) {
  return function (...args) {
    let result = fn.apply(this, args);
    // 只要结果是函数就继续调用，直到返回普通值
    while (typeof result === "function") {
      result = result();
    }
    return result;
  };
}

// 普通递归：大数会栈溢出
function factorialNaive(n) {
  if (n <= 1) return 1;
  return n * factorialNaive(n - 1); // 不是尾递归（乘法在递归之后）
}

// 尾递归版本：用累加器把计算移到参数中
function factorialTR(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTR(n - 1, n * acc); // 尾递归（递归是最后操作）
}

// 蹦床版：返回 thunk 而非直接调用
function factorialThunk(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorialThunk(n - 1, n * acc);
}

const factorialSafe = trampoline(factorialThunk);

// 斐波那契尾递归
function fibTR(n, a = 0, b = 1) {
  if (n === 0) return a;
  return fibTR(n - 1, b, a + b);
}
function fibThunk(n, a = 0, b = 1) {
  if (n === 0) return a;
  return () => fibThunk(n - 1, b, a + b);
}
const fibSafe = trampoline(fibThunk);

// 通用尾递归优化包装器：把"返回递归调用"自动转成 thunk
function tco(fn) {
  let active = false;
  const argsStack = [];
  let result;
  return function (...args) {
    argsStack.push(args);
    if (!active) {
      active = true;
      while (argsStack.length) {
        const currentArgs = argsStack.shift();
        result = fn.apply(this, currentArgs);
      }
      active = false;
      return result;
    }
    return result;
  };
}

// ===== 测试 =====

console.log(factorialNaive(5)); // 120
console.log(factorialTR(5)); // 120
console.log(factorialSafe(5)); // 120

console.log(fibTR(10)); // 55
console.log(fibSafe(10)); // 55

// 大数测试：普通递归会栈溢出，蹦床版安全
console.log("factorialSafe(10000) 位数:", String(factorialSafe(10000)).length); // 大数正常
console.log("fibSafe(10000):", fibSafe(10000) > 0); // true（不溢出）

// tco 通用包装：自动把尾递归转成循环
const factorialTCO = tco(function (n, acc = 1) {
  if (n <= 1) return acc;
  // 这里的"返回递归调用"会被 tco 拦截转为迭代
  return factorialTCO(n - 1, n * acc);
});
// 注意：tco 包装的函数内部递归仍需用包装后版本
// 下面用一个更标准的 tco 示例
const fact = tco(function (n, acc) {
  if (n <= 1) return acc;
  return fact(n - 1, n * acc);
});
console.log(fact(5, 1)); // 120
console.log(String(fact(10000, 1)).length > 0); // true

// 对比：普通递归大数会 RangeError
let naiveError = null;
try {
  factorialNaive(20000);
} catch (e) {
  naiveError = e;
}
console.log("普通递归大数:", naiveError ? "栈溢出" : "正常"); // '栈溢出'

// 应用：累加求和
const sumThunk = function (n, acc = 0) {
  if (n === 0) return acc;
  return () => sumThunk(n - 1, acc + n);
};
const sumSafe = trampoline(sumThunk);
console.log(sumSafe(100)); // 5050
console.log(sumSafe(1000000)); // 500000500000（不溢出）
