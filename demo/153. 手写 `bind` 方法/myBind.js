/**
 * 手写 bind 方法
 *
 * 作用：
 *   - bind(thisArg, arg1, arg2, ...) 返回一个新函数
 *   - 新函数被调用时，this 固定为 thisArg，并支持预先传入部分参数（柯里化）
 *
 * 实现思路：
 *   1. 保存原函数与预设的 this 和参数
 *   2. 返回一个新函数，调用时把预设参数与新参数拼接
 *   3. （本版本不处理 new 调用，见 154 题支持 new）
 */

/* eslint-disable no-extend-native */
Function.prototype.myBind = function (thisArg, ...presetArgs) {
  if (typeof this !== "function") {
    throw new TypeError("Function.prototype.myBind called on non-callable");
  }

  const fn = this;

  // thisArg 处理
  if (thisArg == null) {
    thisArg = globalThis;
  } else {
    thisArg = Object(thisArg);
  }

  const bound = function (...laterArgs) {
    // 合并预设参数与调用时参数
    const allArgs = [...presetArgs, ...laterArgs];
    // 作为普通函数调用，this 固定为 thisArg
    return fn.apply(thisArg, allArgs);
  };

  // 保持原函数的 length（去掉预设参数后的形参数量）
  try {
    Object.defineProperty(bound, "length", {
      value: Math.max(0, fn.length - presetArgs.length),
    });
  } catch (e) {
    /* 某些环境下 length 不可写，忽略 */
  }

  return bound;
};

// ===== 测试 =====

const obj = { name: "Tom" };

function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const boundGreet = greet.myBind(obj, "Hello");
console.log(boundGreet("!")); // 'Hello, Tom!'

// 预设全部参数
const fullBound = greet.myBind(obj, "Hi", ".");
console.log(fullBound()); // 'Hi, Tom.'

// 参数拼接顺序：预设在前，后传在后
function sum(a, b, c, d) {
  return a + b + c + d;
}
const addSome = sum.myBind(null, 1, 2);
console.log(addSome(3, 4)); // 10

// this 固定，后续调用不会改变
const person = { name: "Jerry" };
function getName() {
  return this.name;
}
const boundName = getName.myBind(person);
console.log(boundName()); // 'Jerry'
console.log(boundName.call({ name: "Other" })); // 'Jerry'（bind 后 this 已固定）

// 作为回调使用（this 不会丢失）
const counter = {
  count: 0,
  inc() {
    this.count++;
    return this.count;
  },
};
const inc = counter.inc.myBind(counter);
console.log(inc()); // 1
console.log(inc()); // 2
console.log(counter.count); // 2
