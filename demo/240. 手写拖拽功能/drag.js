/**
 * 手写拖拽功能
 *
 * 实现元素拖拽：
 *   - mousedown 记录初始位置
 *   - mousemove 更新元素位置
 *   - mouseup 结束拖拽
 * 支持边界限制、拖拽回调、触摸事件兼容。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 让元素可拖拽
 * @param {HTMLElement} element - 可拖拽元素
 * @param {Object} [options]
 * @param {boolean} [options.boundary=false] - 是否限制在父元素边界内
 * @param {Function} [options.onStart] - 拖拽开始回调
 * @param {Function} [options.onMove] - 拖拽中回调（传入 x, y）
 * @param {Function} [options.onEnd] - 拖拽结束回调
 * @param {boolean} [options.touch=true] - 是否支持触摸
 * @returns {{ destroy: Function }}
 */
function makeDraggable(element, options) {
  options = options || {};
  var boundary = options.boundary || false;
  var onStart = options.onStart || function () {};
  var onMove = options.onMove || function () {};
  var onEnd = options.onEnd || function () {};
  var supportTouch = options.touch !== false;

  var dragging = false;
  var startX = 0;
  var startY = 0;
  var elemX = 0;
  var elemY = 0;

  // 确保 position 为 absolute 或 fixed
  var position = getComputedStyle(element).position;
  if (position === 'static' || !position) {
    element.style.position = 'absolute';
  }

  function getEventPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function handleStart(e) {
    e.preventDefault();
    dragging = true;
    var pos = getEventPos(e);
    startX = pos.x;
    startY = pos.y;
    // 获取当前元素位置
    var rect = element.getBoundingClientRect();
    elemX = rect.left;
    elemY = rect.top;
    element.style.left = elemX + 'px';
    element.style.top = elemY + 'px';
    element.style.margin = '0';
    onStart(e, { x: elemX, y: elemY });
  }

  function handleMove(e) {
    if (!dragging) return;
    e.preventDefault();
    var pos = getEventPos(e);
    var dx = pos.x - startX;
    var dy = pos.y - startY;
    var newX = elemX + dx;
    var newY = elemY + dy;

    // 边界限制
    if (boundary) {
      var parent = element.offsetParent || document.body;
      var parentRect = parent.getBoundingClientRect();
      var elemRect = element.getBoundingClientRect();
      var maxX = parentRect.width - elemRect.width;
      var maxY = parentRect.height - elemRect.height;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
    }

    element.style.left = newX + 'px';
    element.style.top = newY + 'px';
    onMove(e, { x: newX, y: newY });
  }

  function handleEnd(e) {
    if (!dragging) return;
    dragging = false;
    var left = parseFloat(element.style.left) || 0;
    var top = parseFloat(element.style.top) || 0;
    onEnd(e, { x: left, y: top });
  }

  // 鼠标事件
  element.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);

  // 触摸事件
  if (supportTouch) {
    element.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }

  return {
    destroy: function () {
      element.removeEventListener('mousedown', handleStart);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      if (supportTouch) {
        element.removeEventListener('touchstart', handleStart);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      }
    },
  };
}

// ===== 测试用例（需浏览器环境） =====
// var box = document.getElementById('box');
// makeDraggable(box, {
//   boundary: true,
//   onStart: function (e, pos) { console.log('开始拖拽', pos); },
//   onMove: function (e, pos) { console.log('拖拽中', pos); },
//   onEnd: function (e, pos) { console.log('结束拖拽', pos); },
// });

// 模拟测试：验证拖拽位置计算逻辑
function calcNewPosition(startX, startY, currentX, currentY, elemX, elemY) {
  var dx = currentX - startX;
  var dy = currentY - startY;
  return { x: elemX + dx, y: elemY + dy };
}
console.log(calcNewPosition(100, 100, 150, 130, 200, 200)); // => { x: 250, y: 230 }

function clamp(val, min, max) {
  return Math.max(min, Math.min(val, max));
}
console.log(clamp(-10, 0, 500)); // => 0
console.log(clamp(600, 0, 500)); // => 500
console.log(clamp(250, 0, 500)); // => 250
