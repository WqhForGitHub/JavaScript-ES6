/**
 * 手写全屏切换
 *
 * 使用 Fullscreen API 实现进入/退出/切换全屏。
 * 需要处理不同浏览器前缀兼容（webkit、moz、ms）。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 判断当前是否处于全屏状态
 * @returns {boolean}
 */
function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * 获取支持的全屏 API 方法名
 */
function getFullscreenMethods(element) {
  return {
    request:
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen,
    exit:
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen,
  };
}

/**
 * 进入全屏
 * @param {HTMLElement} [element] - 要全屏的元素（默认 document.documentElement）
 * @returns {Promise|undefined}
 */
function enterFullscreen(element) {
  element = element || document.documentElement;
  var methods = getFullscreenMethods(element);
  if (methods.request) {
    // 部分 Safari 需要传参数
    var promise = methods.request.call(element);
    return promise;
  }
  console.warn("当前浏览器不支持全屏 API");
  return Promise.reject(new Error("Fullscreen API not supported"));
}

/**
 * 退出全屏
 * @returns {Promise|undefined}
 */
function exitFullscreen() {
  var methods = getFullscreenMethods(document);
  if (methods.exit) {
    return methods.exit.call(document);
  }
  return Promise.reject(new Error("Fullscreen API not supported"));
}

/**
 * 切换全屏状态
 * @param {HTMLElement} [element]
 * @returns {Promise}
 */
function toggleFullscreen(element) {
  if (isFullscreen()) {
    return exitFullscreen();
  } else {
    return enterFullscreen(element);
  }
}

/**
 * 监听全屏状态变化
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听函数
 */
function onFullscreenChange(callback) {
  var eventName =
    "fullscreenchange" in document
      ? "fullscreenchange"
      : "webkitfullscreenchange" in document
        ? "webkitfullscreenchange"
        : "mozfullscreenchange" in document
          ? "mozfullscreenchange"
          : "msfullscreenchange";

  var handler = function () {
    callback(isFullscreen());
  };

  document.addEventListener(eventName, handler);

  return function () {
    document.removeEventListener(eventName, handler);
  };
}

// ===== 测试用例（需浏览器环境） =====
// var btn = document.getElementById('fullscreen-btn');
// btn.addEventListener('click', function () {
//   toggleFullscreen(document.getElementById('video'));
// });
//
// onFullscreenChange(function (isFs) {
//   console.log('全屏状态：', isFs ? '全屏中' : '非全屏');
//   btn.textContent = isFs ? '退出全屏' : '全屏';
// });

// 模拟测试：验证全屏判断逻辑
function checkFullscreen(elements) {
  return !!(elements.fullscreenElement || elements.webkitFullscreenElement);
}
console.log(checkFullscreen({})); // => false
console.log(checkFullscreen({ fullscreenElement: { tag: "video" } })); // => true
console.log(checkFullscreen({ webkitFullscreenElement: { tag: "div" } })); // => true

// 验证 toggle 逻辑
function toggleLogic(isFs) {
  return isFs ? "exit" : "enter";
}
console.log(toggleLogic(false)); // => 'enter'
console.log(toggleLogic(true)); // => 'exit'
