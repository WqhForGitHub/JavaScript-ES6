class EventBus {
  constructor() { this.events = {}; }
  on(name, fn) { (this.events[name] = this.events[name] || []).push(fn); return () => this.off(name, fn); }
  off(name, fn) { if (this.events[name]) this.events[name] = this.events[name].filter(f => f !== fn); }
  once(name, fn) { const w = (...a) => { fn(...a); this.off(name, w); }; this.on(name, w); }
  emit(name, ...args) { (this.events[name] || []).forEach(f => f(...args)); }
}
const bus = new EventBus();
const log = id => `<div>#${id} 订阅者收到消息</div>`;
let n = 1;
bus.on("msg", data => { document.getElementById("log").innerHTML += `<div>订阅者 A：${data}</div>`; });
const offB = bus.on("msg", data => { document.getElementById("log").innerHTML += `<div>订阅者 B：${data}</div>`; });
bus.once("msg", () => { document.getElementById("log").innerHTML += `<div>once 订阅者（只触发一次）</div>`; });
document.getElementById("pub").onclick = () => { bus.emit("msg", "第 " + (n++) + " 条消息"); if (n === 3) { offB(); document.getElementById("log").innerHTML += "<div color='#ffa'>订阅者 B 已取消</div>"; } };