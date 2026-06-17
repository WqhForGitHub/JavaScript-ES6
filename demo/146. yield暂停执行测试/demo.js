// 146. yield暂停执行测试

function* task() {
  console.log("start");
  const input = yield "pause";
  console.log("resume", input);
}
const gen = task();
console.log(gen.next().value);
gen.next("data");
