// 196. DOM事件模拟系统

class Node {
  constructor(name) {
    this.name = name;
    this.listeners = {};
  }
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  }
  dispatchEvent(type) {
    (this.listeners[type] || []).forEach((fn) => fn({ type, target: this }));
  }
}
const button = new Node("button");
button.addEventListener("click", (e) => console.log(e.type, e.target.name));
button.dispatchEvent("click");
