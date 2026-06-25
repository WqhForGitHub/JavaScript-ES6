/**
 * 手写 Hash API 路由
 *
 * Hash 路由特点：
 *   - URL 中 # 后的部分变化不触发页面刷新
 *   - 通过 hashchange 事件监听
 *   - 兼容性好，无需服务端配合
 *
 * 实现思路：
 *   1. 路由表：hash -> handler
 *   2. 监听 hashchange
 *   3. 动态参数解析（:id）
 *   4. 编程式导航 setHash
 *   5. Node 环境：mock location.hash + hashchange
 */

function getHashEnv() {
  if (typeof window !== "undefined") {
    const env = {
      getHash: () => window.location.hash.slice(1) || "/",
      setHash: (h) => {
        window.location.hash = h;
      },
    };
    env.onChange = (fn) =>
      window.addEventListener("hashchange", () => fn(env.getHash()));
    return env;
  }
  // Node mock
  let current = "/";
  const listeners = [];
  return {
    getHash: () => current,
    setHash: (h) => {
      current = h.startsWith("#") ? h.slice(1) : h;
      if (!current.startsWith("/")) current = "/" + current;
      // 触发监听器并返回其结果（_handle 的 promise），便于 await
      let p;
      listeners.forEach((fn) => {
        p = fn(current);
      });
      return p;
    },
    onChange: (fn) => listeners.push(fn),
  };
}

class HashRouter {
  constructor() {
    const env = getHashEnv();
    this.env = env;
    this.routes = [];
    this.beforeHooks = [];
    this.notFound = null;
    this.current = null;

    env.onChange((hash) => this._handle(hash));
  }

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

  start() {
    return this._handle(this.env.getHash());
  }

  navigate(path) {
    // setHash 在 mock 中会同步触发 onChange -> _handle 并返回其 promise；
    // 浏览器中 setHash 异步触发 hashchange，此处返回 undefined
    return this.env.setHash(path);
  }

  beforeEach(fn) {
    this.beforeHooks.push(fn);
    return this;
  }

  _match(path) {
    const clean = path.split("?")[0]; // 去掉 query
    const parts = clean.split("/").filter(Boolean);
    for (const route of this.routes) {
      if (route.segments.length !== parts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < parts.length; i++) {
        const seg = route.segments[i];
        if (seg.name) params[seg.name] = decodeURIComponent(parts[i]);
        else if (seg.value !== parts[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { route, params, query: this._parseQuery(path) };
    }
    return null;
  }

  _parseQuery(path) {
    const idx = path.indexOf("?");
    if (idx < 0) return {};
    const query = {};
    new URLSearchParams(path.slice(idx + 1)).forEach((v, k) => (query[k] = v));
    return query;
  }

  async _handle(path) {
    for (const hook of this.beforeHooks) {
      const ok = await hook(path, this.current?.path);
      if (ok === false) return;
    }
    const matched = this._match(path);
    this.current = {
      path,
      params: matched?.params || {},
      query: matched?.query || {},
    };
    if (matched) {
      matched.route.handler(matched.params, matched.query);
    } else if (this.notFound) {
      this.notFound(path);
    }
  }
}

// ===== 测试 =====
(async () => {
  const router = new HashRouter();
  const visits = [];

  router.add("/", () => visits.push("home"));
  router.add("/list", () => visits.push("list"));
  router.add("/detail/:id", (p) => visits.push(`detail-${p.id}`));
  router.add("/search", (p, q) => visits.push(`search-${q.q}-${q.page}`));
  router.notFound = (path) => visits.push(`404:${path}`);

  router.beforeEach((to) => {
    visits.push(`guard:${to}`);
    return true;
  });

  await router.start();
  console.log("初始:", visits); // ['guard:/', 'home']

  // --- 导航 ---
  await router.navigate("/list");
  await router.navigate("/detail/99");
  await router.navigate("/search?q=hello&page=2");
  console.log("导航后:", visits);
  // ['guard:/', 'home', 'guard:/list', 'list',
  //  'guard:/detail/99', 'detail-99',
  //  'guard:/search?q=hello&page=2', 'search-hello-2']

  // --- 参数与 query 解析 ---
  const m1 = router._match("/detail/xyz");
  console.log("动态参数:", m1.params); // { id: 'xyz' }
  const m2 = router._match("/search?q=js&page=5");
  console.log("query:", m2.query); // { q: 'js', page: '5' }

  // --- 404 ---
  await router.navigate("/nope");
  console.log("404 记录:", visits.slice(-2)); // ['guard:/nope', '404:/nope']

  console.log("Hash API 路由演示完成");
})();
