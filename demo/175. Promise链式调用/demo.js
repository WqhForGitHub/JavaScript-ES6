// 175. Promise链式调用

Promise.resolve(1)
  .then((v) => v + 1)
  .then((v) => v * 3)
  .then(console.log);
