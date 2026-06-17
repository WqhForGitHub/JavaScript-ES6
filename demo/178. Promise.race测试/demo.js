// 178. Promise.race测试

const slow = new Promise((resolve) => setTimeout(() => resolve("slow"), 100));
const fast = new Promise((resolve) => setTimeout(() => resolve("fast"), 10));
Promise.race([slow, fast]).then(console.log);
