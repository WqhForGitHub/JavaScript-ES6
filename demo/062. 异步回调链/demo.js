// 62. 异步回调链

function asyncStep(value, callback) {
  setTimeout(() => callback(value + 1), 50);
}
asyncStep(1, (a) => asyncStep(a, (b) => asyncStep(b, (c) => console.log(c))));
