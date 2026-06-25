/**
 * 手写事件委托
 *
 * 事件委托利用事件冒泡机制，将子元素的事件统一绑定到父元素上，
 * 通过 event.target 判断实际触发的子元素。优点：
 *   - 减少事件绑定数量，节省内存
 *   - 动态添加的子元素自动拥有事件处理
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 事件委托：在父元素上代理子元素的点击事件
 * @param {Element} parent - 父元素
 * @param {string} type - 事件类型，如 'click'
 * @param {string} tagName - 需要代理的子元素标签名
 * @param {Function} handler - 事件处理函数
 * @returns {Function} 实际绑定的处理函数（用于解绑）
 */
function eventDelegate(parent, type, tagName, handler) {
  var wrappedHandler = function (e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    // 沿 DOM 树向上查找，直到找到匹配的标签或到达 parent
    while (target && target !== parent) {
      if (
        target.tagName &&
        target.tagName.toLowerCase() === tagName.toLowerCase()
      ) {
        // 修正 this 指向为实际触发的元素
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
// <ul id="list">
//   <li>item 1</li>
//   <li>item 2</li>
//   <li>item 3</li>
// </ul>
//
// var list = document.getElementById('list');
// eventDelegate(list, 'click', 'li', function (e) {
//   console.log('你点击了', this.textContent);
// });
// // 点击任意 li 输出对应文本
// // 动态新增的 li 也会自动生效：
// var li = document.createElement('li');
// li.textContent = 'item 4';
// list.appendChild(li);

// 模拟测试：验证委托逻辑
function createMockEventDelegate() {
  var events = {};
  return {
    on: function (type, handler) {
      events[type] = handler;
    },
    trigger: function (type, target) {
      // 模拟冒泡过程
      var node = target;
      while (node) {
        if (events[type]) {
          return events[type]({ target: target, current: node });
        }
        node = node.parent;
      }
    },
  };
}

var mockParent = createMockEventDelegate();
var child1 = { tag: "li", text: "item 1", parent: mockParent };
var child2 = { tag: "li", text: "item 2", parent: mockParent };

eventDelegate(mockParent, "click", "li", function (e) {
  console.log("你点击了", this.text);
});
// 模拟触发
mockParent.trigger("click", child1); // => 你点击了 item 1
mockParent.trigger("click", child2); // => 你点击了 item 2
