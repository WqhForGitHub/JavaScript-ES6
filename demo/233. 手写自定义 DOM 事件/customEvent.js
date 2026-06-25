/**
 * 手写自定义 DOM 事件
 *
 * 自定义事件允许开发者创建并触发自己的事件类型。
 * 现代 API：new CustomEvent(type, options)
 * 兼容写法：document.createEvent + initCustomEvent
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 创建自定义事件（跨浏览器兼容）
 * @param {string} type - 事件类型名
 * @param {Object} [options] - 选项
 * @param {boolean} [options.bubbles=false] - 是否冒泡
 * @param {boolean} [options.cancelable=false] - 是否可取消
 * @param {*} [options.detail=null] - 自定义数据
 * @returns {CustomEvent|Event}
 */
function createCustomEvent(type, options) {
  options = options || {};
  var bubbles = options.bubbles || false;
  var cancelable = options.cancelable || false;
  var detail = options.detail || null;

  if (typeof CustomEvent === "function") {
    // 现代浏览器
    return new CustomEvent(type, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: detail,
    });
  } else {
    // IE9-11 兼容写法
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(type, bubbles, cancelable, detail);
    return event;
  }
}

/**
 * 监听自定义事件
 * @param {EventTarget} target - 目标
 * @param {string} type - 事件类型
 * @param {Function} handler - 处理函数
 */
function on(target, type, handler) {
  if (target.addEventListener) {
    target.addEventListener(type, handler, false);
  } else {
    target.attachEvent("on" + type, handler);
  }
}

/**
 * 触发自定义事件
 * @param {EventTarget} target - 目标
 * @param {string|Event} event - 事件类型名或事件对象
 */
function emit(target, event) {
  var evt = typeof event === "string" ? createCustomEvent(event) : event;
  if (target.dispatchEvent) {
    target.dispatchEvent(evt);
  } else {
    target.fireEvent("on" + evt.type, evt);
  }
}

/**
 * 移除自定义事件监听
 * @param {EventTarget} target
 * @param {string} type
 * @param {Function} handler
 */
function off(target, type, handler) {
  if (target.removeEventListener) {
    target.removeEventListener(type, handler, false);
  } else {
    target.detachEvent("on" + type, handler);
  }
}

// ===== 测试用例（需浏览器环境） =====
// var btn = document.getElementById('btn');
// on(btn, 'myevent', function (e) {
//   console.log('收到自定义事件，数据：', e.detail);
// });
// emit(btn, createCustomEvent('myevent', { detail: { msg: 'hello' } }));
// // 输出：收到自定义事件，数据： { msg: 'hello' }

// 模拟测试：用简单 EventEmitter 验证自定义事件概念
var eventTarget = {
  _listeners: {},
  addEventListener: function (type, handler) {
    (this._listeners[type] = this._listeners[type] || []).push(handler);
  },
  removeEventListener: function (type, handler) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(function (h) {
      return h !== handler;
    });
  },
  dispatchEvent: function (event) {
    var handlers = this._listeners[event.type] || [];
    handlers.forEach(function (h) {
      h(event);
    });
    return true;
  },
};

on(eventTarget, "greet", function (e) {
  console.log("收到：", e.detail.message);
});
emit(eventTarget, createCustomEvent("greet", { detail: { message: "你好" } }));
// => 收到： 你好
