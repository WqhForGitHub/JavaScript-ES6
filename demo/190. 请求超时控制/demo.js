// 190. 请求超时控制

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
withTimeout(new Promise((resolve) => setTimeout(() => resolve('ok'), 50)), 100)
  .then(console.log)
  .catch((err) => console.log(err.message));
