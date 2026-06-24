/**
 * 手写 call 方法
 *
 * 作用：
 *   - call(thisArg, arg1, arg2, ...) 用指定 this 值和逐个参数调用函数
 *   - 与原生 Function.prototype.call 行为一致
 *
 * 实现思路：
 *   1. 在 thisArg 上临时挂载该函数（用唯一 key 避免覆盖原属性）
 *   2. 执行函数，此时函数内部的 this 指向 thisArg
 *   3. 删除临时属性，返回执行结果
 *   4. 处理 thisArg 为 null/undefined 时指向全局对象（非严格模式）
 */

/* eslint-disable no-extend-native */
Function.prototype.myCall = function (thisArg, ...args) {
  // 1. 待调用的函数本身
  const fn = this;

  // 2. thisArg 为 null/undefined 时指向全局对象（globalThis）
  //    原始值（number/string/boolean）用 Object 包一层
  if (thisArg == null) {
    thisArg = globalThis;
  } else {
    thisArg = Object(thisArg);
  }

  // 3. 用 Symbol 作为唯一 key，避免覆盖 thisArg 上的同名属性
  const fnKey = Symbol("fn");
  thisArg[fnKey] = fn;

  // 4. 执行函数，拿到结果
  const result = thisArg[fnKey](...args);

  // 5. 删除临时属性
  delete thisArg[fnKey];

  return result;
};

// ===== 测试 =====

const obj = { name: "Tom" };

function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

console.log(greet.myCall(obj, "Hello", "!")); // 'Hello, Tom!'

// thisArg 为原始值（会被包装成对象）
function showThisAndType() {
  return [this, typeof this];
}
console.log(greet.myCall({ name: "Jerry" }, "Hi", ".")); // 'Hi, Jerry.'

// thisArg 为 null → 指向全局对象
function checkGlobal() {
  return this === globalThis;
}
console.log(checkGlobal.myCall(null)); // true

// 原始值作为 thisArg
function addThis(x) {
  return x + (typeof this.valueOf === "function" ? this.valueOf() : 0);
}
// 注意：Object(5) 包装后 valueOf 返回 5
console.log(typeof addThis.myCall(5, 10)); // 'number'

// 函数有返回值
function sum(a, b, c) {
  return a + b + c;
}
console.log(sum.myCall(null, 1, 2, 3)); // 6
