/**
 * 手写函数组合 compose
 *
 * 作用：
 *   - compose(f, g, h)(x) => f(g(h(x)))
 *   - 把多个函数"组合"成一个函数，数据从右向左流经各函数
 *   - 是函数式编程的核心工具之一
 *
 * 实现思路：
 *   1. 从右到左依次把上一个函数的输出作为下一个函数的输入
 *   2. 用 reduceRight 简洁实现
 */

function compose(...fns) {
  if (fns.length === 0) {
    // 无函数时返回恒等函数
    return (x) => x;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return fns.reduce(
    (f, g) =>
      (...args) =>
        f(g(...args))
  );
}

// ===== 测试 =====

const inc = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

// compose(inc, double, square)(2) = inc(double(square(2))) = inc(double(4)) = inc(8) = 9
console.log(compose(inc, double, square)(2)); // 9

// 多参数：最右函数接收全部参数
const add = (a, b) => a + b;
const multiply10 = (x) => x * 10;
console.log(compose(multiply10, add)(3, 4)); // 70 = (3+4)*10

// 字符串处理链
const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const exclaim = (s) => s + "!";
const shout = compose(exclaim, upper, trim);
console.log(shout("  hello world  ")); // 'HELLO WORLD!'

// 无函数返回恒等
console.log(compose()(42)); // 42

// 单函数
console.log(compose(inc)(5)); // 6

// 组合满足结合律：compose(f, compose(g, h)) === compose(compose(f, g), h)
const left = compose(inc, compose(double, square))(3);
const right = compose(compose(inc, double), square)(3);
console.log(left === right); // true

// 实际应用：数据转换管道
const users = [{ name: "tom", age: 20 }, { name: "jerry", age: 30 }];
const getNames = (list) => list.map((u) => u.name);
const toUpper = (list) => list.map((s) => s.toUpperCase());
const joinByComma = (list) => list.join(", ");
const displayNames = compose(joinByComma, toUpper, getNames);
console.log(displayNames(users)); // 'TOM, JERRY'
