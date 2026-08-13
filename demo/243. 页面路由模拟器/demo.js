// 243. 页面路由模拟器

class PageRouter {
  constructor() {
    this.routes = new Map();
  }
  route(path, handler) {
    this.routes.set(path, handler);
  }
  go(path) {
    const h = this.routes.get(path) || this.routes.get('*');
    if (h) h(path);
  }
}
const router = new PageRouter();
router.route('/home', () => console.log('home'));
router.go('/home');
