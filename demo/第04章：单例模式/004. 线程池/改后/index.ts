class ThreadPool {
  private static instance: ThreadPool;
  constructor(public size: number) { }

  static getInstance(size: number = 4): ThreadPool {
    if (!ThreadPool.instance) ThreadPool.instance = new ThreadPool(size);
    return ThreadPool.instance;
  }

  run(task: () => void) { console.log('running task'); task(); }
}

const tp = ThreadPool.getInstance();

export { }