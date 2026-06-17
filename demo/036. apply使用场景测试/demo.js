// 36. apply使用场景测试

function sum(a, b, c) {
  return a + b + c;
}
console.log(sum.apply(null, [1, 2, 3]));
console.log(Math.max.apply(null, [3, 9, 1]));
