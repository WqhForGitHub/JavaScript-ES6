// 228. 定时器管理器

class TimerManager {
  constructor() {
    this.timers = new Set();
  }
  set(fn, delay) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, delay);
    this.timers.add(id);
    return id;
  }
  clearAll() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }
}
new TimerManager().set(() => console.log("done"), 10);
