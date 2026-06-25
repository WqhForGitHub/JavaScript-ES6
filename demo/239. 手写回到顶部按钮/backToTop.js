/**
 * 手写回到顶部按钮
 *
 * 功能：
 *   - 滚动超过一定距离时显示按钮，否则隐藏
 *   - 点击按钮平滑滚动回顶部
 *   - 支持自定义动画时长和缓动函数
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 缓动函数集合
 */
var easing = {
  linear: function (t) {
    return t;
  },
  easeInQuad: function (t) {
    return t * t;
  },
  easeOutQuad: function (t) {
    return t * (2 - t);
  },
  easeInOutCubic: function (t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
};

/**
 * 平滑滚动到顶部
 * @param {number} [duration=500] - 动画时长 ms
 * @param {Function} [easingFn] - 缓动函数
 */
function scrollToTop(duration, easingFn) {
  duration = duration || 500;
  easingFn = easingFn || easing.easeInOutCubic;

  var startY =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;
  var startTime = Date.now();

  function step() {
    var elapsed = Date.now() - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = easingFn(progress);
    var currentY = startY * (1 - eased);
    window.scrollTo(0, currentY);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  if (startY > 0) {
    window.requestAnimationFrame(step);
  }
}

/**
 * 创建回到顶部按钮
 * @param {Object} [options]
 * @param {number} [options.showThreshold=300] - 显示按钮的滚动距离阈值
 * @param {number} [options.duration=500] - 滚动动画时长
 * @param {string} [options.text='回到顶部'] - 按钮文字
 * @returns {{ destroy: Function, button: HTMLElement }}
 */
function createBackToTopButton(options) {
  options = options || {};
  var showThreshold =
    options.showThreshold != null ? options.showThreshold : 300;
  var duration = options.duration || 500;
  var text = options.text || "回到顶部";

  // 创建按钮元素
  var button = document.createElement("button");
  button.textContent = text;
  button.style.cssText = [
    "position: fixed",
    "right: 30px",
    "bottom: 30px",
    "display: none",
    "padding: 10px 16px",
    "background: #4CAF50",
    "color: #fff",
    "border: none",
    "border-radius: 6px",
    "cursor: pointer",
    "z-index: 9999",
    "box-shadow: 0 2px 8px rgba(0,0,0,0.2)",
  ].join(";");
  document.body.appendChild(button);

  // 点击事件
  button.addEventListener("click", function () {
    scrollToTop(duration, easing.easeInOutCubic);
  });

  // 滚动监听（节流）
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        var scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        button.style.display = scrollTop > showThreshold ? "block" : "none";
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll);

  return {
    button: button,
    destroy: function () {
      window.removeEventListener("scroll", onScroll);
      document.body.removeChild(button);
    },
  };
}

// ===== 测试用例（需浏览器环境） =====
// var btn = createBackToTopButton({ showThreshold: 400, duration: 800 });
// // 滚动超过 400px 时按钮出现，点击平滑回顶部

// 测试缓动函数
console.log(easing.linear(0)); // => 0
console.log(easing.linear(1)); // => 1
console.log(easing.linear(0.5)); // => 0.5
console.log(easing.easeInQuad(0.5)); // => 0.25
console.log(easing.easeOutQuad(0.5)); // => 0.75
console.log(easing.easeInOutCubic(0)); // => 0
console.log(easing.easeInOutCubic(1)); // => 1

// 测试滚动位置计算逻辑
function getProgress(elapsed, duration) {
  return Math.min(elapsed / duration, 1);
}
console.log(getProgress(250, 500)); // => 0.5
console.log(getProgress(500, 500)); // => 1
console.log(getProgress(600, 500)); // => 1
