// 48. 函数柯里化实现

function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...next) => curried(...args, ...next);
  };
}
const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3));
