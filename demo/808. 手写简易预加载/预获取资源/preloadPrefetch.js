/**
 * 手写简易预加载/预获取资源
 *
 * preload: 当前页面一定会用到的关键资源，高优先级
 * prefetch: 未来可能用到的资源，低优先级
 *
 * 实现思路：
 *   1. preload: 使用 <link rel="preload"> 或动态创建 link
 *   2. prefetch: 使用 <link rel="prefetch"> 或空闲时加载
 *   3. 动态导入预加载：import() 前先预获取
 */

// 预加载管理器
class ResourcePrefetcher {
  constructor() {
    this.preloaded = new Set();
    this.prefetched = new Set();
    this.cache = new Map();
  }

  // preload: 高优先级预加载
  preload(href, as = "script") {
    if (this.preloaded.has(href)) return;
    this.preloaded.add(href);
    console.log("[Preload]", as, ":", href);
    // 在浏览器中：创建 <link rel="preload" href="..." as="script">
    return this.loadResource(href, as);
  }

  // prefetch: 低优先级预获取
  prefetch(href, as = "script") {
    if (this.prefetched.has(href)) return;
    this.prefetched.add(href);
    console.log("[Prefetch]", as, ":", href);
    // 在浏览器中：创建 <link rel="prefetch" href="...">
    // 使用 requestIdleCallback 在空闲时加载
    return this.loadResource(href, as, true);
  }

  // 加载资源
  async loadResource(href, as, lowPriority = false) {
    if (this.cache.has(href)) return this.cache.get(href);

    const promise = new Promise((resolve, reject) => {
      // 模拟加载（浏览器中用 fetch 或 new Image() 等）
      const delay = lowPriority ? 200 : 50;
      setTimeout(() => {
        const content = "Loaded: " + href;
        console.log("  [Loaded]", href);
        resolve(content);
      }, delay);
    });

    this.cache.set(href, promise);
    return promise;
  }

  // 批量预加载
  preloadAll(resources) {
    return Promise.all(resources.map((r) => this.preload(r.href, r.as)));
  }

  // 批量预获取
  prefetchAll(resources) {
    return Promise.all(resources.map((r) => this.prefetch(r.href, r.as)));
  }

  // 基于路由的预获取
  prefetchRoute(routeName, resources) {
    console.log("[Prefetch Route]", routeName);
    return this.prefetchAll(resources);
  }

  // 鼠标悬停预获取
  setupHoverPrefetch(links) {
    links.forEach((link) => {
      console.log(
        "[Hover Prefetch] Registered:",
        link.href,
        "on",
        link.element,
      );
    });
  }
}

// ===== 测试 =====
const prefetcher = new ResourcePrefetcher();

console.log("=== Preload 关键资源 ===");
// 预加载关键资源
await prefetcher.preload("/vendor.js", "script");
await prefetcher.preload("/main.css", "style");
await prefetcher.preload("/hero.jpg", "image");

console.log("\n=== Prefetch 非关键资源 ===");
// 预获取未来路由资源
prefetcher.prefetch("/about.js", "script");
prefetcher.prefetch("/about.css", "style");

console.log("\n=== 基于路由预获取 ===");
await prefetcher.prefetchRoute("dashboard", [
  { href: "/dashboard.js", as: "script" },
  { href: "/chart.js", as: "script" },
  { href: "/dashboard.css", as: "style" },
]);

console.log("\n=== 悬停预获取 ===");
prefetcher.setupHoverPrefetch([
  { element: 'a[href="/about"]', href: "/about.js" },
  { element: 'a[href="/contact"]', href: "/contact.js" },
]);

console.log("\n已预加载:", [...prefetcher.preloaded]);
console.log("已预获取:", [...prefetcher.prefetched]);
