/**
 * 手写异步队列
 *
 * 需求：实现一个「先进先出」的异步任务队列。
 *   - enqueue(task) 把任务（返回 Promise 的函数）加入队尾，返回一个 Promise
 *     让调用方拿到结果
 *   - 队列内的任务「一个接一个」串行执行（前一个完成才执行下一个）
 *   - 可选配置 continueOnError：
 *       true（默认）：前一个失败不影响后续任务执行
 *       false：一旦有任务失败，后续任务全部跳过（不再执行）
 *
 * 与 196 调度器区别：调度器是「并发池」，本队列强调「严格串行 FIFO」。
 *
 * 思路：维护一个「当前链尾 Promise」tail，每次入队时把新任务接到 tail 之后。
 *   - tail 始终保持 resolved 状态（错误被吞掉），避免链上 unhandled rejection
 *   - 用一个 _aborted 标志实现「失败即停止」：一旦置位，后续任务的 run 直接
 *     reject（不再调用 task()），但 tail 仍 resolved，链不会断
 *   - 调用方拿到的是每个任务自己的 run Promise，需要自行处理其 reject
 */

class AsyncQueue {
  constructor(options = {}) {
    this.continueOnError = options.continueOnError ?? true;
    this._tail = Promise.resolve();
    this._size = 0;
    this._aborted = false;
    this._abortReason = null;
  }

  enqueue(task) {
    this._size++;
    // run：调用方拿到的结果 Promise
    const run = this._tail.then(() => {
      if (this._aborted) throw this._abortReason; // 已中止：跳过本任务
      return task();
    });

    // 更新链尾：成功/失败都把 tail 维持成 resolved，
    // 失败时若 fail-stop 则置位 _aborted，让后续任务跳过
    this._tail = run.then(
      () => {},
      (err) => {
        if (!this.continueOnError) {
          this._aborted = true;
          this._abortReason = err;
        }
        // 吞掉错误，保持 tail resolved，链不断
      }
    );

    return run.finally(() => this._size--);
  }

  get size() {
    return this._size;
  }

  // 是否因 fail-stop 而中止
  get aborted() {
    return this._aborted;
  }

  // 等待队列全部执行完（已入队任务都走完一轮 tail）
  drain() {
    return this._tail;
  }

  // 重置中止状态（清空后可继续使用）
  clear() {
    this._tail = Promise.resolve();
    this._size = 0;
    this._aborted = false;
    this._abortReason = null;
  }
}

// ===== 测试 =====

function makeTask(name, delay, fail = false) {
  return () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`  [${name}] done`);
        fail ? reject(new Error(name + " fail")) : resolve(name);
      }, delay);
    });
}

(async () => {
  console.log("== 串行执行 ==");
  const q = new AsyncQueue();
  q.enqueue(makeTask("A", 50));
  q.enqueue(makeTask("B", 30));
  q.enqueue(makeTask("C", 20));
  await q.drain();
  console.log("size after drain:", q.size); // size after drain: 0
  // 顺序：A -> B -> C

  console.log("\n== 拿到结果 ==");
  const q2 = new AsyncQueue();
  const r = await q2.enqueue(makeTask("X", 20));
  console.log("got:", r); // got: X

  console.log("\n== 失败也继续 ==");
  const q3 = new AsyncQueue({ continueOnError: true });
  const p1 = q3.enqueue(makeTask("M", 20, true));
  const p2 = q3.enqueue(makeTask("N", 20));
  try {
    await p1;
  } catch (e) {
    console.log("M failed:", e.message); // M failed: M fail
  }
  console.log("N result:", await p2); // N result: N（M 失败不影响 N）

  console.log("\n== 失败即停止 ==");
  const q4 = new AsyncQueue({ continueOnError: false });
  const pTask = q4.enqueue(makeTask("P", 20, true));
  pTask.catch((e) => console.log("P failed (expected):", e.message));
  const qTask = q4.enqueue(makeTask("Q", 20)); // Q 应被跳过，不执行
  qTask.catch((e) => console.log("Q skipped (expected):", e.message));
  await q4.drain();
  console.log("queue aborted:", q4.aborted); // queue aborted: true
  // Q 不会打印 [Q] done，因为 P 失败后队列中止
})();
