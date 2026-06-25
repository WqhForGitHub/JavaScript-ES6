/**
 * 手写 History API 路由
 *
 * History API 作用：
 *   - pushState/replaceState 修改 URL 而不刷新页面
 *   - popstate 监听前进/后退
 *   - 适合 SPA 前端路由
 *
 * 实现思路：
 *   1. 路由表：path -> handler
 *   2. navigate(path)：pushState + 触发 handler
 *   3. 监听 popstate：处理浏览器前进/后退
 *   4. 路由参数解析（动态段 :id）
 *   5. Node 环境：mock history/location/popstate
 */

// 跨环境 mock
function getHistoryEnv() {
  if (typeof window !== "undefined") {
    return {
      history: window.history,
      location: window.location,
      addPopStateListener: (fn) => window.addEventListener("popstate", fn),
      getPath: () => window.location.pathname,
    };
  }
  // Node mock
  let currentPath = "/";
  const listeners = [];
  return {
    history: {
      pushState(state, title, url) {
        currentPath = url;
      },
      replaceState(state, title, url) {
        currentPath = url;
      },
    },
    location: {
      get pathname() {
        return currentPath;
      },
    },
    addPopStateListener(fn) {
      listeners.push(fn);
    },
    _emitPopState(state, path) {
      currentPath = path;
      listeners.forEach((fn) => fn({ state }));
    },
    getPath: () => currentPath,
  };
}

class HistoryRouter {
  constructor() {
    const env = getHistoryEnv();
    this.history = env.history;
    this.location = env.location;
    this.env = env;
    this.routes = []; // { pattern, segments, handler }
    this.beforeHooks = [];
    this.notFound = null;
    this.current = null;

    env.addPopStateListener((e) => {
      this._handle(env.getPath(), e.state);
    });
  }

  // 注册路由
  add(pattern, handler) {
    const segments = pattern
      .split("/")
      .filter(Boolean)
      .map((seg) => ({
        name: seg.startsWith(":") ? seg.slice(1) : null,
        value: seg.startsWith(":") ? null : seg,
      }));
    this.routes.push({ pattern, segments, handler });
    return this;
  }

  // 启动：处理初始路径
  start() {
    return this._handle(this.env.getPath());
  }

  // 导航
  navigate(path, state = {}) {
    this.history.pushState(state, "", path);
    return this._handle(path, state);
  }

  replace(path, state = {}) {
    this.history.replaceState(state, "", path);
    return this._handle(path, state);
  }

  // 全局前置守卫
  beforeEach(fn) {
    this.beforeHooks.push(fn);
    return this;
  }

  // 匹配路由
  _match(path) {
    const parts = path.split("/").filter(Boolean);
    for (const route of this.routes) {
      if (route.segments.length !== parts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < parts.length; i++) {
        const seg = route.segments[i];
        if (seg.name) {
          params[seg.name] = decodeURIComponent(parts[i]);
        } else if (seg.value !== parts[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { route, params };
    }
    return null;
  }

  async _handle(path, state = {}) {
    // 前置守卫
    for (const hook of this.beforeHooks) {
      const ok = await hook(path, this.current?.path);
      if (ok === false) return; // 拦截
    }
    const matched = this._match(path);
    this.current = { path, params: matched?.params || {}, state };
    if (matched) {
      matched.route.handler(matched.params, state);
    } else if (this.notFound) {
      this.notFound(path);
    }
  }

  // 模拟浏览器前进/后退（测试用）
  _back(path, state) {
    this.env._emitPopState?.(state, path);
  }
}

// ===== 测试 =====
(async () => {
  const router = new HistoryRouter();
  const visits = [];

  // 注册路由
  router.add("/", () => visits.push("home"));
  router.add("/users", () => visits.push("users-list"));
  router.add("/users/:id", (params) => visits.push(`user-${params.id}`));
  router.add("/posts/:postId/comments/:cid", (params) =>
    visits.push(`comment-${params.postId}-${params.cid}`),
  );
  router.notFound = (path) => visits.push(`404:${path}`);

  // 前置守卫
  router.beforeEach((to, from) => {
    visits.push(`guard:${to}${from ? "<-" + from : ""}`);
    return true;
  });

  await router.start();
  console.log("初始:", visits); // ['guard:/', 'home']

  // --- 导航 ---
  await router.navigate("/users");
  await router.navigate("/users/42");
  await router.navigate("/posts/1/comments/5");
  console.log("导航后:", visits);
  // ['guard:/', 'home', 'guard:/users<-/', 'users-list',
  //  'guard:/users/42<-/users', 'user-42',
  //  'guard:/posts/1/comments/5<-/users/42', 'comment-1-5']

  // --- 动态参数解析 ---
  const matched = router._match("/users/abc");
  console.log("参数:", matched.params); // { id: 'abc' }

  // --- 404 ---
  await router.navigate("/unknown");
  console.log("含 404:", visits.slice(-2)); // ['guard:/unknown<-/posts/1/comments/5', '404:/unknown']

  // --- 拦截 ---
  const router2 = new HistoryRouter();
  const log2 = [];
  router2.add("/secret", () => log2.push("secret"));
  router2.beforeEach(() => false); // 全部拦截
  await router2.start();
  await router2.navigate("/secret");
  console.log("拦截后未执行:", log2); // []

  console.log("History API 路由演示完成");
})();
