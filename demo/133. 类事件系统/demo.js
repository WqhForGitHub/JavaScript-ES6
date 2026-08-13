// 133. 类事件系统

class EventBus {
  constructor() {
    this.events = {};
  }
  on(type, fn) {
    (this.events[type] ||= []).push(fn);
  }
  emit(type, data) {
    (this.events[type] || []).forEach((fn) => fn(data));
  }
}
const bus = new EventBus();
bus.on('ready', console.log);
bus.emit('ready', 'ok');
