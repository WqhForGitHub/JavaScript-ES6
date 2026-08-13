// 194. 发布订阅模式

class PubSub {
  constructor() {
    this.map = {};
  }
  subscribe(type, fn) {
    (this.map[type] ||= []).push(fn);
  }
  publish(type, data) {
    (this.map[type] || []).forEach((fn) => fn(data));
  }
}
const ps = new PubSub();
ps.subscribe('news', console.log);
ps.publish('news', 'JavaScript');
