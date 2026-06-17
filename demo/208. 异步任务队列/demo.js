// 208. 异步任务队列

class AsyncQueue {
  constructor() {
    this.chain = Promise.resolve();
  }
  push(task) {
    this.chain = this.chain.then(task);
    return this.chain;
  }
}
const queue = new AsyncQueue();
queue.push(() => Promise.resolve(console.log("one")));
queue.push(() => Promise.resolve(console.log("two")));
