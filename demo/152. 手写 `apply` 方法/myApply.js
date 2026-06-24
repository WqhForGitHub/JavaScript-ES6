/**
 * 手写 apply 方法
 *
 * 作用：
 *   - apply(thisArg, [argsArray]) 用指定 this 值和数组参数调用函数
 *   - 与原生 Function.prototype.apply 行为一致
 *   - 与 call 的区别仅在于参数以数组形式传递
 *
 * 实现思路：
 *   1. 在 thisArg 上临时挂载该函数
 *   2. 处理参数：第二个参数应为类数组，null/undefined 视为无参数
 *   3. 执行函数后删除临时属性并返回结果
 */

/* eslint-disable no-extend-native */
Function.prototype.myApply = function (thisArg, argsArray) {
  const fn = this;

  // thisArg 处理：null/undefined 指向全局对象，原始值包装成对象
  if (thisArg == null) {
    thisArg = globalThis;
  } else {
    thisArg = Object(thisArg);
  }

  // 参数处理：未传或 null/undefined 时当作空参数
  let args = [];
  if (argsArray !== undefined && argsArray !== null) {
    // 原生 apply 接受"类数组对象"（有 length 属性的对象）或可迭代对象
    // Array.from 同时支持这两类，并对不合法输入抛 TypeError
    if (typeof argsArray !== "object" && typeof argsArray !== "function") {
      throw new TypeError("CreateListFromArrayLike called on non-object");
    }
    args = Array.from(argsArray);
  }

  const fnKey = Symbol("fn");
  thisArg[fnKey] = fn;
  const result = thisArg[fnKey](...args);
  delete thisArg[fnKey];

  return result;
};

// ===== 测试 =====

const obj = { name: "Tom" };

function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

console.log(greet.myApply(obj, ["Hello", "!"])); // 'Hello, Tom!'
console.log(greet.myApply({ name: "Jerry" }, ["Hi", "."])); // 'Hi, Jerry.'

// 无参数函数
function whoAmI() {
  return this.name;
}
console.log(whoAmI.myApply(obj)); // 'Tom'
console.log(whoAmI.myApply(obj, null)); // 'Tom'
console.log(whoAmI.myApply(obj, undefined)); // 'Tom'

// thisArg 为 null → 全局对象
function checkGlobal() {
  return this === globalThis;
}
console.log(checkGlobal.myApply(null)); // true

// 求数组最大值（apply 经典用法）
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
console.log(Math.max.myApply(null, numbers)); // 9

// 类数组作为参数
function sum() {
  return Array.prototype.reduce.call(arguments, (a, b) => a + b, 0);
}
console.log(sum.myApply(null, { 0: 1, 1: 2, 2: 3, length: 3 })); // 6
