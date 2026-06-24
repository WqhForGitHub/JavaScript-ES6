/**
 * 手写偏函数 partial
 *
 * 作用：
 *   - 固定函数的部分参数，返回一个新函数，剩余参数在调用时传入
 *   - 与柯里化的区别：
 *       - 柯里化是逐步接收单参，参数足够才执行
 *       - 偏函数一次性固定"部分"参数，剩余参数调用时一次性传入
 *   - 支持占位符，允许跳过某些位置稍后填充
 *
 * 实现思路：
 *   1. 预存 fn 与预设参数
 *   2. 返回新函数，把预设参数中的占位符按顺序用新参数替换
 */

const _ = Symbol("partial.placeholder");

function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    let i = 0;
    const finalArgs = presetArgs.map((arg) => {
      // 占位符按顺序用新参数替换
      if (arg === _) {
        return laterArgs[i++];
      }
      return arg;
    });
    // 剩余的新参数追加到末尾
    while (i < laterArgs.length) {
      finalArgs.push(laterArgs[i++]);
    }
    return fn.apply(this, finalArgs);
  };
}

// ===== 测试 =====

// 固定前部分参数
function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}
const sayHelloTo = partial(greet, "Hello");
console.log(sayHelloTo("Tom", "!")); // 'Hello, Tom!'

// 固定中间参数（用占位符）
const helloSomeone = partial(greet, "Hello", _, "!");
console.log(helloSomeone("Jerry")); // 'Hello, Jerry!'

// 占位符 + 后续参数混合
function sum4(a, b, c, d) {
  return a + b + c + d;
}
const f = partial(sum4, _, 2, _, 4);
console.log(f(1, 3)); // 10 (1+2+3+4)

// 预设少于剩余参数
function join() {
  return Array.prototype.join.call(arguments, "-");
}
const prefixJoin = partial(join, "A", "B");
console.log(prefixJoin("C", "D", "E")); // 'A-B-C-D-E'

// this 绑定保留
const obj = {
  multiplier: 10,
  scale(a, b) {
    return (a + b) * this.multiplier;
  },
};
const scaleBy = partial(obj.scale.bind(obj), 5);
console.log(scaleBy(3)); // 80 = (5+3)*10

// 与柯里化对比：偏函数不要求逐参
const curriedLike = partial(sum4, 1, 2);
console.log(curriedLike(3, 4)); // 10
