// 245. history路由实现

class HistoryRouter {
  constructor() {
    this.routes = new Map();
  }
  add(path, handler) {
    this.routes.set(path, handler);
  }
  push(path) {
    if (typeof history !== 'undefined') history.pushState({}, '', path);
    this.resolve(path);
  }
  resolve(path) {
    const h = this.routes.get(path);
    if (h) h();
  }
}
console.log(new HistoryRouter());
