/**
 * 手写柯里化函数 curry
 *
 * 作用：
 *   - 把一个接受多参数的函数，转换成一系列接受单参数（或部分参数）的函数
 *   - 例如：f(a, b, c) → f(a)(b)(c) 或 f(a, b)(c)
 *   - 当收集到的参数数量达到原函数形参数量时，执行原函数
 *
 * 实现思路：
 *   1. 递归收集参数
 *   2. 判断已收集参数数量 >= fn.length 时调用 fn，否则继续返回收集函数
 *   3. 支持占位符（可选）
 */

function curry(fn) {
  return function curried(...args) {
    // 参数足够则执行
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 参数不足，继续收集；捕获 this 以便链式调用时透传给原函数
    const ctx = this;
    return function (...moreArgs) {
      return curried.apply(ctx, [...args, ...moreArgs]);
    };
  };
}

// 带占位符版本：用 curry.placeholder 表示"该位置稍后填"
curry.placeholder = Symbol("placeholder");

function curryWithPlaceholder(fn) {
  const placeholder = curry.placeholder;
  return function curried(...args) {
    // 判断当前参数是否已足够（占位符视为未填）
    const filledCount = args.filter((a) => a !== placeholder).length;
    // 当没有占位符且数量足够时执行
    const hasHole = args.includes(placeholder);

    if (filledCount >= fn.length && !hasHole) {
      return fn.apply(this, args);
    }

    return function (...moreArgs) {
      // 合并：把占位符位置用新参数依次替换，剩余的新参数追加到末尾
      const nextArgs = [...args];
      let i = 0;
      for (let j = 0; j < nextArgs.length && i < moreArgs.length; j++) {
        if (nextArgs[j] === placeholder) {
          nextArgs[j] = moreArgs[i++];
        }
      }
      while (i < moreArgs.length) {
        nextArgs.push(moreArgs[i++]);
      }
      return curried.apply(this, nextArgs);
    };
  };
}

// ===== 测试 =====

// 基本柯里化
function sum3(a, b, c) {
  return a + b + c;
}
const curriedSum = curry(sum3);
console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6
console.log(curriedSum(1, 2, 3)); // 6

// 应用：参数复用
function log(level, time, message) {
  return `[${level}][${time}] ${message}`;
}
const errorLog = curry(log)("ERROR");
console.log(errorLog("10:00")("disk full")); // [ERROR][10:00] disk full
console.log(errorLog("11:00", "cpu high")); // [ERROR][11:00] cpu high

// 占位符版本
const _ = curry.placeholder;
const curriedSumP = curryWithPlaceholder(sum3);
console.log(curriedSumP(_, 2, _)(1)(3)); // 6
console.log(curriedSumP(_, _, 3)(1)(2)); // 6
console.log(curriedSumP(1, _, _)(2, 3)); // 6

// 柯里化的普通调用 this 保留
const obj = {
  base: 100,
  add(a, b) {
    return this.base + a + b;
  },
};
const curriedAdd = curry(obj.add);
console.log(curriedAdd.call(obj, 1)(2)); // 103
