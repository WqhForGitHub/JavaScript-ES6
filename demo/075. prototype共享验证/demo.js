// 75. prototype共享验证

function Counter() {}
Counter.prototype.increment = function () {
  this.count = (this.count || 0) + 1;
};
const a = new Counter();
const b = new Counter();
a.increment();
console.log(a.count, b.count, a.increment === b.increment);
