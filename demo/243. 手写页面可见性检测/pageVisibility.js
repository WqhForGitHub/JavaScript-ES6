/**
 * 手写页面可见性检测
 *
 * 使用 Page Visibility API 检测页面是否可见（切换标签页、最小化等）。
 * 用于：暂停视频播放、停止轮询、节省资源等。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 获取浏览器支持的 visibility 属性名
 * @returns {{ hidden: string, visibilityChange: string } | null}
 */
function getVisibilityProp() {
  if (typeof document === "undefined") return null;
  if ("hidden" in document) {
    return { hidden: "hidden", visibilityChange: "visibilitychange" };
  }
  if ("webkitHidden" in document) {
    return {
      hidden: "webkitHidden",
      visibilityChange: "webkitvisibilitychange",
    };
  }
  if ("mozHidden" in document) {
    return { hidden: "mozHidden", visibilityChange: "mozvisibilitychange" };
  }
  if ("msHidden" in document) {
    return { hidden: "msHidden", visibilityChange: "msvisibilitychange" };
  }
  return null;
}

/**
 * 获取当前页面是否可见
 * @returns {boolean} true 表示可见
 */
function isVisible() {
  var prop = getVisibilityProp();
  if (!prop) return true; // 不支持时默认可见
  return !document[prop.hidden];
}

/**
 * 监听页面可见性变化
 * @param {Object} handlers
 * @param {Function} [handlers.onVisible] - 页面变为可见时回调
 * @param {Function} [handlers.onHidden] - 页面变为不可见时回调
 * @param {Function} [handlers.onChange] - 任意变化回调（传入 isVisible）
 * @returns {Function} 取消监听函数
 */
function onVisibilityChange(handlers) {
  handlers = handlers || {};
  var prop = getVisibilityProp();
  if (!prop) {
    console.warn("当前浏览器不支持 Page Visibility API");
    return function () {};
  }

  var handler = function () {
    var visible = isVisible();
    if (visible && handlers.onVisible) {
      handlers.onVisible();
    }
    if (!visible && handlers.onHidden) {
      handlers.onHidden();
    }
    if (handlers.onChange) {
      handlers.onChange(visible);
    }
  };

  document.addEventListener(prop.visibilityChange, handler);

  return function () {
    document.removeEventListener(prop.visibilityChange, handler);
  };
}

/**
 * 创建页面可见性检测器（带状态记录）
 * @returns {{ isVisible: Function, onChange: Function, destroy: Function }}
 */
function createVisibilityDetector() {
  var listeners = [];
  var destroy = onVisibilityChange({
    onChange: function (visible) {
      listeners.forEach(function (fn) {
        fn(visible);
      });
    },
  });

  return {
    isVisible: isVisible,
    onChange: function (fn) {
      listeners.push(fn);
      return function () {
        listeners = listeners.filter(function (l) {
          return l !== fn;
        });
      };
    },
    destroy: destroy,
  };
}

// ===== 测试用例（需浏览器环境） =====
// var detector = createVisibilityDetector();
// detector.onChange(function (visible) {
//   console.log(visible ? '页面可见' : '页面隐藏');
//   if (!visible) {
//     // 切到后台时暂停视频
//     video.pause();
//   } else {
//     // 回到前台时恢复
//     video.play();
//   }
// });
//
// // 直接使用
// onVisibilityChange({
//   onVisible: function () { console.log('欢迎回来！'); },
//   onHidden: function () { console.log('页面已隐藏'); },
// });

// 模拟测试
var mockDoc = { hidden: false, webkitHidden: undefined };
function mockGetProp() {
  if ("hidden" in mockDoc)
    return { hidden: "hidden", visibilityChange: "visibilitychange" };
  return null;
}
function mockIsVisible() {
  var prop = mockGetProp();
  if (!prop) return true;
  return !mockDoc[prop.hidden];
}
console.log(mockIsVisible()); // => true
mockDoc.hidden = true;
console.log(mockIsVisible()); // => false

// 验证回调逻辑
var stateLog = [];
function simulateChange(visible) {
  if (visible) stateLog.push("visible");
  else stateLog.push("hidden");
}
simulateChange(false);
simulateChange(true);
simulateChange(false);
console.log(stateLog); // => ['hidden', 'visible', 'hidden']
