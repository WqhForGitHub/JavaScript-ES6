/**
 * 手写简易 PWA Manifest 生成
 *
 * 功能：生成 PWA 所需的 manifest.json 和图标
 * 实现思路：
 *   1. 根据应用配置生成 manifest.json
 *   2. 生成不同尺寸的图标配置
 *   3. 生成 Service Worker 注册代码
 */

class PWAManifestGenerator {
  constructor(config) {
    this.name = config.name || "My App";
    this.shortName = config.shortName || config.name || "App";
    this.themeColor = config.themeColor || "#000000";
    this.backgroundColor = config.backgroundColor || "#ffffff";
    this.display = config.display || "standalone";
    this.startUrl = config.startUrl || "/";
    this.icons = config.icons || [];
  }

  // 生成图标配置
  generateIcons(baseIconPath) {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    return sizes.map((size) => ({
      src: baseIconPath + "/icon-" + size + "x" + size + ".png",
      sizes: size + "x" + size,
      type: "image/png",
      purpose: size >= 192 ? "any maskable" : "any",
    }));
  }

  // 生成 manifest.json
  generateManifest() {
    return {
      name: this.name,
      short_name: this.shortName,
      description: this.name + " - Progressive Web App",
      start_url: this.startUrl,
      display: this.display,
      orientation: "portrait",
      theme_color: this.themeColor,
      background_color: this.backgroundColor,
      scope: "/",
      lang: "zh-CN",
      dir: "ltr",
      icons: this.icons.length ? this.icons : this.generateIcons("/icons"),
      categories: ["productivity", "utilities"],
      shortcuts: [
        {
          name: "Home",
          url: "/",
          icons: [{ src: "/icons/shortcut-home.png", sizes: "96x96" }],
        },
        {
          name: "Settings",
          url: "/settings",
          icons: [{ src: "/icons/shortcut-settings.png", sizes: "96x96" }],
        },
      ],
    };
  }

  // 生成 HTML link 标签
  generateHtmlLinks() {
    const manifest = this.generateManifest();
    const links = [
      '<link rel="manifest" href="/manifest.json">',
      '<meta name="theme-color" content="' + this.themeColor + '">',
      '<meta name="apple-mobile-web-app-capable" content="yes">',
      '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
      '<meta name="apple-mobile-web-app-title" content="' +
        this.shortName +
        '">',
      '<link rel="apple-touch-icon" href="/icons/icon-152x152.png">',
    ];

    // 添加图标 links
    manifest.icons.forEach((icon) => {
      if (icon.sizes === "192x192" || icon.sizes === "512x512") {
        links.push(
          '<link rel="icon" type="' +
            icon.type +
            '" sizes="' +
            icon.sizes +
            '" href="' +
            icon.src +
            '">',
        );
      }
    });

    return links;
  }

  // 生成 Service Worker 注册代码
  generateSWRegister() {
    return `if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}`;
  }

  // 生成简易 Service Worker
  generateServiceWorker() {
    return (
      `const CACHE_NAME = '` +
      this.name.toLowerCase().replace(/\s+/g, "-") +
      `-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/main.css',
  '/scripts/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => name !== CACHE_NAME ? caches.delete(name) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      });
    }).catch(() => caches.match('/offline.html'))
  );
});
`
    );
  }
}

// ===== 测试 =====
const pwa = new PWAManifestGenerator({
  name: "My Awesome App",
  shortName: "Awesome",
  themeColor: "#6200ee",
  backgroundColor: "#ffffff",
  display: "standalone",
  startUrl: "/?source=pwa",
});

console.log("=== Manifest JSON ===");
console.log(JSON.stringify(pwa.generateManifest(), null, 2));

console.log("\n=== HTML Links ===");
pwa.generateHtmlLinks().forEach((l) => console.log(l));

console.log("\n=== SW Registration ===");
console.log(pwa.generateSWRegister());

console.log("\n=== Service Worker (前 5 行) ===");
console.log(
  pwa.generateServiceWorker().split("\n").slice(0, 5).join("\n") + "\n...",
);
