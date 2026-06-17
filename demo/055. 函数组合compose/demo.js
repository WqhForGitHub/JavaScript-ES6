// 55. 函数组合compose

const compose =
  (...fns) =>
  (value) =>
    fns.reduceRight((result, fn) => fn(result), value);
console.log(
  compose(
    (n) => n + 1,
    (n) => n * n,
    (n) => n * 2,
  )(3),
);
