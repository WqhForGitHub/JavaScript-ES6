/**
 * 手写图片懒加载
 *
 * 图片懒加载：当图片进入可视区域时才加载真实图片，减少初始请求。
 * 实现方式：
 *   1. IntersectionObserver（推荐，现代浏览器）
 *   2. scroll + getBoundingClientRect（兼容方案）
 *
 * 原理：img 标签的 data-src 存真实地址，进入视口时赋值给 src。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 方式一：使用 IntersectionObserver 实现懒加载
 * @param {string} selector - 图片选择器
 * @param {Object} [options] - 配置
 * @param {string} [options.srcAttr=data-src] - 真实图片地址属性
 * @param {string} [options.loading] - 占位图地址
 * @param {number} [options.rootMargin] - 提前加载距离
 * @returns {IntersectionObserver}
 */
function lazyLoadByObserver(selector, options) {
  options = options || {};
  var srcAttr = options.srcAttr || "data-src";
  var loading = options.loading || "";
  var rootMargin = options.rootMargin || "0px";

  var images = document.querySelectorAll(selector);

  // 如果浏览器不支持 IntersectionObserver，降级
  if (!("IntersectionObserver" in window)) {
    return lazyLoadByScroll(selector, options);
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          var src = img.getAttribute(srcAttr);
          if (src) {
            img.src = src;
            img.removeAttribute(srcAttr);
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: rootMargin, threshold: 0.01 },
  );

  images.forEach(function (img) {
    if (loading) img.src = loading;
    observer.observe(img);
  });

  return observer;
}

/**
 * 方式二：使用 scroll 事件 + getBoundingClientRect 实现
 * @param {string} selector
 * @param {Object} [options]
 * @returns {{ check: Function, destroy: Function }}
 */
function lazyLoadByScroll(selector, options) {
  options = options || {};
  var srcAttr = options.srcAttr || "data-src";
  var loading = options.loading || "";
  var throttleTime = options.throttle || 200;

  var images = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (loading) {
    images.forEach(function (img) {
      img.src = loading;
    });
  }

  var ticking = false;

  function isVisible(img) {
    var rect = img.getBoundingClientRect();
    var viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    var viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    // 元素顶部在视口底部以上，且元素底部在视口顶部以下
    return (
      rect.top < viewportHeight &&
      rect.bottom > 0 &&
      rect.left < viewportWidth &&
      rect.right > 0
    );
  }

  function check() {
    images = images.filter(function (img) {
      if (isVisible(img)) {
        var src = img.getAttribute(srcAttr);
        if (src) {
          img.src = src;
          img.removeAttribute(srcAttr);
        }
        return false; // 移除已加载的
      }
      return true;
    });
    // 全部加载完移除监听
    if (images.length === 0) {
      destroy();
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        check();
        ticking = false;
      });
      ticking = true;
    }
  }

  function destroy() {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  }

  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onScroll);
  // 初始检查一次
  check();

  return { check: check, destroy: destroy };
}

// ===== 测试用例（需浏览器环境） =====
// HTML:
// <img class="lazy" data-src="https://example.com/1.jpg" alt="">
// <img class="lazy" data-src="https://example.com/2.jpg" alt="">
// <img class="lazy" data-src="https://example.com/3.jpg" alt="">
//
// var observer = lazyLoadByObserver('img.lazy', {
//   loading: 'data:image/gif;base64,placeholder',
//   rootMargin: '100px',
// });
// // 图片进入视口（含 100px 提前量）时自动加载

// 模拟测试：验证 isVisible 逻辑
function mockIsVisible(rect, viewport) {
  return (
    rect.top < viewport.height &&
    rect.bottom > 0 &&
    rect.left < viewport.width &&
    rect.right > 0
  );
}
console.log(
  mockIsVisible(
    { top: 50, bottom: 200, left: 0, right: 100 },
    { width: 800, height: 600 },
  ),
); // => true
console.log(
  mockIsVisible(
    { top: 700, bottom: 800, left: 0, right: 100 },
    { width: 800, height: 600 },
  ),
); // => false
