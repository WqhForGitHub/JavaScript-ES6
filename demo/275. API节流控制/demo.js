// 275. API节流控制

function throttleRequest(fn, delay) {
  let waiting = false;
  return (...args) => {
    if (waiting) return Promise.resolve('throttled');
    waiting = true;
    setTimeout(() => (waiting = false), delay);
    return fn(...args);
  };
}
throttleRequest(() => Promise.resolve('request sent'), 1000)().then(console.log);
