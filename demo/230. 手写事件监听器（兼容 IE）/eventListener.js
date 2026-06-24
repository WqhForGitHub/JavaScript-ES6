/**
 * 手写事件监听器（兼容 IE）
 *
 * 现代浏览器使用 addEventListener / removeEventListener，
 * IE8 及以下使用 attachEvent / detachEvent（事件名带 'on' 前缀，且 this 指向 window）。
 * 这里封装一个跨浏览器的事件监听器，统一处理：
 *   - 事件名转换
 *   - this 绑定
 *   - 事件对象兼容（IE 的 window.event）
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 添加事件监听（跨浏览器兼容）
 * @param {Element|Document|Window} element - 目标元素
 * @param {string} event - 事件名（不带 on 前缀），如 'click'
 * @param {Function} handler - 事件处理函数
 * @returns {Function} 真正注册的包装函数（用于移除时使用）
 */
function addEvent(element, event, handler) {
  if (element.addEventListener) {
    // 现代浏览器
    element.addEventListener(event, handler, false);
    return handler;
  } else if (element.attachEvent) {
    // IE8 及以下：需要修正 this 指向和事件对象
    var wrappedHandler = function () {
      // IE 中事件对象在 window.event，且 this 指向 window
      var e = window.event;
      e.target = e.target || e.srcElement;
      e.preventDefault = e.preventDefault || function () { e.returnValue = false; };
      e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true; };
      handler.call(element, e);
    };
    element.attachEvent('on' + event, wrappedHandler);
    // 存储映射关系以便移除
    element._eventMap = element._eventMap || {};
    element._eventMap[event] = element._eventMap[event] || [];
    element._eventMap[event].push({ original: handler, wrapped: wrappedHandler });
    return wrappedHandler;
  } else {
    // 最后退路：使用 onxxx 属性
    element['on' + event] = handler;
    return handler;
  }
}

/**
 * 移除事件监听（跨浏览器兼容）
 * @param {Element|Document|Window} element - 目标元素
 * @param {string} event - 事件名
 * @param {Function} handler - 原始处理函数
 */
function removeEvent(element, event, handler) {
  if (element.removeEventListener) {
    element.removeEventListener(event, handler, false);
  } else if (element.detachEvent) {
    // 从映射中找到对应的包装函数
    if (element._eventMap && element._eventMap[event]) {
      var list = element._eventMap[event];
      for (var i = 0; i < list.length; i++) {
        if (list[i].original === handler) {
          element.detachEvent('on' + event, list[i].wrapped);
          list.splice(i, 1);
          break;
        }
      }
    }
  } else {
    element['on' + event] = null;
  }
}

// ===== 测试用例（需浏览器环境） =====
// var btn = document.getElementById('btn');
// function clickHandler(e) {
//   console.log('clicked', this, e.target);
// }
// addEvent(btn, 'click', clickHandler);
// // 点击按钮输出：clicked <button> <button>
// removeEvent(btn, 'click', clickHandler);
// // 移除后不再触发

// 模拟测试：验证事件存取逻辑
var mockEl = {
  _events: {},
  addEventListener: function (event, handler) { this._events[event] = handler; },
  removeEventListener: function (event, handler) { delete this._events[event]; },
};

var handler = function (e) { console.log('handle', e); };
addEvent(mockEl, 'click', handler);
console.log(mockEl._events['click'] === handler); // => true
removeEvent(mockEl, 'click', handler);
console.log(mockEl._events['click']); // => undefined
