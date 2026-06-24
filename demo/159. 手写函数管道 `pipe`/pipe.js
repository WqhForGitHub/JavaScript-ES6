/**
 * 手写函数管道 pipe
 *
 * 作用：
 *   - pipe(f, g, h)(x) => h(g(f(x)))
 *   - 与 compose 类似，但数据从左向右流动（更符合阅读直觉）
 *
 * 实现思路：
 *   1. 从左到右依次执行，把上一步结果传给下一步
 *   2. 用 reduce 简洁实现
 */

function pipe(...fns) {
  if (fns.length === 0) {
    return (x) => x;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return fns.reduce(
    (f, g) =>
      (...args) =>
        g(f(...args))
  );
}

// ===== 测试 =====

const inc = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

// pipe(inc, double, square)(2) = square(double(inc(2))) = square(double(3)) = square(6) = 36
console.log(pipe(inc, double, square)(2)); // 36

// 多参数：第一个函数接收全部参数
const add = (a, b) => a + b;
const multiply10 = (x) => x * 10;
console.log(pipe(add, multiply10)(3, 4)); // 70 = (3+4)*10

// 字符串处理链（从左到右更易读）
const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const exclaim = (s) => s + "!";
const shout = pipe(trim, upper, exclaim);
console.log(shout("  hello world  ")); // 'HELLO WORLD!'

// 无函数返回恒等
console.log(pipe()(42)); // 42

// 单函数
console.log(pipe(inc)(5)); // 6

// pipe 与 compose 方向相反
const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));
const leftToRight = pipe(inc, double, square)(2); // 36
const rightToLeft = compose(inc, double, square)(2); // 9
console.log(leftToRight, rightToLeft); // 36 9

// 实际应用：数据转换管道（可读性好）
const users = [{ name: "tom", age: 20 }, { name: "jerry", age: 30 }];
const getNames = (list) => list.map((u) => u.name);
const toUpper = (list) => list.map((s) => s.toUpperCase());
const joinByComma = (list) => list.join(", ");
const displayNames = pipe(getNames, toUpper, joinByComma);
console.log(displayNames(users)); // 'TOM, JERRY'

// 数值计算管道
const calculate = pipe(
  (x) => x + 10,
  (x) => x * 2,
  (x) => x - 5
);
console.log(calculate(5)); // ((5+10)*2)-5 = 25
