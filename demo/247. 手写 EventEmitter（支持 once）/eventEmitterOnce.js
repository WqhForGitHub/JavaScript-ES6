/**
 * 手写 EventEmitter（支持 once）
 *
 * once：注册的监听器只触发一次，触发后自动移除。
 * 实现思路：用包装函数包裹原回调，触发后自动 off。
 */

function EventEmitter() {
  this.events = {};
}

/**
 * 订阅事件
 */
EventEmitter.prototype.on = function (event, callback) {
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function");
  }
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push({ fn: callback, once: false });
  return this;
};

/**
 * 订阅事件（只触发一次）
 * @param {string} event
 * @param {Function} callback
 * @returns {this}
 */
EventEmitter.prototype.once = function (event, callback) {
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function");
  }
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push({ fn: callback, once: true });
  return this;
};

/**
 * 发布事件
 */
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.events[event];
  if (!listeners || listeners.length === 0) {
    return false;
  }
  // 复制一份遍历
  var snapshot = listeners.slice();
  // 收集需要移除的 once 监听器
  var toRemove = [];
  snapshot.forEach(function (item) {
    item.fn.apply(null, args);
    if (item.once) {
      toRemove.push(item);
    }
  });
  // 移除已触发的 once 监听器
  if (toRemove.length > 0) {
    this.events[event] = listeners.filter(function (item) {
      return toRemove.indexOf(item) === -1;
    });
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }
  return true;
};

/**
 * 取消订阅
 */
EventEmitter.prototype.off = function (event, callback) {
  if (!this.events[event]) return this;
  if (!callback) {
    delete this.events[event];
    return this;
  }
  this.events[event] = this.events[event].filter(function (item) {
    return item.fn !== callback;
  });
  if (this.events[event].length === 0) {
    delete this.events[event];
  }
  return this;
};

/**
 * 监听器数量
 */
EventEmitter.prototype.listenerCount = function (event) {
  return this.events[event] ? this.events[event].length : 0;
};

// ===== 测试用例 =====
var emitter = new EventEmitter();

// once 只触发一次
var count = 0;
emitter.once("connect", function () {
  count++;
  console.log("连接成功，count =", count);
});
emitter.emit("connect"); // => 连接成功，count = 1
emitter.emit("connect"); // 无输出（已被移除）
emitter.emit("connect"); // 无输出
console.log("once 监听器数量：", emitter.listenerCount("connect")); // => 0

// once 带参数
emitter.once("msg", function (text) {
  console.log("收到消息：", text);
});
emitter.emit("msg", "hello"); // => 收到消息： hello
emitter.emit("msg", "world"); // 无输出

// on 和 once 混合
var logCount = 0;
function logger() {
  logCount++;
  console.log("log #" + logCount);
}
emitter.on("log", logger);
emitter.once("log", function () {
  console.log("一次性 log");
});

emitter.emit("log"); // => log #1 \n 一次性 log
emitter.emit("log"); // => log #2 （once 已移除）
emitter.emit("log"); // => log #3
console.log("log 监听器数量：", emitter.listenerCount("log")); // => 1

// off 取消 once 注册的回调
function onceCb() {
  console.log("once cb");
}
emitter.once("test", onceCb);
emitter.off("test", onceCb);
console.log(emitter.listenerCount("test")); // => 0
emitter.emit("test"); // 无输出
