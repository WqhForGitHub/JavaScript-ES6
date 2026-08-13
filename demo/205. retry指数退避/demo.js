// 205. retry指数退避

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function retry(task, times, delay = 50) {
  try {
    return await task();
  } catch (err) {
    if (times <= 1) throw err;
    await sleep(delay);
    return retry(task, times - 1, delay * 2);
  }
}
let count = 0;
retry(() => (++count < 3 ? Promise.reject('fail') : Promise.resolve('ok')), 3).then(console.log);
