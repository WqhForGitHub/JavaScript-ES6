/**
 * 手写 Promise 并发限制调度器
 *
 * 需求：给定一个任务队列，任意时刻最多只有 limit 个任务「正在执行」，
 *      某个任务完成后立即从队列取出下一个任务执行。
 *
 * 思路：
 *   - 维护一个并发池（正在执行的任务 Set）和一个等待队列（FIFO）
 *   - add(task) 把任务入队，并尝试触发调度
 *   - 调度时：只要池未满且队列非空，就取出一个任务执行
 *   - 任务完成（无论成功失败）后从池中移除，并再次触发调度
 *   - add 返回一个 Promise，让调用方能拿到任务结果
 *
 * 关键点：用 Promise 包裹任务，把任务的 resolve/reject 透传给调用方，
 *        同时用 finally 维护池容量与触发下一轮调度。
 */

class PromiseScheduler {
  constructor(maxConcurrency) {
    this.max = maxConcurrency;
    this.queue = []; // { task, resolve, reject }
    this.running = new Set(); // 正在执行的 Promise
  }

  add(task) {
    // task 是返回 Promise 的函数
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._schedule();
    });
  }

  _schedule() {
    while (this.running.size < this.max && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();

      // 真正执行任务，拿到结果 Promise
      const p = Promise.resolve()
        .then(() => task())
        .then(resolve, reject)
        .finally(() => {
          this.running.delete(p);
          this._schedule(); // 空出一个位置，继续调度
        });

      this.running.add(p);
    }
  }

  // 等所有任务执行完毕（用于测试收尾）
  idle() {
    return this.queue.length === 0 && this.running.size === 0;
  }
}

// ===== 测试 =====

// 模拟一个异步任务：delay 毫秒后返回 name
function makeTask(name, delay, fail = false) {
  return () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`  [done] ${name} @ ${delay}ms`);
        fail ? reject(name + " fail") : resolve(name);
      }, delay);
    });
}

(async () => {
  const scheduler = new PromiseScheduler(2); // 并发上限 2

  const tasks = [
    scheduler.add(makeTask("A", 50)),
    scheduler.add(makeTask("B", 30)),
    scheduler.add(makeTask("C", 40, true)), // C 会失败
    scheduler.add(makeTask("D", 20)),
    scheduler.add(makeTask("E", 10)),
  ];

  const results = await Promise.allSettled(tasks);
  console.log("results:", results.map((r) => r.status + ":" + (r.value ?? r.reason)));
  // 期望顺序：A,B,C,D,E 中失败的是 C
  // results: [ 'fulfilled:A', 'fulfilled:B', 'rejected:C fail', 'fulfilled:D', 'fulfilled:E' ]

  // 验证并发上限：最多同时 2 个，所以 [done] 时间戳不会有 3 个重叠在执行期
  console.log("scheduler idle:", scheduler.idle()); // scheduler idle: true
})();
