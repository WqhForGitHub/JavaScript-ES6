// 173. 宏任务微任务对比

console.log("script start");
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve().then(() => console.log("microtask"));
console.log("script end");
