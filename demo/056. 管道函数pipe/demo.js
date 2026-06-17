// 56. 管道函数pipe

const pipe =
  (...fns) =>
  (value) =>
    fns.reduce((result, fn) => fn(result), value);
console.log(
  pipe(
    (s) => s.trim(),
    (s) => s.toUpperCase(),
    (s) => `${s}!`,
  )(" hello "),
);
