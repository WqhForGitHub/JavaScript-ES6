// 58. 函数重试机制

async function retry(fn, times = 3) {
  let err;
  for (let i = 0; i < times; i++) {
    try {
      return await fn(i);
    } catch (error) {
      err = error;
    }
  }
  throw err;
}
retry((i) => {
  if (i < 2) throw new Error('fail');
  return 'success';
}).then(console.log);
