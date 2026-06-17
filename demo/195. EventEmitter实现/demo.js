// 195. EventEmitter实现

class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(type, fn) {
    (this.events[type] ||= []).push(fn);
    return this;
  }
  off(type, fn) {
    this.events[type] = (this.events[type] || []).filter((item) => item !== fn);
  }
  emit(type, ...args) {
    (this.events[type] || []).forEach((fn) => fn(...args));
  }
}
new EventEmitter().on("data", console.log).emit("data", "ok");
