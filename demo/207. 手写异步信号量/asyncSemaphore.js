/**
 * 手写异步信号量
 *
 * 经典信号量（Semaphore）模型：维护一个「许可数」n，
 *   - acquire()：申请一个许可；若 n>0 则立即拿到（n--），否则等待
 *   - release()：归还一个许可（n++），并唤醒一个等待者
 *
 * 异步版：acquire() 返回 Promise，许可不足时挂起，等 release 后 resolve。
 *
 * 典型用途：限制并发（n 个许可 = 最多 n 个并发）。
 *   与「并发池」思路不同：信号量更通用，调用方主动 acquire/release，
 *   可以包裹任意一段临界区。
 *
 * 实现：
 *   - 用队列保存等待者的 resolve 函数
 *   - acquire：n>0 直接 --；否则把 resolve 入队
 *   - release：若队列非空，取出一个 resolve 并调用（许可直接「转交」给等待者，
 *     不增加 n）；否则 n++（没有等待者时归还许可）
 */

class AsyncSemaphore {
  constructor(initial = 1) {
    if (initial < 0) throw new RangeError("initial must be >= 0");
    this._permits = initial;
    this._waiters = []; // 队列：保存 resolve 回调
  }

  acquire() {
    return new Promise((resolve) => {
      if (this._permits > 0) {
        this._permits--;
        resolve();
      } else {
        this._waiters.push(resolve);
      }
    });
  }

  release() {
    if (this._waiters.length > 0) {
      // 直接把许可交给下一个等待者，permits 数量不变
      const next = this._waiters.shift();
      next();
    } else {
      // 没有等待者，归还许可
      this._permits++;
    }
  }

  get available() {
    return this._permits;
  }

  // 便捷用法：在临界区内执行 fn，执行完自动 release
  async withPermit(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// ===== 测试 =====

// 1. 基本计数信号量（initial=1，相当于互斥锁）
(async () => {
  const sem = new AsyncSemaphore(1);
  let counter = 0;

  async function critical(name, ms) {
    await sem.acquire();
    try {
      console.log(`  ${name} enter, counter=${counter}`);
      counter++; // 临界区：不会并发，所以 counter 不会被打断
      await new Promise((r) => setTimeout(r, ms));
      counter--;
      console.log(`  ${name} leave, counter=${counter}`);
    } finally {
      sem.release();
    }
  }

  await Promise.all([critical("A", 30), critical("B", 20), critical("C", 10)]);
  console.log("mutex done, counter:", counter); // mutex done, counter: 0
})();

// 2. 多许可：限制并发为 2
(async () => {
  const sem = new AsyncSemaphore(2);
  let running = 0;
  let maxRunning = 0;

  async function job(i) {
    await sem.acquire();
    try {
      running++;
      maxRunning = Math.max(maxRunning, running);
      console.log(`  job ${i} start (running=${running})`);
      await new Promise((r) => setTimeout(r, 20));
      running--;
    } finally {
      sem.release();
    }
  }

  await Promise.all([1, 2, 3, 4, 5].map(job));
  console.log("max concurrent (expect <=2):", maxRunning); // max concurrent (expect <=2): 2
})();

// 3. withPermit 便捷用法
(async () => {
  const sem = new AsyncSemaphore(1);
  const results = [];
  await Promise.all(
    [1, 2, 3].map((i) =>
      sem.withPermit(async () => {
        results.push(i);
        await new Promise((r) => setTimeout(r, 10));
      }),
    ),
  );
  console.log("withPermit order:", results); // withPermit order: [1,2,3]
})();
