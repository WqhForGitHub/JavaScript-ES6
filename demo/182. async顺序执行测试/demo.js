// 182. async顺序执行测试

const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 50));
async function run() {
  console.log(await wait(1));
  console.log(await wait(2));
}
run();
