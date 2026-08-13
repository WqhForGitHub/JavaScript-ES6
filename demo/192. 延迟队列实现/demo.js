// 192. 延迟队列实现

class DelayQueue {
  add(task, delay) {
    setTimeout(task, delay);
  }
}
const queue = new DelayQueue();
queue.add(() => console.log('after 50ms'), 50);
queue.add(() => console.log('after 100ms'), 100);
