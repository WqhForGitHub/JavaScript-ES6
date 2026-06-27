/**
 * 手写简易微前端框架 (Minimal Micro-Frontend Framework)
 * =====================================================
 *
 * 概念说明:
 * 微前端 (Micro Frontend) 把大型前端应用拆分为多个独立开发 / 部署 / 运行的子应用,
 * 通过框架在运行时把它们组合到一个壳 (container) 中. 类似 single-spa / qiankun.
 *
 * 核心概念:
 * 1. 应用注册 (Registration): name / entry (子应用代码入口) / route (激活路由) /
 *    生命周期钩子 (bootstrap, mount, unmount)
 * 2. 生命周期 (Lifecycle):
 *    - bootstrap: 首次加载时初始化 (只执行一次)
 *    - mount:     挂载到容器 (可多次)
 *    - unmount:   从容器卸载 (可多次)
 * 3. 加载器 (Loader): 按 entry 加载子应用代码 (本实现模拟 import / eval)
 * 4. 路由激活 (Route-based Activation): 监听路由变化, 匹配则挂载, 否则卸载
 * 5. 沙箱隔离 (Sandbox Isolation): 为每个子应用创建独立全局作用域,
 *    避免子应用污染主应用 window (本实现用 Proxy + 独立 fakeWindow)
 *
 * 本实现要点:
 * - MicroFrontendHub: 主框架, 管理注册 / 路由 / 挂载
 * - Sandbox: 基于 Proxy 的全局对象隔离, 记录子应用对全局的修改, 卸载时还原
 * - 模拟路由 (hash 风格), 不依赖真实浏览器
 */

"use strict";

// ------------------------------------------------------------
// 沙箱 (Sandbox)
// ------------------------------------------------------------

/**
 * 基于 Proxy 的全局作用域沙箱
 * 为每个子应用创建独立的 fakeWindow, 子应用对全局的读写被代理.
 * - 读: 优先从 fakeWindow 取, 没有则 fallback 到主全局 (host)
 * - 写: 全部写入 fakeWindow, 不污染主全局
 * - activate() / deactivate(): 激活 / 失活, 失活时把子应用全局从主全局 "摘除"
 */
class Sandbox {
  /**
   * @param {string} name - 子应用名
   * @param {object} [host] - 宿主全局对象 (默认一个共享对象)
   */
  constructor(name, host) {
    this.name = name;
    this.host = host || globalThis;
    /** 子应用私有的全局存储 */
    this.fakeWindow = Object.create(null);
    /** 记录子应用挂到主全局上的属性, 卸载时还原 */
    this.addedKeys = new Set();
    this.active = false;
    /** 代理对象, 作为子应用代码执行的 "window" */
    this.proxy = new Proxy(this.fakeWindow, {
      get: (target, key) => {
        if (key === "window" || key === "globalThis" || key === "self")
          return this.proxy;
        if (key in target) return target[key];
        // fallback 到宿主
        const val = this.host[key];
        return typeof val === "function" ? val.bind(this.host) : val;
      },
      set: (target, key, value) => {
        target[key] = value; // 写入私有存储, 不污染主全局
        return true;
      },
      has: () => true, // 让 with 语句认为所有变量都在 proxy 上
      deleteProperty: (target, key) => {
        if (key in target) delete target[key];
        return true;
      },
    });
  }

  /**
   * 激活沙箱
   */
  activate() {
    this.active = true;
  }

  /**
   * 失活沙箱, 清理子应用对主全局的副作用
   */
  deactivate() {
    this.active = false;
    for (const key of this.addedKeys) {
      delete this.host[key];
    }
    this.addedKeys.clear();
  }

  /**
   * 在沙箱作用域内执行代码
   * 用 with(proxy) 让代码中的自由变量解析到 proxy
   * @param {string} code
   * @param {object} [extraGlobals]
   */
  exec(code, extraGlobals = {}) {
    // 注入额外全局 (如框架提供的 API)
    for (const [k, v] of Object.entries(extraGlobals)) {
      this.fakeWindow[k] = v;
    }
    this.activate();
    try {
      // 用 Function + with 实现作用域隔离
      // eslint-disable-next-line no-new-func
      const fn = new Function("proxy", `with(proxy){ ${code} }`);
      fn.call(this.proxy, this.proxy);
    } finally {
      // 注意: 这里不 deactivate, 因为生命周期挂载后子应用仍可能用全局
      // 真正 deactivate 在 unmount 时
    }
  }
}

// ------------------------------------------------------------
// 微应用 (MicroApp)
// ------------------------------------------------------------

/**
 * 微应用实例
 */
class MicroApp {
  /**
   * @param {object} options
   * @param {string} options.name
   * @param {string} options.entry - 子应用代码 (模拟入口, 这里直接是源码字符串)
   * @param {string|Function} options.route - 激活路由前缀或匹配函数
   * @param {object} [options.props] - 传给子应用的参数
   */
  constructor(options) {
    this.name = options.name;
    this.entry = options.entry;
    this.route = options.route;
    this.props = options.props || {};
    this.status = "NOT_LOADED"; // NOT_LOADED -> BOOTSTRAPPING -> NOT_MOUNTED -> MOUNTING -> MOUNTED -> UNMOUNTING
    /** 子应用导出的生命周期函数 */
    this.lifecycles = null;
    this.sandbox = new Sandbox(this.name);
    /** 子应用的 "DOM" 容器 (这里用一个普通对象模拟) */
    this.container = { innerHTML: "", children: [] };
  }

  /**
   * 匹配路由
   */
  matchRoute(currentRoute) {
    if (typeof this.route === "function") return this.route(currentRoute);
    if (typeof this.route === "string")
      return currentRoute.startsWith(this.route);
    return false;
  }

  /**
   * 加载 + bootstrap (只执行一次)
   */
  async load() {
    if (this.status !== "NOT_LOADED") return;
    this.status = "LOADING";
    // 执行子应用代码, 收集其导出的生命周期
    const exports = {};
    this.sandbox.exec(this.entry, {
      __registerApp: (lifecycles) => {
        Object.assign(exports, lifecycles);
      },
      __appProps: this.props,
      console, // 暴露 console 便于子应用打印
    });
    this.lifecycles = exports;
    if (!this.lifecycles || typeof this.lifecycles.bootstrap !== "function") {
      throw new Error(`子应用 ${this.name} 未导出 bootstrap 生命周期`);
    }
    this.status = "BOOTSTRAPPING";
    await this.lifecycles.bootstrap(this.props);
    this.status = "NOT_MOUNTED";
  }

  /**
   * 挂载
   */
  async mount() {
    if (this.status === "MOUNTED") return;
    await this.load();
    if (this.status === "MOUNTED") return;
    this.status = "MOUNTING";
    this.sandbox.activate();
    await this.lifecycles.mount(this.props, this.container);
    this.status = "MOUNTED";
  }

  /**
   * 卸载
   */
  async unmount() {
    if (this.status !== "MOUNTED") return;
    this.status = "UNMOUNTING";
    await this.lifecycles.unmount(this.props, this.container);
    this.sandbox.deactivate();
    this.container.innerHTML = "";
    this.container.children = [];
    this.status = "NOT_MOUNTED";
  }
}

// ------------------------------------------------------------
// 微前端主框架 (MicroFrontendHub)
// ------------------------------------------------------------

/**
 * 微前端主框架
 */
class MicroFrontendHub {
  constructor() {
    /** @type {Map<string, MicroApp>} */
    this.apps = new Map();
    /** @type {Set<string>} 当前已挂载的应用名 */
    this.mountedApps = new Set();
    this.currentRoute = "/";
    /** @type {Array<Function>} 路由变更监听器 */
    this.listeners = [];
  }

  /**
   * 注册微应用
   */
  registerApp(options) {
    if (this.apps.has(options.name)) {
      throw new Error(`应用 ${options.name} 已注册`);
    }
    const app = new MicroApp(options);
    this.apps.set(options.name, app);
    console.log(`[Hub] 注册应用: ${options.name} (route=${options.route})`);
    return app;
  }

  /**
   * 启动框架, 监听路由变化并按路由激活应用
   */
  start(initialRoute = "/") {
    console.log(`[Hub] 框架启动, 初始路由: ${initialRoute}`);
    this.reroute(initialRoute);
  }

  /**
   * 修改路由 (模拟 hash 路由跳转)
   */
  navigate(route) {
    if (route === this.currentRoute) return;
    console.log(`[Hub] 路由变更: ${this.currentRoute} -> ${route}`);
    this.currentRoute = route;
    this.reroute(route);
    this.listeners.forEach((fn) => fn(route));
  }

  /**
   * 重新路由: 挂载匹配的应用, 卸载不匹配的
   */
  async reroute(route) {
    const toMount = [];
    const toUnmount = [];
    for (const [name, app] of this.apps) {
      const shouldMount = app.matchRoute(route);
      const isMounted = this.mountedApps.has(name);
      if (shouldMount && !isMounted) toMount.push(name);
      if (!shouldMount && isMounted) toUnmount.push(name);
    }

    // 先卸载
    for (const name of toUnmount) {
      const app = this.apps.get(name);
      await app.unmount();
      this.mountedApps.delete(name);
      console.log(`[Hub] 已卸载应用: ${name}`);
    }
    // 再挂载
    for (const name of toMount) {
      const app = this.apps.get(name);
      try {
        await app.mount();
        this.mountedApps.add(name);
        console.log(`[Hub] 已挂载应用: ${name}`);
      } catch (e) {
        console.error(`[Hub] 挂载应用 ${name} 失败:`, e.message);
      }
    }
  }

  /**
   * 注册路由监听
   */
  onRouteChange(fn) {
    this.listeners.push(fn);
  }
}

// ============================================================
// 模拟子应用代码 (字符串形式)
// ============================================================

/**
 * 子应用 A: 用户中心
 * 在沙箱中执行, 通过 __registerApp 注册生命周期
 */
const appACode = `
  // 子应用 A 拥有独立 "window", 这里定义全局变量不污染主应用
  var state = { users: ['Alice', 'Bob'] };
  window.__myGlobal = 'appA-global'; // 写入沙箱, 不影响主全局

  console.log('[AppA] bootstrap 初始化 (只执行一次)');
  // 模拟模块内函数
  function render() {
    return '<div id="appa"><h2>User Center</h2><ul>' +
      state.users.map(function(u){ return '<li>' + u + '</li>'; }).join('') +
      '</ul></div>';
  }

  __registerApp({
    bootstrap: async function(props) {
      console.log('[AppA] bootstrap, props=', JSON.stringify(props));
    },
    mount: async function(props, container) {
      console.log('[AppA] mount');
      container.innerHTML = render();
      container.children.push({ type: 'UserList', data: state.users });
    },
    unmount: async function(props, container) {
      console.log('[AppA] unmount, 清理容器');
      container.innerHTML = '';
      container.children = [];
    }
  });
`;

const appBCode = `
  var counter = 0;
  // 故意写一个与主全局同名的变量, 验证沙箱隔离
  var __sharedVar = 'appB-value';

  console.log('[AppB] bootstrap 初始化');
  function render() {
    return '<div id="appb"><h2>Dashboard</h2><p>visits: ' + (++counter) + '</p></div>';
  }

  __registerApp({
    bootstrap: async function() {
      console.log('[AppB] bootstrap');
    },
    mount: async function(props, container) {
      console.log('[AppB] mount, props=', JSON.stringify(props));
      container.innerHTML = render();
      container.children.push({ type: 'Dashboard', counter: counter });
    },
    unmount: async function() {
      console.log('[AppB] unmount');
    }
  });
`;

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 微前端框架演示 ==========\n");

(async function main() {
  const hub = new MicroFrontendHub();

  // 1. 注册两个子应用
  hub.registerApp({
    name: "user-center",
    entry: appACode,
    route: "/users",
    props: { theme: "dark", token: "abc123" },
  });

  hub.registerApp({
    name: "dashboard",
    entry: appBCode,
    route: "/dashboard",
    props: { locale: "zh-CN" },
  });

  // 暴露一个主全局变量, 验证子应用沙箱不会污染它
  globalThis.__sharedVar = "host-value";

  // 2. 启动框架
  console.log("\n--- 启动, 访问 /users ---");
  hub.start("/users");

  // 等待异步挂载完成 (mount 是 async)
  await delay(50);

  const appA = hub.apps.get("user-center");
  console.log("\nAppA 容器内容:");
  console.log("  innerHTML:", appA.container.innerHTML.slice(0, 80) + "...");
  console.log("  children:", JSON.stringify(appA.container.children));

  // 3. 沙箱隔离验证
  console.log("\n--- 沙箱隔离验证 ---");
  console.log(
    "  主全局 __sharedVar:",
    globalThis.__sharedVar,
    "(应仍为 host-value)",
  );
  console.log(
    "  AppB 沙箱内 __sharedVar:",
    appA.sandbox.fakeWindow.__sharedVar || "(未定义, 因为 AppA 未设置)",
  );

  // 4. 路由跳转到 dashboard
  console.log("\n--- 路由跳转: /users -> /dashboard ---");
  hub.navigate("/dashboard");
  await delay(50);

  const appB = hub.apps.get("dashboard");
  console.log("\nAppB 容器内容:");
  console.log("  innerHTML:", appB.container.innerHTML);
  console.log(
    "  AppB 沙箱 __sharedVar:",
    appB.sandbox.fakeWindow.__sharedVar,
    "(沙箱私有, 不影响主全局)",
  );
  console.log("  主全局 __sharedVar:", globalThis.__sharedVar);

  // 验证 AppA 已卸载
  console.log("\nAppA 状态:", appA.status, "(应为 NOT_MOUNTED)");
  console.log(
    "AppA 容器已被清空:",
    appA.container.children.length === 0 ? "YES" : "NO",
  );

  // 5. 再次访问 /users, 验证 bootstrap 只执行一次
  console.log("\n--- 再次访问 /users (bootstrap 只执行一次) ---");
  hub.navigate("/users");
  await delay(50);
  console.log("AppA 状态:", appA.status);
  console.log(
    "AppA 容器内容恢复:",
    appA.container.children.length > 0 ? "YES" : "NO",
  );

  // 6. 路由监听
  console.log("\n--- 路由监听器 ---");
  hub.onRouteChange((route) => {
    console.log("[监听器] 路由已变为:", route);
  });
  hub.navigate("/dashboard");
  await delay(50);

  // 7. 多应用并存 (调整 dashboard 路由匹配规则后) - 这里演示同路由前缀
  console.log("\n--- 多应用并存演示 ---");
  const hub2 = new MicroFrontendHub();
  hub2.registerApp({
    name: "nav",
    entry: `
      __registerApp({
        bootstrap: async function(){ console.log('[Nav] bootstrap'); },
        mount: async function(p, c){ console.log('[Nav] mount'); c.innerHTML = '<nav>Nav</nav>'; },
        unmount: async function(){}
      });
    `,
    route: () => true, // 所有路由都挂载导航
    props: {},
  });
  hub2.registerApp({
    name: "page",
    entry: appACode,
    route: "/users",
    props: {},
  });
  hub2.start("/users");
  await delay(50);
  console.log("当前已挂载应用:", [...hub2.mountedApps]);

  console.log("\n[微前端框架演示完成]");
})();

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
