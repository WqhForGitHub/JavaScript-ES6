// 209. 并发锁机制

class Mutex {
  constructor() {
    this.locked = false;
    this.waiting = [];
  }
  lock() {
    return new Promise((resolve) =>
      this.locked
        ? this.waiting.push(resolve)
        : ((this.locked = true), resolve(this.unlock.bind(this))),
    );
  }
  unlock() {
    const next = this.waiting.shift();
    next ? next(this.unlock.bind(this)) : (this.locked = false);
  }
}
const mutex = new Mutex();
mutex.lock().then((unlock) => {
  console.log("task1");
  unlock();
});
mutex.lock().then((unlock) => {
  console.log("task2");
  unlock();
});
