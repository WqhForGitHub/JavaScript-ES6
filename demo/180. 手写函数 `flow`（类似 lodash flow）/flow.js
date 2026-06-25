/**
 * 手写函数 flow（类似 lodash flow）
 *
 * 作用：
 *   - flow(funcs) 创建一个函数，从左到右依次调用，前一个结果作为后一个参数
 *   - 与 pipe 一致，lodash 把它命名为 flow（flowRight 即 compose）
 *   - 支持初始多参数：第一个函数接收全部参数，之后单值传递
 *
 * 实现思路：
 *   1. 第一个函数用 spread 调用，之后用 reduce 链式传递
 *   2. 空函数返回恒等
 */

function flow(...fns) {
  if (fns.length === 0) {
    return (x) => x;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function (...args) {
    // 第一个函数接收全部参数
    let result = fns[0].apply(this, args);
    // 之后依次把上一步结果传入下一步
    for (let i = 1; i < fns.length; i++) {
      result = fns[i].call(this, result);
    }
    return result;
  };
}

// flowRight：反向（即 compose，从右到左）
function flowRight(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];
  return function (...args) {
    let result = fns[fns.length - 1].apply(this, args);
    for (let i = fns.length - 2; i >= 0; i--) {
      result = fns[i].call(this, result);
    }
    return result;
  };
}

// ===== 测试 =====

const inc = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

// flow 从左到右：inc → double → square
console.log(flow(inc, double, square)(2)); // 36 = ((2+1)*2)^2

// flowRight 从右到左：相当于 compose
console.log(flowRight(square, double, inc)(2)); // 36 = square(double(inc(2)))

// 多参数：第一个函数接收全部
const add = (a, b) => a + b;
const multiply10 = (x) => x * 10;
console.log(flow(add, multiply10)(3, 4)); // 70 = (3+4)*10

// 空函数返回恒等
console.log(flow()(42)); // 42

// 单函数
console.log(flow(inc)(5)); // 6

// 字符串处理
const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const exclaim = (s) => s + "!";
const shout = flow(trim, upper, exclaim);
console.log(shout("  hello  ")); // 'HELLO!'

// 数据处理流水线
const users = [
  { name: "tom", age: 20 },
  { name: "jerry", age: 30 },
];
const getNames = flow(
  (list) => list.map((u) => u.name),
  (names) => names.map((n) => n.toUpperCase()),
  (names) => names.join(", "),
);
console.log(getNames(users)); // 'TOM, JERRY'

// lodash 风格：配合 map / filter
function map(fn) {
  return (list) => list.map(fn);
}
function filter(fn) {
  return (list) => list.filter(fn);
}
function reduce(fn, init) {
  return (list) => list.reduce(fn, init);
}

const sumEvenSquares = flow(
  filter((x) => x % 2 === 0),
  map((x) => x * x),
  reduce((a, b) => a + b, 0),
);
console.log(sumEvenSquares([1, 2, 3, 4, 5, 6])); // 56 = 4+16+36

// flow 与 flowRight 关系
const f1 = flow(inc, double);
const f2 = flowRight(double, inc);
console.log(f1(3) === f2(3)); // true（都返回 8）

// 返回函数本身便于复用
const pipeline = flow(inc, double, square);
console.log(pipeline(1), pipeline(2), pipeline(3)); // 16, 36, 64
