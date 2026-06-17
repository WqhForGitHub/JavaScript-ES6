// 60. 函数节流队列

function createQueue(delay) {
  const tasks = [];
  let running = false;
  const run = () => {
    if (!tasks.length) {
      running = false;
      return;
    }
    running = true;
    tasks.shift()();
    setTimeout(run, delay);
  };
  return (task) => {
    tasks.push(task);
    if (!running) run();
  };
}
const enqueue = createQueue(100);
[1, 2, 3].forEach((n) => enqueue(() => console.log(n)));
