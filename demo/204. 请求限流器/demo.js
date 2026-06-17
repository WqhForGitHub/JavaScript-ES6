// 204. 请求限流器

function throttleRequest(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      return fn(...args);
    }
    return Promise.resolve("limited");
  };
}
const request = throttleRequest((url) => Promise.resolve("fetch " + url), 1000);
request("/api").then(console.log);
request("/api").then(console.log);
