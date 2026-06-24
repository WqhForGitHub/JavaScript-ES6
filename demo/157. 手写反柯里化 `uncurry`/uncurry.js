/**
 * 手写反柯里化 uncurry
 *
 * 作用：
 *   - 柯里化的逆过程：把一个柯里化的函数转回普通多参数函数
 *   - 也常指：把"方法"从对象上解耦出来，变成可用任意 this 调用的普通函数
 *     例如：[1,2,3].push(4) → uncurry(Array.prototype.push)(arr, 4)
 *
 * 实现思路：
 *   - 形式1（逆柯里化）：递归收集参数直到达到原函数所需数量，再执行
 *   - 形式2（方法解耦）：fn.call(thisArg, ...args)，让方法可借用到任意对象
 */

// 形式1：把柯里化函数转为普通函数
function uncurry(curriedFn, totalArgs = Infinity) {
  return function (...args) {
    // 若指定了总参数数，且当前参数已足够，直接逐层调用
    if (args.length >= totalArgs) {
      return args.reduce((acc, arg) => acc(arg), curriedFn);
    }
    // 否则按给定参数调用
    return args.reduce((acc, arg) => acc(arg), curriedFn);
  };
}

// 形式2（更常见）：让对象方法可被"借用"，第一个参数作为 this
Function.prototype.uncurry = function () {
  const fn = this;
  return function (thisArg, ...args) {
    return fn.apply(thisArg, args);
  };
};

// ===== 测试 =====

// 形式1：逆柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}
function add3(a, b, c) {
  return a + b + c;
}
const curriedAdd = curry(add3);
console.log(curriedAdd(1)(2)(3)); // 6（柯里化形式）

const uncurriedAdd = uncurry(curriedAdd, add3.length);
console.log(uncurriedAdd(1, 2, 3)); // 6（反柯里化后普通调用）

// 形式2：方法解耦（借用）
const push = Array.prototype.push.uncurry();
const arr1 = [1, 2];
push(arr1, 3);
push(arr1, 4, 5); // 注意：这里 4,5 会被当成两个参数 push
console.log(arr1); // [1, 2, 3, 4, 5]

// 借用数组方法到类数组
const slice = Array.prototype.slice.uncurry();
function listArgs() {
  return slice(arguments, 0, 2); // arguments 前 2 项
}
console.log(listArgs(10, 20, 30, 40)); // [10, 20]

// 借用 Object.prototype.toString
const toString = Object.prototype.toString.uncurry();
console.log(toString([])); // '[object Array]'
console.log(toString(null)); // '[object Null]'
console.log(toString(123)); // '[object Number]'

// 借用 String 方法
const charAt = String.prototype.charAt.uncurry();
console.log(charAt("hello", 1)); // 'e'

// 借用到非数组对象
const forEach = Array.prototype.forEach.uncurry();
const obj = { 0: "a", 1: "b", length: 2 };
const collected = [];
forEach(obj, (v) => collected.push(v));
console.log(collected); // ['a', 'b']
