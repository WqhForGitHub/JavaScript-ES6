/**
 * 手写 Vue 的 nextTick
 *
 * nextTick 用于在下次 DOM 更新循环结束后执行回调。
 * Vue 的响应式更新是异步的（批量更新），数据变化后 DOM 不会立即更新，
 * 需要用 nextTick 确保在 DOM 更新后再操作。
 *
 * 实现原理：
 *   - 维护一个回调队列
 *   - 使用微任务（Promise.then / MutationObserver / queueMicrotask）
 *     或宏任务（setImmediate / setTimeout）延迟执行
 *   - 优先级：Promise > MutationObserver > setImmediate > setTimeout
 *   - 同一 tick 内多次调用 nextTick 只会注册一次刷新
 *   - 返回 Promise 支持 await
 */

var nextTick = (function () {
  var callbacks = []; // 待执行的回调队列
  var pending = false; // 是否已加入队列
  var timerFunc; // 延迟执行函数

  // 刷新函数：执行所有回调
  function flushCallbacks() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // 根据环境选择合适的异步 API（优先微任务）
  if (
    typeof Promise !== "undefined" &&
    Promise.toString().indexOf("[native code]") !== -1
  ) {
    // Promise（微任务）- 优先级最高
    var p = Promise.resolve();
    timerFunc = function () {
      p.then(flushCallbacks);
      // iOS UIWebView 中 Promise.then 可能不执行，加 setTimeout 兜底
      if (typeof setTimeout !== "undefined") {
        setTimeout(function () {}, 0);
      }
    };
  } else if (typeof MutationObserver !== "undefined") {
    // MutationObserver（微任务）
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, { characterData: true });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else if (typeof setImmediate !== "undefined") {
    // setImmediate（宏任务，IE10+）
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else {
    // setTimeout（宏任务兜底）
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  /**
   * nextTick 函数
   * @param {Function} [cb] - 回调函数
   * @param {Object} [ctx] - 上下文
   * @returns {Promise}
   */
  return function nextTick(cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          console.error(e);
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });

    if (!pending) {
      pending = true;
      timerFunc();
    }

    // 无回调时返回 Promise
    if (!cb && typeof Promise !== "undefined") {
      return new Promise(function (resolve) {
        _resolve = resolve;
      });
    }
  };
})();

// ===== 测试用例 =====

// 1. 回调形式
var order = [];
nextTick(function () {
  order.push("nextTick callback");
  console.log("1. 回调执行");
  console.log("执行顺序：", order);
});
order.push("sync");
console.log("0. 同步代码");
// 输出顺序：
// 0. 同步代码
// 1. 回调执行
// 执行顺序：['sync', 'nextTick callback']

// 2. Promise 形式
nextTick().then(function () {
  console.log("2. Promise 形式执行");
});

// 3. 多次调用合并为一次刷新
var tickCount = 0;
nextTick(function () {
  tickCount++;
  console.log("tick A, count =", tickCount);
});
nextTick(function () {
  tickCount++;
  console.log("tick B, count =", tickCount);
});
nextTick(function () {
  tickCount++;
  console.log("tick C, count =", tickCount);
});
// 三个回调在同一微任务中依次执行：count = 1, 2, 3

// 4. async/await 形式
async function asyncExample() {
  var val = 1;
  // 模拟数据变化后等待 DOM 更新
  await nextTick();
  console.log("4. async/await 形式，val =", val);
}
asyncExample();

// 5. 模拟 Vue 数据更新场景
var state = { count: 0 };
var domCount = 0;
function updateDOM() {
  domCount = state.count;
  console.log("DOM 更新：domCount =", domCount);
}
// 模拟 watcher
var pendingUpdate = false;
function scheduleUpdate() {
  if (!pendingUpdate) {
    pendingUpdate = true;
    nextTick(function () {
      updateDOM();
      pendingUpdate = false;
    });
  }
}

// 同步多次修改，DOM 只更新一次
state.count = 1;
scheduleUpdate();
state.count = 2;
scheduleUpdate();
state.count = 3;
scheduleUpdate();
// => DOM 更新：domCount = 3（合并为一次）
