/**
 * 手写 IntersectionObserver 封装
 *
 * IntersectionObserver 作用：
 *   - 异步观察元素与视口（或根元素）的交叉状态
 *   - 常用于：懒加载、无限滚动、曝光统计、动画触发
 *
 * 封装目标：
 *   1. Promise 化：元素首次进入视口时 resolve
 *   2. 事件订阅：进入/离开回调
 *   3. 一次性观察（once）
 *   4. Node 环境：用 mock 触发交叉验证逻辑
 */

// 跨环境 mock
function getIntersectionObserver() {
  if (typeof IntersectionObserver !== "undefined") return IntersectionObserver;
  class MockIO {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.targets = new Map();
      MockIO._instances.push(this);
    }
    observe(target) {
      this.targets.set(target, { isIntersecting: false });
    }
    unobserve(target) {
      this.targets.delete(target);
    }
    disconnect() {
      this.targets.clear();
    }
    takeRecords() {
      return [];
    }
    // 测试辅助：手动触发交叉变化
    _trigger(target, isIntersecting) {
      this.targets.set(target, { isIntersecting });
      this.callback(
        [{ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }],
        this,
      );
    }
  }
  MockIO._instances = [];
  return MockIO;
}

const IO = getIntersectionObserver();

class IntersectionWrapper {
  constructor(options = {}) {
    this.options = { threshold: 0.1, rootMargin: "0px", ...options };
    this.observer = new IO(this._onIntersect.bind(this), this.options);
    this._entries = new Map(); // target -> { callbacks }
  }

  _onIntersect(entries) {
    entries.forEach((entry) => {
      const entry0 = this._entries.get(entry.target);
      if (!entry0) return;
      if (entry.isIntersecting) {
        entry0.onEnter?.(entry);
        if (entry0.once) {
          this.unobserve(entry.target);
          entry0.resolve?.(entry);
        }
      } else {
        entry0.onLeave?.(entry);
      }
    });
  }

  // 事件订阅式
  observe(target, { onEnter, onLeave, once = false } = {}) {
    this._entries.set(target, { onEnter, onLeave, once });
    this.observer.observe(target);
    return () => this.unobserve(target);
  }

  unobserve(target) {
    this.observer.unobserve(target);
    this._entries.delete(target);
  }

  // Promise 式：元素进入视口时 resolve
  once(target) {
    return new Promise((resolve) => {
      this._entries.set(target, { once: true, resolve });
      this.observer.observe(target);
    });
  }

  disconnect() {
    this.observer.disconnect();
    this._entries.clear();
  }
}

// 批量懒加载图片
function lazyLoadImages(images, onLoad) {
  const iw = new IntersectionWrapper({ rootMargin: "100px" });
  images.forEach((img) => {
    iw.observe(img, {
      onEnter: () => {
        const src = img.getAttribute("data-src");
        if (src) {
          img.setAttribute("src", src);
          onLoad?.(img);
        }
      },
      once: true,
    });
  });
  return iw;
}

// ===== 测试 =====
(() => {
  // mock 元素
  const makeEl = (id) => ({
    id,
    _attrs: {},
    getAttribute(k) {
      return this._attrs[k];
    },
    setAttribute(k, v) {
      this._attrs[k] = v;
    },
  });
  const el1 = {
    id: "el1",
    attrs: {},
    getAttribute(k) {
      return this.attrs[k];
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
  };
  const el2 = {
    id: "el2",
    attrs: {},
    getAttribute(k) {
      return this.attrs[k];
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
  };
  const el3 = {
    id: "el3",
    attrs: {},
    getAttribute(k) {
      return this.attrs[k];
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
  };

  const iw = new IntersectionWrapper();

  // --- 事件订阅 ---
  const states = [];
  iw.observe(el1, {
    onEnter: () => states.push("el1:enter"),
    onLeave: () => states.push("el1:leave"),
  });

  // 模拟进入
  iw.observer._trigger(el1, true);
  // 模拟离开
  iw.observer._trigger(el1, false);
  console.log("状态:", states); // ['el1:enter', 'el1:leave']

  // --- once Promise ---
  const enterPromise = iw.once(el2);
  iw.observer._trigger(el2, true);
  enterPromise.then((entry) => {
    console.log("el2 进入视口, ratio:", entry.intersectionRatio); // 1
  });

  // --- 懒加载 ---
  const img1 = {
    attrs: { "data-src": "/img/a.jpg" },
    getAttribute(k) {
      return this.attrs[k];
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
  };
  const img2 = {
    attrs: { "data-src": "/img/b.jpg" },
    getAttribute(k) {
      return this.attrs[k];
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
  };
  const loaded = [];
  const lazy = lazyLoadImages([img1, img2], (img) =>
    loaded.push(img.getAttribute("src")),
  );
  lazy.observer._trigger(img1, true);
  lazy.observer._trigger(img2, true);
  console.log("懒加载图片:", loaded); // ['/img/a.jpg', '/img/b.jpg']

  iw.disconnect();
  lazy.disconnect();
  console.log("IntersectionObserver 演示完成");
})();
