/**
 * 手写剩余参数（rest parameters）
 *
 * 剩余参数 `function fn(a, ...rest)` 将多余的参数收集为一个数组。
 * 在 ES5 中可以使用 arguments 对象配合 Array.prototype.slice 来模拟。
 */

// 使用 arguments 模拟剩余参数：function sum(first, ...rest)
function sum(first) {
  var rest = Array.prototype.slice.call(arguments, 1);
  var total = first;
  for (var i = 0; i < rest.length; i++) {
    total += rest[i];
  }
  return total;
}

// 通用剩余参数收集函数：function (...args)
function collectRest() {
  return Array.prototype.slice.call(arguments);
}

// 带固定参数和剩余参数：function greet(greeting, ...names)
function greet(greeting) {
  var names = Array.prototype.slice.call(arguments, 1);
  return greeting + ', ' + names.join(' and ') + '!';
}

// 收集剩余参数并转换：function multiply(factor, ...nums)
function multiply(factor) {
  var nums = Array.prototype.slice.call(arguments, 1);
  return nums.map(function (n) { return n * factor; });
}

// 将剩余参数转发给另一个函数（模拟 fn(...args) 调用）
function forward(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return fn.apply(null, args);
}

// 测试
console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(sum(10));             // 10

console.log(collectRest(1, 2, 3)); // [1, 2, 3]

console.log(greet('Hello', 'Alice', 'Bob')); // Hello, Alice and Bob!

console.log(multiply(2, 1, 2, 3)); // [2, 4, 6]

var max = forward(Math.max, 3, 7, 2, 9);
console.log(max); // 9

// 从指定位置开始收集（模拟 function fn(a, b, ...rest)）
function withTwoFixed(a, b) {
  var rest = Array.prototype.slice.call(arguments, 2);
  return { a: a, b: b, rest: rest };
}
console.log(withTwoFixed(1, 2, 3, 4, 5)); // { a: 1, b: 2, rest: [3, 4, 5] }
