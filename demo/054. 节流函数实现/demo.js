// 54. 节流函数实现

function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}
const log = throttle(console.log, 100);
log(1);
log(2);
setTimeout(() => log(3), 120);
