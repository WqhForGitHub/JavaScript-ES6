class ThreadPool {
  constructor(public size: number) { }
  run(task: () => void) { console.log('running task'); task(); }
}

// Node.js 里虽然没有线程池，但概念一样
const tp1 = new ThreadPool(4);
const tp2 = new ThreadPool(4); // 又开了 4 个线程

export { }