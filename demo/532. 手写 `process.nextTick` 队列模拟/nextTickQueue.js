/**
 * 手写 `process.nextTick` 队列模拟
 *
 * 作用：模拟 Node.js 中 process.nextTick 的行为。
 *       process.nextTick 注册的回调会在当前操作完成后、事件循环继续之前执行，
 *       优先级高于 Promise 的微任务队列，并且是递归清空的（执行过程中新加入的也会被清空）。
 *
 * 实现思路：
 *   - 维护一个 FIFO 的 nextTick 队列
 *   - nextTick(fn) 入队后，标记需要"drain"
 *   - 在当前同步代码执行完后（用微任务模拟"当前操作结束"），递归清空整个队列
 *   - 队列清空过程中新加入的 nextTick 也会在本轮清空，这点和 Node 行为一致
 */

const nextTickQueue = {
  _queue: [],
  _scheduled: false,

  // 注册一个 nextTick 回调
  nextTick(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('The "callback" argument must be of type function');
    }
    this._queue.push(fn);
    this._scheduleDrain();
  },

  // 安排一次 drain：用 Promise.resolve().then 模拟微任务时机
  _scheduleDrain() {
    if (this._scheduled) return;
    this._scheduled = true;
    Promise.resolve().then(() => this._drain());
  },

  // 递归清空队列
  _drain() {
    this._scheduled = false;
    // 复制引用，循环中 push 的会进入 _queue，下一轮继续处理
    while (this._queue.length > 0) {
      const cb = this._queue.shift();
      try {
        cb();
      } catch (err) {
        // Node 中 nextTick 回调抛错会进程退出，这里只打印
        console.error('nextTick callback error:', err);
      }
    }
  },
};

// ===== 测试 =====

const order = [];

nextTickQueue.nextTick(() => {
  order.push('tick1');
  // 在 tick1 中再注册一个 nextTick，会在本轮一并执行
  nextTickQueue.nextTick(() => order.push('tick1-inner'));
});
nextTickQueue.nextTick(() => order.push('tick2'));

Promise.resolve().then(() => order.push('promise'));

console.log('sync start');
order.push('sync');

// 等所有微任务执行完
setTimeout(() => {
  console.log('执行顺序:', order);
  // 期望: ['sync start' -> push 'sync', 'tick1', 'tick1-inner', 'tick2', 'promise']
  // 即 ['sync', 'tick1', 'tick1-inner', 'tick2', 'promise']
  // 说明 nextTick 比 Promise 先执行，且 tick1 中注册的 tick1-inner 也在本轮清空
}, 0);

// 验证：nextTick 优先级高于 Promise
const order2 = [];
nextTickQueue.nextTick(() => order2.push('nextTick'));
Promise.resolve().then(() => order2.push('promise'));
setTimeout(() => {
  console.log('nextTick 先于 promise:', order2); // ['nextTick', 'promise']
}, 0);
