/**
 * 手写 Generator 生成器
 *
 * Generator 是一种可以暂停和恢复执行的函数，通过 yield 产出值。
 * next(arg) 可以向 yield 表达式传入值。
 * 这里使用闭包 + 状态机来手动模拟 Generator 的行为，并与原生 generator 对比。
 */

// 原生 generator（用于对比）
function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
  return "done";
}

// 手写模拟简单 generator：function* gen() { yield 1; yield 2; yield 3; return 'done'; }
function makeSimpleGenerator() {
  var state = 0;
  return {
    next: function () {
      switch (state) {
        case 0:
          state = 1;
          return { value: 1, done: false };
        case 1:
          state = 2;
          return { value: 2, done: false };
        case 2:
          state = 3;
          return { value: 3, done: false };
        case 3:
          state = 4;
          return { value: "done", done: true };
        default:
          return { value: undefined, done: true };
      }
    },
  };
}

// 原生带参数传递的 generator
function* echoGenerator() {
  var x = yield 1;
  var y = yield x + 1;
  return x + y;
}

// 手写模拟带参数传递的 generator
function makeEchoGenerator() {
  var state = 0;
  var x, y;
  return {
    next: function (arg) {
      switch (state) {
        case 0:
          state = 1;
          return { value: 1, done: false }; // yield 1
        case 1:
          x = arg; // 接收 next(arg) 传入的值赋给 x
          state = 2;
          return { value: x + 1, done: false }; // yield x + 1
        case 2:
          y = arg; // 接收 next(arg) 传入的值赋给 y
          state = 3;
          return { value: x + y, done: true }; // return x + y
        default:
          return { value: undefined, done: true };
      }
    },
  };
}

// 测试原生 generator
console.log("--- Native Generator ---");
var gen = simpleGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3
console.log(gen.next()); // { value: 'done', done: true }
console.log(gen.next()); // { value: undefined, done: true }

// 测试手写模拟
console.log("--- Hand-written Generator ---");
var myGen = makeSimpleGenerator();
console.log(myGen.next().value); // 1
console.log(myGen.next().value); // 2
console.log(myGen.next().value); // 3
console.log(myGen.next()); // { value: 'done', done: true }
console.log(myGen.next()); // { value: undefined, done: true }

// 测试带参数传递（原生）
console.log("--- Native Echo Generator ---");
var echo = echoGenerator();
console.log(echo.next().value); // 1
console.log(echo.next(10).value); // 11 (x=10, yield x+1)
console.log(echo.next(20)); // { value: 30, done: true } (x+y=10+20)

// 测试带参数传递（手写）
console.log("--- Hand-written Echo Generator ---");
var myEcho = makeEchoGenerator();
console.log(myEcho.next().value); // 1
console.log(myEcho.next(10).value); // 11
console.log(myEcho.next(20)); // { value: 30, done: true }
