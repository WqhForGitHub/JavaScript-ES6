// 235. 事件绑定系统

class EventBinder {
  constructor() {
    this.records = [];
  }
  on(target, type, handler) {
    target.addEventListener(type, handler);
    this.records.push({ target, type, handler });
  }
  offAll() {
    this.records.forEach(({ target, type, handler }) =>
      target.removeEventListener(type, handler),
    );
    this.records = [];
  }
}
console.log(new EventBinder());
