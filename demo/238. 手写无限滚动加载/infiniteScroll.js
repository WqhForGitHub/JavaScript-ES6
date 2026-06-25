/**
 * 手写无限滚动加载
 *
 * 当用户滚动到页面底部时，自动加载更多数据并追加到列表中。
 * 实现方式：
 *   1. scroll 事件 + 节流
 *   2. IntersectionObserver 监听哨兵元素
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 方式一：基于 scroll 事件的无限滚动
 * @param {Object} options
 * @param {Function} options.loadMore - 加载更多数据的函数（返回 Promise）
 * @param {number} [options.threshold=100] - 距底部多少 px 触发
 * @param {number} [options.throttle=200] - 节流时间
 * @param {HTMLElement} [options.container] - 滚动容器（默认 window）
 * @returns {{ destroy: Function }}
 */
function infiniteScrollByScroll(options) {
  options = options || {};
  var loadMore = options.loadMore;
  var threshold = options.threshold != null ? options.threshold : 100;
  var throttleTime = options.throttle || 200;
  var container = options.container || window;

  var loading = false;
  var hasMore = true;
  var lastTime = 0;

  function getScrollInfo() {
    var scrollTop, scrollHeight, clientHeight;
    if (container === window) {
      scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      clientHeight =
        window.innerHeight || document.documentElement.clientHeight;
    } else {
      scrollTop = container.scrollTop;
      scrollHeight = container.scrollHeight;
      clientHeight = container.clientHeight;
    }
    return {
      scrollTop: scrollTop,
      scrollHeight: scrollHeight,
      clientHeight: clientHeight,
    };
  }

  async function onScroll() {
    var now = Date.now();
    if (now - lastTime < throttleTime) return;
    lastTime = now;

    if (loading || !hasMore) return;

    var info = getScrollInfo();
    // 距底部小于 threshold 时触发
    if (info.scrollHeight - info.scrollTop - info.clientHeight < threshold) {
      loading = true;
      try {
        var result = await loadMore();
        if (result && result.hasMore === false) {
          hasMore = false;
        }
      } catch (e) {
        console.error("加载失败", e);
      } finally {
        loading = false;
      }
    }
  }

  container.addEventListener("scroll", onScroll);

  return {
    destroy: function () {
      container.removeEventListener("scroll", onScroll);
    },
    reset: function () {
      hasMore = true;
      loading = false;
    },
  };
}

/**
 * 方式二：基于 IntersectionObserver 的无限滚动（推荐）
 * @param {Object} options
 * @param {Function} options.loadMore - 加载更多
 * @param {HTMLElement} options.sentinel - 哨兵元素（列表底部）
 * @param {string} [options.rootMargin='100px']
 * @returns {{ destroy: Function }}
 */
function infiniteScrollByObserver(options) {
  options = options || {};
  var loadMore = options.loadMore;
  var sentinel = options.sentinel;
  var rootMargin = options.rootMargin || "100px";

  var loading = false;
  var hasMore = true;

  if (!("IntersectionObserver" in window)) {
    return infiniteScrollByScroll(options);
  }

  var observer = new IntersectionObserver(
    async function (entries) {
      if (entries[0].isIntersecting && !loading && hasMore) {
        loading = true;
        try {
          var result = await loadMore();
          if (result && result.hasMore === false) {
            hasMore = false;
            observer.disconnect();
          }
        } catch (e) {
          console.error("加载失败", e);
        } finally {
          loading = false;
        }
      }
    },
    { rootMargin: rootMargin },
  );

  observer.observe(sentinel);

  return {
    destroy: function () {
      observer.disconnect();
    },
  };
}

// ===== 测试用例（需浏览器环境） =====
// HTML:
// <div id="list"></div>
// <div id="sentinel">加载中...</div>
//
// var page = 1;
// function loadMore() {
//   return fetch('/api/items?page=' + page)
//     .then(function (r) { return r.json(); })
//     .then(function (data) {
//       data.items.forEach(function (item) {
//         var div = document.createElement('div');
//         div.textContent = item.name;
//         list.appendChild(div);
//       });
//       page++;
//       return { hasMore: data.hasMore };
//     });
// }
//
// infiniteScrollByObserver({
//   loadMore: loadMore,
//   sentinel: document.getElementById('sentinel'),
//   rootMargin: '200px',
// });

// 模拟测试：验证触发条件逻辑
function shouldTrigger(scrollTop, scrollHeight, clientHeight, threshold) {
  return scrollHeight - scrollTop - clientHeight < threshold;
}
console.log(shouldTrigger(900, 1000, 100, 100)); // => true （距底部 0px）
console.log(shouldTrigger(700, 1000, 100, 100)); // => false （距底部 200px）
console.log(shouldTrigger(800, 1000, 100, 100)); // => true （距底部 100px，等于阈值）
