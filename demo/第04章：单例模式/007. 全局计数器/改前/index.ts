class Counter {
  count = 0;
  inc() { this.count++; }
}

const c1 = new Counter();
const c2 = new Counter();
c1.inc(); c1.inc();
console.log(c2.count); // 0 —— 不是同一个计数器