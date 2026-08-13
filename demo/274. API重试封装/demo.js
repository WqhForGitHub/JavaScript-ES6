// 274. API重试封装

async function retryRequest(task, times = 3) {
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
retryRequest(() => Promise.resolve('ok')).then(console.log);
