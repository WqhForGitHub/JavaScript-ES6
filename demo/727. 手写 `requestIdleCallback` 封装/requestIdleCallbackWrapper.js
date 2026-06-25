/**
 * 手写 requestIdleCallback 封装
 *
 * requestIdleCallback 作用：
 *   - 在浏览器空闲期执行低优先级任务，不阻塞关键渲染
 *   - 回调接收 IdleDeadline，可查询剩余时间 timeRemaining()
 *   - 支持 timeout：超时后强制执行
 *
 * 封装目标：
 *   1. 任务队列调度（优先级）
 *   2. Promise 化 idle 等待
 *   3. 大任务切片：把耗时任务拆成小块在多个空闲期执行
 *   4. Node 环境：用 setImmediate/setTimeout 模拟
 */

const ric =
  typeof requestIdleCallback !== "undefined"
    ? requestIdleCallback
    : (cb, options) => {
        const start = Date.now();
        return setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          });
        }, 0);
      };
const cic =
  typeof cancelIdleCallback !== "undefined"
    ? cancelIdleCallback
    : (id) => clearTimeout(id);

class IdleScheduler {
  constructor() {
    this._queue = []; // { task, priority, id }
    this._scheduled = false;
    this._nextId = 1;
  }

  // 添加任务（priority 越大越优先）
  add(task, priority = 0) {
    const id = this._nextId++;
    this._queue.push({ task, priority, id });
    // 按优先级降序
    this._queue.sort((a, b) => b.priority - a.priority);
    this._schedule();
    return id;
  }

  // Promise：在下一个空闲期执行
  nextIdle() {
    return new Promise((resolve) => ric(() => resolve()));
  }

  _schedule() {
    if (this._scheduled) return;
    this._scheduled = true;
    ric((deadline) => {
      this._scheduled = false;
      this._runQueue(deadline);
    });
  }

  _runQueue(deadline) {
    while (this._queue.length > 0 && deadline.timeRemaining() > 0) {
      const item = this._queue.shift();
      try {
        item.task(deadline);
      } catch (e) {
        console.error("[IdleScheduler] 任务异常:", e);
      }
    }
    // 还有任务：继续调度下一个空闲期
    if (this._queue.length > 0) {
      this._schedule();
    }
  }

  cancel(id) {
    this._queue = this._queue.filter((item) => item.id !== id);
  }

  clear() {
    this._queue = [];
  }

  get size() {
    return this._queue.length;
  }
}

/**
 * 大任务切片：把数据分批在空闲期处理
 * @param {Array} items 数据
 * @param {Function} process 处理单条
 * @param {number} chunkSize 每次空闲处理多少条
 * @param {Function} onProgress 进度回调
 */
async function processInIdleChunks(items, process, chunkSize = 10, onProgress) {
  let index = 0;
  const scheduler = new IdleScheduler();
  while (index < items.length) {
    await scheduler.nextIdle();
    const end = Math.min(index + chunkSize, items.length);
    for (let i = index; i < end; i++) {
      process(items[i], i);
    }
    index = end;
    onProgress?.(index, items.length);
  }
}

// 帧预算工具：判断当前是否该让出主线程
function shouldYield(deadline) {
  return deadline.timeRemaining() <= 0;
}

// ===== 测试 =====
(async () => {
  // --- 任务队列 + 优先级 ---
  const order = [];
  const scheduler = new IdleScheduler();
  scheduler.add(() => order.push("low"), 0);
  scheduler.add(() => order.push("high"), 10);
  scheduler.add(() => order.push("mid"), 5);

  await new Promise((r) => setTimeout(r, 50));
  console.log("执行顺序（按优先级）:", order); // ['high', 'mid', 'low']

  // --- nextIdle ---
  await scheduler.nextIdle();
  console.log("空闲期已到达");

  // --- 切片处理 ---
  const data = Array.from({ length: 100 }, (_, i) => i);
  const processed = [];
  const progresses = [];
  await processInIdleChunks(
    data,
    (item) => processed.push(item * 2),
    25,
    (done, total) => progresses.push(`${done}/${total}`),
  );
  console.log("处理数量:", processed.length); // 100
  console.log("首项:", processed[0], "末项:", processed[99]); // 0 198
  console.log("进度:", progresses); // ['25/100', '50/100', '75/100', '100/100']

  // --- 取消任务 ---
  const s2 = new IdleScheduler();
  const id = s2.add(() => {}, 0);
  s2.add(() => {}, 0);
  s2.cancel(id);
  console.log("取消后剩余:", s2.size); // 1

  console.log("requestIdleCallback 封装演示完成");
})();
