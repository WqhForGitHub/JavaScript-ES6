// 184. await阻塞分析

async function demo() {
  console.log("before await");
  await Promise.resolve();
  console.log("after await");
}
demo();
console.log("sync code");
