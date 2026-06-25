/**
 * 手写 EventEmitter（支持 off 取消订阅）
 *
 * 重点实现 off 的多种用法：
 *   - off(event, callback)：移除指定回调
 *   - off(event)：移除该事件的所有回调
 *   - off()：移除所有事件的所有回调
 * 同时支持返回一个可用来取消订阅的函数（类似 disposable）。
 */

function EventEmitter() {
  this.events = {};
}

/**
 * 订阅事件，返回取消订阅函数
 * @param {string} event
 * @param {Function} callback
 * @returns {Function} 调用即可取消订阅
 */
EventEmitter.prototype.on = function (event, callback) {
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function");
  }
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);

  var self = this;
  return function dispose() {
    self.off(event, callback);
  };
};

/**
 * 发布事件
 */
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var callbacks = this.events[event];
  if (!callbacks) return false;
  callbacks.slice().forEach(function (cb) {
    cb.apply(null, args);
  });
  return true;
};

/**
 * 取消订阅
 * @param {string} [event] - 事件名（不传则移除全部）
 * @param {Function} [callback] - 回调（不传则移除该事件全部）
 * @returns {this}
 */
EventEmitter.prototype.off = function (event, callback) {
  // 无参数：移除所有
  if (arguments.length === 0) {
    this.events = {};
    return this;
  }
  // 只有 event：移除该事件全部
  if (arguments.length === 1) {
    delete this.events[event];
    return this;
  }
  // 有 event 和 callback：移除指定回调
  if (!this.events[event]) return this;
  this.events[event] = this.events[event].filter(function (cb) {
    return cb !== callback;
  });
  if (this.events[event].length === 0) {
    delete this.events[event];
  }
  return this;
};

/**
 * 移除所有监听器（off 的语义化别名）
 */
EventEmitter.prototype.removeAllListeners = function (event) {
  if (event) {
    delete this.events[event];
  } else {
    this.events = {};
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

// 1. 使用返回的 dispose 函数取消订阅
function handler1() {
  console.log("handler1");
}
var dispose1 = emitter.on("click", handler1);
emitter.emit("click"); // => handler1
dispose1();
emitter.emit("click"); // 无输出
console.log(emitter.listenerCount("click")); // => 0

// 2. off(event, callback) 移除指定回调
function handler2() {
  console.log("handler2");
}
function handler3() {
  console.log("handler3");
}
emitter.on("click", handler2);
emitter.on("click", handler3);
emitter.emit("click"); // => handler2 \n handler3
emitter.off("click", handler2);
emitter.emit("click"); // => handler3 （handler2 已移除）
console.log(emitter.listenerCount("click")); // => 1

// 3. off(event) 移除该事件全部
emitter.off("click");
console.log(emitter.listenerCount("click")); // => 0
emitter.emit("click"); // 无输出

// 4. off() 移除所有事件
emitter.on("a", function () {
  console.log("a");
});
emitter.on("b", function () {
  console.log("b");
});
console.log(emitter.listenerCount("a")); // => 1
console.log(emitter.listenerCount("b")); // => 1
emitter.off();
console.log(emitter.listenerCount("a")); // => 0
console.log(emitter.listenerCount("b")); // => 0

// 5. removeAllListeners
emitter.on("test", function () {});
emitter.removeAllListeners("test");
console.log(emitter.listenerCount("test")); // => 0

// 6. 回调中取消订阅不会出错
emitter.on("data", function () {
  console.log("data received");
});
emitter.emit("data"); // => data received
