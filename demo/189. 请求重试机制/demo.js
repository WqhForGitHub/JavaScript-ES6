// 189. 请求重试机制

function retry(task, times) {
  return task().catch((err) =>
    times > 1 ? retry(task, times - 1) : Promise.reject(err),
  );
}
let count = 0;
retry(
  () => (++count < 3 ? Promise.reject("fail") : Promise.resolve("ok")),
  3,
).then(console.log);
