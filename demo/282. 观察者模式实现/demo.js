// 282. 观察者模式实现

class Subject {
  constructor() {
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }
  notify(data) {
    this.observers.forEach((o) => o.update(data));
  }
}
const subject = new Subject();
subject.subscribe({ update: console.log });
subject.notify('changed');
