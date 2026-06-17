// 244. hash路由实现

class HashRouter {
  constructor() {
    this.routes = {};
  }
  add(path, handler) {
    this.routes[path] = handler;
  }
  start() {
    if (typeof window === "undefined") return;
    window.addEventListener("hashchange", () => this.resolve());
    this.resolve();
  }
  resolve() {
    const path = location.hash.slice(1) || "/";
    (this.routes[path] || (() => console.log("not found")))();
  }
}
console.log(new HashRouter());
