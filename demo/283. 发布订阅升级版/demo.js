// 283. 发布订阅升级版

class PubSub {
  constructor() {
    this.events = new Map();
  }
  on(type, handler) {
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(handler);
    return () => this.events.get(type).delete(handler);
  }
  emit(type, payload) {
    (this.events.get(type) || []).forEach((h) => h(payload));
  }
}
const bus = new PubSub();
bus.on('login', console.log);
bus.emit('login', { user: 'Alice' });
