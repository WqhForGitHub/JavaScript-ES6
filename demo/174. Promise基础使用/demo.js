// 174. Promise基础使用

const promise = new Promise((resolve) =>
  setTimeout(() => resolve("done"), 100),
);
promise.then(console.log);
