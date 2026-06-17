// 191. sleep函数实现

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function demo() {
  console.log("start");
  await sleep(100);
  console.log("end");
}
demo();
