/**
 * MiniRouter - 简易前端路由系统
 * 实现：hash 路由 / history 路由 · 路由守卫 · 动态参数 · 嵌套渲染
 *
 * 设计：
 * - RouteTable：注册路由表，支持动态参数 :id
 * - Guards：beforeEach / afterEach，支持返回 false 或重定向
 * - Mode：hash | history，可切换
 */
class MiniRouter {
  /**
   * @param {Object} options
   * @param {'hash'|'history'} options.mode
   * @param {HTMLElement} options.container 渲染容器
   */
  constructor({ mode = 'hash', container } = {}) {
    this.mode = mode;
    this.container = container;
    this.routes = []; // { path, component, regex, keys }
    this.beforeGuards = []; // [fn(to, from) => boolean | route]
    this.afterGuards = []; // [fn(to, from)]
    this.current = null; // 当前匹配的路由
  }

  // ============ 路由注册 ============
  /**
   * @param {string} path 路径，支持动态参数 '/user/:id'
   * @param {function} component 渲染函数 (params, query) => string | HTMLElement
   */
  route(path, component) {
    const { regex, keys } = this._pathToRegex(path);
    this.routes.push({ path, component, regex, keys });
    return this;
  }

  // 路径转正则：/user/:id → /^\/user\/([^/]+)$/
  _pathToRegex(path) {
    const keys = [];
    const pattern = path.replace(/\/$/, '').replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    return { regex: new RegExp('^' + pattern + '$'), keys };
  }

  // ============ 路由守卫 ============
  beforeEach(fn) {
    this.beforeGuards.push(fn);
    return this;
  }

  afterEach(fn) {
    this.afterGuards.push(fn);
    return this;
  }

  // ============ 匹配路由 ============
  match(path) {
    for (const route of this.routes) {
      const match = route.regex.exec(path);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => {
          params[key] = decodeURIComponent(match[i + 1]);
        });
        return { ...route, params };
      }
    }
    return null;
  }

  // ============ 导航 ============
  push(path) {
    if (this.mode === 'hash') {
      location.hash = path;
    } else {
      history.pushState({}, '', path);
      this.handleRouteChange();
    }
  }

  replace(path) {
    if (this.mode === 'hash') {
      location.replace('#' + path);
    } else {
      history.replaceState({}, '', path);
      this.handleRouteChange();
    }
  }

  back() {
    history.back();
  }
  forward() {
    history.forward();
  }

  // ============ 启动 ============
  start() {
    if (this.mode === 'hash') {
      window.addEventListener('hashchange', () => this.handleRouteChange());
      // 如果没有 hash，设置默认
      if (!location.hash) {
        location.hash = '/';
      } else {
        this.handleRouteChange();
      }
    } else {
      window.addEventListener('popstate', () => this.handleRouteChange());
      // 拦截 a 标签点击
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-link]');
        if (link) {
          e.preventDefault();
          this.push(link.getAttribute('href'));
        }
      });
      this.handleRouteChange();
    }
  }

  // ============ 核心路由处理 ============
  async handleRouteChange() {
    const path = this.getCurrentPath();
    const query = this.parseQuery();
    const to = { path, query, matched: null, params: {} };
    const from = this.current ? { path: this.current.path, params: this.current.params } : null;

    // 匹配路由
    const matched = this.match(path);
    to.matched = matched;
    if (matched) to.params = matched.params;

    // 前置守卫
    for (const guard of this.beforeGuards) {
      const result = await guard(to, from);
      if (result === false) return; // 阻止导航
      if (typeof result === 'string') {
        // 重定向
        this.push(result);
        return;
      }
      if (result && result.path) {
        this.push(result.path);
        return;
      }
    }

    // 渲染
    this.current = to;
    if (matched) {
      this.render(matched.component, matched.params, query);
    } else {
      this.render(
        () => `
        <div style="text-align:center;padding:60px;color:#999">
          <h2 style="color:#e74c3c">404</h2>
          <p>页面未找到：${path}</p>
        </div>
      `,
        {},
        query
      );
    }

    // 后置守卫
    this.afterGuards.forEach((fn) => fn(to, from));

    // 更新导航高亮
    this.updateNav(path);
  }

  // ============ 渲染 ============
  render(component, params, query) {
    const result = component(params, query);
    if (typeof result === 'string') {
      this.container.innerHTML = result;
    } else if (result instanceof HTMLElement) {
      this.container.innerHTML = '';
      this.container.appendChild(result);
    }
  }

  // ============ 工具方法 ============
  getCurrentPath() {
    if (this.mode === 'hash') {
      const hash = location.hash.slice(1);
      return hash.split('?')[0] || '/';
    }
    return location.pathname;
  }

  parseQuery() {
    let qs;
    if (this.mode === 'hash') {
      qs = location.hash.split('?')[1] || '';
    } else {
      qs = location.search.slice(1);
    }
    const params = {};
    new URLSearchParams(qs).forEach((v, k) => {
      params[k] = v;
    });
    return params;
  }

  updateNav(path) {
    document.querySelectorAll('[data-nav]').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === path);
    });
  }
}
