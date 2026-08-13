// 202. 微任务优先队列

const queue = [];
function addTask(priority, fn) {
  queue.push({ priority, fn });
  queue.sort((a, b) => b.priority - a.priority);
}
addTask(1, () => console.log('low'));
addTask(10, () => console.log('high'));
Promise.resolve().then(() => {
  while (queue.length) queue.shift().fn();
});
