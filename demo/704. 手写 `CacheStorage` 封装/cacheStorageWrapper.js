/**
 * 手写 CacheStorage 封装
 *
 * CacheStorage（window.caches）：
 *   - Service Worker 配套的请求/响应缓存 API
 *   - 以 Request-Response 为键值对存储，常用于离线 PWA
 *   - open(name) 打开一个 Cache，match/put/delete 操作单条缓存
 *
 * 封装目标：
 *   1. Promise 化的 API：open / has / delete / keys
 *   2. 缓存读写：put(url, response) / match(url)
 *   3. 缓存策略封装：cacheFirst（优先缓存）、networkFirst（优先网络）
 *   4. Node 环境无 caches，用 Map mock 演示逻辑
 */

// ---- Node 环境 mock ----
const isBrowser = typeof window !== "undefined" && "caches" in window;

function createMockCaches() {
  const store = new Map(); // cacheName -> Map(url -> responseText)
  const makeCache = (name) => ({
    name,
    async match(req) {
      const url = typeof req === "string" ? req : req.url;
      const text = store.get(name).get(url);
      return text === undefined
        ? undefined
        : { status: 200, url, _text: text, text: async () => text };
    },
    async put(req, res) {
      const url = typeof req === "string" ? req : req.url;
      const text = typeof res === "string" ? res : await res.text();
      store.get(name).set(url, text);
    },
    async add(url) {
      store.get(name).set(url, `fetched:${url}`);
    },
    async delete(req) {
      const url = typeof req === "string" ? req : req.url;
      return store.get(name).delete(url);
    },
    keys() {
      return Promise.resolve(
        [...store.get(name).keys()].map((u) => ({ url: u })),
      );
    },
  });
  return {
    async open(name) {
      if (!store.has(name)) store.set(name, new Map());
      return makeCache(name);
    },
    async has(name) {
      return store.has(name);
    },
    async delete(name) {
      return store.delete(name);
    },
    async keys() {
      return [...store.keys()];
    },
  };
}

const caches = isBrowser ? window.caches : createMockCaches();

class CacheStorageWrapper {
  constructor(cacheName = "app-cache-v1") {
    this.cacheName = cacheName;
  }

  // 打开/获取 Cache 实例
  async open() {
    this.cache = await caches.open(this.cacheName);
    return this.cache;
  }

  // 写入缓存：url -> response
  async put(url, response) {
    if (!this.cache) await this.open();
    await this.cache.put(url, response);
  }

  // 读取缓存
  async match(url) {
    if (!this.cache) await this.open();
    return this.cache.match(url);
  }

  // 删除单条
  async delete(url) {
    if (!this.cache) await this.open();
    return this.cache.delete(url);
  }

  /**
   * 缓存优先策略：先查缓存，无则走 fetchFn 并回填
   * @param {string} url
   * @param {Function} fetchFn () => Promise<Response> 真实网络请求
   */
  async cacheFirst(url, fetchFn) {
    const cached = await this.match(url);
    if (cached) {
      console.log(`[cacheFirst] 命中缓存: ${url}`);
      return cached;
    }
    console.log(`[cacheFirst] 缓存未命中，请求网络: ${url}`);
    const fresh = await fetchFn(url);
    if (fresh) await this.put(url, fresh);
    return fresh;
  }

  /**
   * 网络优先策略：先请求网络，失败再回退缓存
   */
  async networkFirst(url, fetchFn) {
    try {
      const fresh = await fetchFn(url);
      if (fresh) await this.put(url, fresh);
      console.log(`[networkFirst] 网络成功: ${url}`);
      return fresh;
    } catch (e) {
      console.log(`[networkFirst] 网络失败，回退缓存: ${url}`);
      const cached = await this.match(url);
      return cached;
    }
  }

  // 清空整个 cache
  async clear() {
    if (isBrowser) {
      await window.caches.delete(this.cacheName);
    } else {
      await caches.delete(this.cacheName);
    }
    this.cache = null;
  }
}

// ===== 测试 =====
(async () => {
  const cs = new CacheStorageWrapper("demo-cache");

  // 模拟网络请求函数
  const fakeFetch = (url) => Promise.resolve(`response-body-of(${url})`);

  // --- 缓存优先：首次未命中 ---
  const r1 = await cs.cacheFirst("/api/user", fakeFetch);
  console.log(r1); // "response-body-of(/api/user)"

  // --- 缓存优先：第二次命中缓存 ---
  const r2 = await cs.cacheFirst("/api/user", fakeFetch);
  console.log(r2); // "response-body-of(/api/user)"

  // --- 直接 put/match ---
  await cs.put("/api/post", "post-body");
  const r3 = await cs.match("/api/post");
  console.log(r3._text || r3); // "post-body"

  // --- delete ---
  await cs.delete("/api/post");
  const r4 = await cs.match("/api/post");
  console.log(r4); // undefined

  // --- 网络优先：网络成功 ---
  const r5 = await cs.networkFirst("/api/ok", fakeFetch);
  console.log(r5); // "response-body-of(/api/ok)"

  // --- 网络优先：网络失败回退缓存 ---
  await cs.put("/api/fail", "cached-fail-body");
  const r6 = await cs.networkFirst("/api/fail", () =>
    Promise.reject(new Error("offline")),
  );
  console.log(r6._text || r6); // "cached-fail-body"

  await cs.clear();
  console.log("CacheStorage 演示完成");
})();
