// 172. setInterval循环测试

let count = 0;
const timer = setInterval(() => {
  count++;
  console.log('tick', count);
  if (count === 3) clearInterval(timer);
}, 100);
