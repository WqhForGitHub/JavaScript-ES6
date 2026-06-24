/**
 * 手写事件循环模拟
 *
 * 目标：用一个简化模型演示 Node/浏览器事件循环的核心结构：
 *   - 同步任务直接执行
 *   - 微任务队列（microtask）：Promise.then / queueMicrotask / process.nextTick
 *   - 宏任务队列（macrotask）：setTimeout / setInterval / I/O
 *   - 执行规则：
 *       1. 执行一段同步代码（脚本本身）
 *       2. 清空所有微任务（执行微任务时新产生的微任务也要在本次清空）
 *       3. 取一个宏任务执行
 *       4. 回到第 2 步，循环往复
 *
 * 注意：这是「教学用」简化模拟，不能 100% 复现真实事件循环的全部细节
 *     （如 Node 的多个阶段、process.nextTick 优先级、渲染阶段等）。
 *
 * 这里实现一个 EventLoop 类：
 *   - addMicrotask(fn) / addMacrotask(fn)
 *   - run() 启动循环，直到两个队列都空
 */

class EventLoopSimulator {
  constructor() {
    this.microtasks = [];
    this.macrotasks = [];
    this.running = false;
    this.tick = 0;
  }

  addMicrotask(fn) {
    this.microtasks.push(fn);
  }

  addMacrotask(fn) {
    this.macrotasks.push(fn);
  }

  // 模拟 Promise.resolve().then：把回调塞进微任务队列
  microtask(fn) {
    this.addMicrotask(fn);
  }

  // 模拟 setTimeout：把回调塞进宏任务队列
  setTimeout(fn) {
    this.addMacrotask(fn);
  }

  // 清空所有微任务（执行中产生的新微任务也要本次清完）
  _drainMicrotasks() {
    while (this.microtasks.length > 0) {
      const fn = this.microtasks.shift();
      fn();
    }
  }

  async run() {
    this.running = true;
    // 先清一次微任务（模拟脚本同步执行后）
    this._drainMicrotasks();

    while (this.macrotasks.length > 0) {
      this.tick++;
      // 1. 取一个宏任务执行
      const fn = this.macrotasks.shift();
      fn();
      // 2. 清空本次产生的所有微任务
      this._drainMicrotasks();
    }

    this.running = false;
    console.log("[loop] all tasks done, ticks =", this.tick);
  }
}

// ===== 测试 =====

// 用同步驱动来模拟，因为真实 setTimeout 是异步的，
// 这里用「先收集后 run」的方式演示执行顺序。

const loop = new EventLoopSimulator();

console.log("== 同步开始 ==");

// 模拟 setTimeout(() => console.log('macro1'), 0)
loop.setTimeout(() => {
  console.log("macro1");
  // 宏任务里产生微任务
  loop.microtask(() => console.log("  micro inside macro1"));
});

// 模拟 Promise.resolve().then(...)
loop.microtask(() => {
  console.log("micro1");
  // 微任务里再产生微任务（同一次清空阶段执行）
  loop.microtask(() => console.log("  micro2 (chained)"));
});

loop.setTimeout(() => {
  console.log("macro2");
  // 宏任务里再产生宏任务
  loop.setTimeout(() => console.log("  macro3 (from macro2)"));
});

console.log("== 同步结束，开始 run ==");

loop.run();

// 期望输出顺序：
// == 同步开始 ==
// == 同步结束，开始 run ==
// micro1
//   micro2 (chained)
// macro1
//   micro inside macro1
// macro2
//   macro3 (from macro2)
// [loop] all tasks done, ticks = 3
//
// 关键点：
//  - 所有同步代码先跑完
//  - micro1 / micro2 在第一个宏任务之前全部清空
//  - 每个 macro 执行后又清空它产生的 micro
//  - macro3 由 macro2 产生，排在后面，需要新的一轮 tick
