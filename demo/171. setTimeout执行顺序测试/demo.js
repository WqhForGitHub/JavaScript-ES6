// 171. setTimeout执行顺序测试

console.log("start");
setTimeout(() => console.log("timeout 0"), 0);
console.log("end");
