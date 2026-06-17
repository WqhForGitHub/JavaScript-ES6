// 116. 静态属性测试

class Counter {
  static total = 0;
  constructor() {
    Counter.total++;
  }
}
new Counter();
new Counter();
console.log(Counter.total);
