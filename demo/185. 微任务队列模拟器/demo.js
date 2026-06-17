// 185. 微任务队列模拟器

const microtasks = [];
function queueMicro(fn) {
  microtasks.push(fn);
}
queueMicro(() => console.log("micro 1"));
queueMicro(() => console.log("micro 2"));
console.log("sync");
while (microtasks.length) microtasks.shift()();
