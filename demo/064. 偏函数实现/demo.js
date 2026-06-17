// 64. 偏函数实现

function partial(fn, ...preset) {
  return (...later) => fn(...preset, ...later);
}
const add = (a, b, c) => a + b + c;
console.log(partial(add, 1)(2, 3));
