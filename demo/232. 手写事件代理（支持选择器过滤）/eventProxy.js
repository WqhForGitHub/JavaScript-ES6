/**
 * 手写事件代理（支持选择器过滤）
 *
 * 在事件委托基础上，支持通过 CSS 选择器过滤目标元素，
 * 而不仅仅通过标签名。支持 #id、.class、tag 以及组合选择器。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 判断元素是否匹配选择器（兼容写法）
 * @param {Element} element
 * @param {string} selector
 * @returns {boolean}
 */
function matchesSelector(element, selector) {
  if (element.matches) {
    return element.matches(selector);
  }
  if (element.matchesSelector) {
    return element.matchesSelector(selector);
  }
  // 兼容前缀
  var prefixes = [
    "webkitMatchesSelector",
    "mozMatchesSelector",
    "msMatchesSelector",
    "oMatchesSelector",
  ];
  for (var i = 0; i < prefixes.length; i++) {
    if (element[prefixes[i]]) {
      return element[prefixes[i]](selector);
    }
  }
  // 手动实现简单选择器匹配
  return simpleMatch(element, selector);
}

/**
 * 简单选择器匹配（id / class / tag）
 */
function simpleMatch(element, selector) {
  selector = selector.trim();
  // id 选择器
  if (selector[0] === "#") {
    return element.id === selector.slice(1);
  }
  // class 选择器
  if (selector[0] === ".") {
    var classes = element.className ? element.className.split(/\s+/) : [];
    return classes.indexOf(selector.slice(1)) !== -1;
  }
  // 组合选择器 div.cls
  var combo = selector.match(/^(\w+)?(?:\.([\w-]+))?(?:#([\w-]+))?$/);
  if (combo) {
    if (combo[1] && element.tagName.toLowerCase() !== combo[1].toLowerCase())
      return false;
    if (combo[2]) {
      var cls = element.className ? element.className.split(/\s+/) : [];
      if (cls.indexOf(combo[2]) === -1) return false;
    }
    if (combo[3] && element.id !== combo[3]) return false;
    return true;
  }
  // 标签选择器
  return (
    element.tagName && element.tagName.toLowerCase() === selector.toLowerCase()
  );
}

/**
 * 事件代理（支持选择器过滤）
 * @param {Element} parent - 父元素
 * @param {string} type - 事件类型
 * @param {string} selector - CSS 选择器
 * @param {Function} handler - 事件处理函数
 * @returns {Function} 实际绑定的函数（用于解绑）
 */
function eventProxy(parent, type, selector, handler) {
  var wrappedHandler = function (e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    // 沿 DOM 树向上查找匹配选择器的元素
    while (target && target !== parent) {
      if (matchesSelector(target, selector)) {
        return handler.call(target, e);
      }
      target = target.parentNode;
    }
  };
  if (parent.addEventListener) {
    parent.addEventListener(type, wrappedHandler, false);
  } else {
    parent.attachEvent("on" + type, wrappedHandler);
  }
  return wrappedHandler;
}

// ===== 测试用例（需浏览器环境） =====
// <div id="container">
//   <button class="btn primary">按钮1</button>
//   <button class="btn">按钮2</button>
//   <a href="#" class="link">链接</a>
// </div>
//
// var container = document.getElementById('container');
// eventProxy(container, 'click', '.btn.primary', function (e) {
//   console.log('点击了主按钮', this.textContent);
// });
// // 只有 .btn.primary 的按钮会触发

// 模拟测试
var mockEl = {
  tag: "button",
  className: "btn primary",
  id: "submit",
  parent: null,
};
console.log(simpleMatch(mockEl, ".primary")); // => true
console.log(simpleMatch(mockEl, "button.btn")); // => true
console.log(simpleMatch(mockEl, "#submit")); // => true
console.log(simpleMatch(mockEl, "button.primary#submit")); // => true
console.log(simpleMatch(mockEl, ".not-exist")); // => false
