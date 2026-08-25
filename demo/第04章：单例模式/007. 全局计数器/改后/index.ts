class Counter {
  private static instance: Counter;
  count = 0;

  private constructor() { }
  static getInstance(): Counter {
    if (!Counter.instance) Counter.instance = new Counter();
    return Counter.instance;
  }

  inc() { this.count++; }
}

Counter.getInstance().inc();
Counter.getInstance().inc();
console.log(Counter.getInstance().count); // 2 ✅

export { }