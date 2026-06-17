// 183. async并发执行测试

const wait = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), 50));
async function run() {
  console.log(await Promise.all([wait(1), wait(2), wait(3)]));
}
run();
