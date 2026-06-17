// 59. 函数超时控制

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}
withTimeout(Promise.resolve("done"), 100)
  .then(console.log)
  .catch((e) => console.log(e.message));
