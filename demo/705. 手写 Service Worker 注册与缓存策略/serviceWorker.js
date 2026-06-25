/**
 * 手写 Service Worker 注册与缓存策略
 *
 * Service Worker 作用：
 *   - 充当浏览器与网络之间的代理，可拦截 fetch 请求
 *   - 用于离线缓存、推送通知、后台同步等 PWA 能力
 *
 * 实现思路：
 *   1. registerSW：navigator.serviceWorker.register 注册 sw.js
 *   2. 缓存策略封装（在 SW 内运行）：
 *      - precache：install 阶段预缓存核心资源
 *      - cacheFirst：静态资源优先取缓存
 *      - networkFirst：动态数据优先取网络，失败回退缓存
 *      - staleWhileRevalidate：先返回缓存，后台更新缓存
 *   3. Node 环境无 SW，提供策略函数的纯逻辑可测试版本
 */

// ---- 策略函数（可在 Node 中单测，浏览器中由 SW 调用） ----

/**
 * Cache First：有缓存就用，没有再请求网络并回填
 */
async function cacheFirst(request, cache, fetchFn) {
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetchFn(request);
  if (fresh && fresh.ok) await cache.put(request, fresh.clone());
  return fresh;
}

/**
 * Network First：先请求网络，失败回退缓存
 */
async function networkFirst(request, cache, fetchFn) {
  try {
    const fresh = await fetchFn(request);
    if (fresh && fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

/**
 * Stale While Revalidate：立即返回缓存，同时后台更新
 */
async function staleWhileRevalidate(request, cache, fetchFn) {
  const cached = await cache.match(request);
  const networkPromise = fetchFn(request)
    .then((fresh) => {
      if (fresh && fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => null);
  return cached || (await networkPromise);
}

// ---- 注册器（浏览器环境使用） ----
async function registerSW(swUrl = "/sw.js", options = { scope: "/" }) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("当前环境不支持 Service Worker");
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register(swUrl, options);
    console.log("[SW] 注册成功, scope:", reg.scope);
    return reg;
  } catch (err) {
    console.error("[SW] 注册失败:", err);
    throw err;
  }
}

// ---- SW 端事件处理代码字符串（供生成 sw.js 参考） ----
const swBoilerplate = `
const CACHE = "app-v1";
const PRECACHE = ["/", "/index.html", "/app.js"];

// install：预缓存
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

// activate：清理旧缓存
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// fetch：按 URL 选择策略
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const strategy = url.pathname.startsWith("/api/") ? "networkFirst" : "cacheFirst";
  e.respondWith(handle(e.request, strategy));
});
`;

// ===== 测试（使用内存 mock cache/fetch 验证策略逻辑） =====
async function runTests() {
  // 内存 cache mock
  const store = new Map();
  const cache = {
    async match(req) {
      const k = typeof req === "string" ? req : req.url;
      return store.has(k) ? store.get(k) : undefined;
    },
    async put(req, res) {
      const k = typeof req === "string" ? req : req.url;
      store.set(k, res);
    },
  };
  const makeResponse = (body) => ({
    ok: true,
    body,
    clone() {
      return this;
    },
  });
  const fetchFn = (req) => Promise.resolve(makeResponse(`net:${req}`));

  // --- cacheFirst：首次未命中走网络 ---
  const r1 = await cacheFirst("/a", cache, fetchFn);
  console.log(r1.body); // "net:/a"

  // --- cacheFirst：第二次命中缓存 ---
  const r2 = await cacheFirst("/a", cache, fetchFn);
  console.log(r2.body); // "net:/a"（来自缓存）

  // --- networkFirst：网络正常返回网络结果 ---
  const r3 = await networkFirst("/b", cache, fetchFn);
  console.log(r3.body); // "net:/b"

  // --- networkFirst：网络失败回退缓存 ---
  await cache.put("/c", makeResponse("cached:/c"));
  const r4 = await networkFirst("/c", cache, () =>
    Promise.reject(new Error("offline")),
  );
  console.log(r4.body); // "cached:/c"

  // --- staleWhileRevalidate：有缓存立即返回 ---
  await cache.put("/d", makeResponse("stale:/d"));
  const r5 = await staleWhileRevalidate("/d", cache, fetchFn);
  console.log(r5.body); // "stale:/d"（先返回缓存）

  console.log("--- SW 注册代码（参考）---");
  console.log(registerSW.toString().slice(0, 80) + "...");
  console.log("Service Worker 策略演示完成");
}

runTests();
