/**
 * 手写单调队列
 * 功能：维护一个队列，支持 O(1) 获取最大/最小值
 * 实现：双端队列，保持单调性
 */
class MonotonicQueue {
  constructor(mode = 'max') { this.deque = []; this.mode = mode; } // 'max' or 'min'
  push(val) {
    if (this.mode === 'max') { while (this.deque.length && this.deque[this.deque.length - 1] < val) this.deque.pop(); }
    else { while (this.deque.length && this.deque[this.deque.length - 1] > val) this.deque.pop(); }
    this.deque.push(val);
  }
  pop(val) { if (this.deque.length && this.deque[0] === val) this.deque.shift(); }
  top() { return this.deque[0]; }
  size() { return this.deque.length; }
}
// ===== 测试 =====
const mq = new MonotonicQueue('max');
[1, 3, -1, -3, 5, 3, 6, 7].forEach((v, i) => {
  if (i >= 3) mq.pop([1, 3, -1, -3, 5, 3, 6, 7][i - 3]);
  mq.push(v);
  if (i >= 2) console.log('窗口[' + (i-2) + ',' + i + '] 最大值:', mq.top());
});
// 窗口[0,2]: 3, [1,3]: 3, [2,4]: 5, [3,5]: 5, [4,6]: 6, [5,7]: 7
