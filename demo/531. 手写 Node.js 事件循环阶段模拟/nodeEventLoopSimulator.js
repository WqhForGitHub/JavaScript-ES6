/**
 * 手写 Node.js 事件循环阶段模拟
 *
 * 作用：模拟 Node.js 事件循环的主要阶段，帮助理解每个阶段执行什么任务。
 *       Node 事件循环主要包含以下阶段（按顺序循环）：
 *         1. timers    —— 执行 setTimeout / setInterval 到期的回调
 *         2. pending callbacks —— 执行上一轮延迟的 I/O 回调
 *         3. idle, prepare —— 内部使用
 *         4. poll      —— 拉取新的 I/O 事件，执行 I/O 回调
 *         5. check     —— 执行 setImmediate 回调
 *         6. close callbacks —— 执行 close 事件回调
 *       此外 microtask 队列（Promise.then、process.nextTick）在阶段切换之间执行，
 *       其中 nextTick 优先级高于 Promise。
 *
 * 实现思路：
 *   - 用数组维护每个阶段的任务队列
 *   - 用 setTimeout 模拟一个 tick 周期
 *   - 在每个阶段执行完后清空 nextTick 队列与 microtask 队列
 *   - run() 启动循环，直到所有队列都空时停止
 */

class NodeEventLoopSimulator {
  constructor() {
    this.queues = {
      timers: [], // setTimeout / setInterval 回调
      pending: [], // 延迟 I/O 回调
      poll: [], // I/O 回调
      check: [], // setImmediate 回调
      close: [], // close 回调
    };
    this.nextTickQueue = []; // process.nextTick
    this.microtaskQueue = []; // Promise.then
    this.running = false;
  }

  // 注册定时器
  setTimeout(fn, delay = 0) {
    const due = Date.now() + delay;
    this.queues.timers.push({ due, fn });
    this._kick();
  }

  // setImmediate -> check 阶段
  setImmediate(fn) {
    this.queues.check.push(fn);
    this._kick();
  }

  // I/O 回调 -> poll 阶段
  addPollCallback(fn) {
    this.queues.poll.push(fn);
    this._kick();
  }

  // process.nextTick -> nextTick 队列
  nextTick(fn) {
    this.nextTickQueue.push(fn);
    this._kick();
  }

  // Promise 微任务
  enqueueMicrotask(fn) {
    this.microtaskQueue.push(fn);
    this._kick();
  }

  // 清空微任务队列（nextTick 优先）
  _drainMicrotasks() {
    while (this.nextTickQueue.length > 0 || this.microtaskQueue.length > 0) {
      while (this.nextTickQueue.length > 0) {
        const cb = this.nextTickQueue.shift();
        cb();
      }
      while (this.microtaskQueue.length > 0) {
        const cb = this.microtaskQueue.shift();
        cb();
      }
    }
  }

  // 判断是否还有任务
  _hasWork() {
    return (
      this.queues.timers.length > 0 ||
      this.queues.pending.length > 0 ||
      this.queues.poll.length > 0 ||
      this.queues.check.length > 0 ||
      this.queues.close.length > 0 ||
      this.nextTickQueue.length > 0 ||
      this.microtaskQueue.length > 0
    );
  }

  // 启动循环
  _kick() {
    if (this.running) return;
    this.running = true;
    // 用 setTimeout(0) 模拟进入下一个 tick
    setTimeout(() => this._tick(), 0);
  }

  // 单个 tick
  _tick() {
    // 1. timers 阶段：执行到期回调
    const now = Date.now();
    const readyTimers = [];
    const remainingTimers = [];
    for (const t of this.queues.timers) {
      if (t.due <= now) readyTimers.push(t);
      else remainingTimers.push(t);
    }
    this.queues.timers = remainingTimers;
    for (const t of readyTimers) t.fn();
    this._drainMicrotasks();

    // 2. pending callbacks 阶段
    const pending = this.queues.pending;
    this.queues.pending = [];
    for (const cb of pending) cb();
    this._drainMicrotasks();

    // 3. poll 阶段：执行 I/O 回调
    const poll = this.queues.poll;
    this.queues.poll = [];
    for (const cb of poll) cb();
    this._drainMicrotasks();

    // 4. check 阶段：执行 setImmediate
    const checks = this.queues.check;
    this.queues.check = [];
    for (const cb of checks) cb();
    this._drainMicrotasks();

    // 5. close callbacks 阶段
    const closes = this.queues.close;
    this.queues.close = [];
    for (const cb of closes) cb();
    this._drainMicrotasks();

    // 判断是否继续下一轮
    if (this._hasWork()) {
      setTimeout(() => this._tick(), 0);
    } else {
      this.running = false;
    }
  }
}

// ===== 测试 =====

// 注意：本测试依赖宿主环境的 setTimeout，故执行顺序与传统 Node 行为一致
const loop = new NodeEventLoopSimulator();

const order = [];

loop.setTimeout(() => order.push('timer'), 10);
loop.setImmediate(() => order.push('immediate'));
loop.addPollCallback(() => order.push('poll/io'));

loop.nextTick(() => order.push('nextTick1'));
loop.nextTick(() => order.push('nextTick2'));

loop.enqueueMicrotask(() => order.push('microtask'));

// nextTick 与 microtask 会在阶段切换前清空
setTimeout(() => {
  console.log('执行顺序:', order);
  // 期望顺序大致为:
  // ['nextTick1', 'nextTick2', 'microtask', 'poll/io', 'immediate', 'timer']
  // 因为 nextTick 优先于 microtask，poll 阶段执行 I/O 回调，
  // 然后 check 阶段执行 immediate，最后 timers 到期执行 timer
}, 50);

// 验证 nextTick 优先于 Promise
const loop2 = new NodeEventLoopSimulator();
const order2 = [];
loop2.nextTick(() => order2.push('nextTick'));
loop2.enqueueMicrotask(() => order2.push('promise'));
loop2.setImmediate(() => {
  console.log('nextTick 先于 promise:', order2); // ['nextTick', 'promise']
});
