// 179. Promise.allSettled测试

Promise.allSettled([Promise.resolve('ok'), Promise.reject('bad')]).then(console.log);
