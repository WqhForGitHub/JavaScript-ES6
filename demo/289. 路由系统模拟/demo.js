// 289. 路由系统模拟

class RouterSystem {
  constructor() {
    this.routes = [];
  }
  add(path, handler) {
    this.routes.push({ path, handler });
  }
  dispatch(path) {
    const route = this.routes.find((r) => r.path === path);
    return route ? route.handler() : '404';
  }
}
const router = new RouterSystem();
router.add('/', () => 'home');
console.log(router.dispatch('/'));
