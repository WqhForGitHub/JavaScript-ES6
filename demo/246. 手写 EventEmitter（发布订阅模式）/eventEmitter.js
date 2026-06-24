/**
 * 手写 EventEmitter（发布订阅模式）
 *
 * 发布订阅模式：发布者不会直接通知订阅者，而是通过事件中心转发。
 * 核心 API：
 *   - on(event, callback)：订阅事件
 *   - emit(event, ...args)：发布事件
 *   - off(event, callback)：取消订阅
 *
 * 这是基础版本，支持多监听、参数传递。
 */

function EventEmitter() {
  this.events = {};
}

/**
 * 订阅事件
 * @param {string} event - 事件名
 * @param {Function} callback - 回调函数
 * @returns {this}
 */
EventEmitter.prototype.on = function (event, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
  return this;
};

/**
 * 别名：addEventListener
 */
EventEmitter.prototype.addEventListener = EventEmitter.prototype.on;

/**
 * 发布事件
 * @param {string} event - 事件名
 * @param {...*} args - 参数
 * @returns {boolean} 是否有监听器被调用
 */
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var callbacks = this.events[event];
  if (!callbacks || callbacks.length === 0) {
    return false;
  }
  // 复制一份，避免回调中修改数组导致问题
  callbacks.slice().forEach(function (cb) {
    cb.apply(null, args);
  });
  return true;
};

/**
 * 取消订阅
 * @param {string} event - 事件名
 * @param {Function} [callback] - 要移除的回调，不传则移除全部
 * @returns {this}
 */
EventEmitter.prototype.off = function (event, callback) {
  if (!this.events[event]) return this;
  if (!callback) {
    delete this.events[event];
    return this;
  }
  this.events[event] = this.events[event].filter(function (cb) {
    return cb !== callback;
  });
  if (this.events[event].length === 0) {
    delete this.events[event];
  }
  return this;
};

/**
 * 别名：removeEventListener
 */
EventEmitter.prototype.removeEventListener = EventEmitter.prototype.off;

/**
 * 获取某事件的监听器数量
 * @param {string} event
 * @returns {number}
 */
EventEmitter.prototype.listenerCount = function (event) {
  return this.events[event] ? this.events[event].length : 0;
};

/**
 * 获取所有事件名
 * @returns {string[]}
 */
EventEmitter.prototype.eventNames = function () {
  return Object.keys(this.events);
};

// ===== 测试用例 =====
var emitter = new EventEmitter();

// 订阅事件
function greet(name) {
  console.log('Hello, ' + name + '!');
}
emitter.on('greet', greet);
emitter.emit('greet', 'World'); // => Hello, World!

// 多个监听器
emitter.on('greet', function (name) {
  console.log('Hi, ' + name);
});
emitter.emit('greet', 'Alice');
// => Hello, Alice!
// => Hi, Alice

// 多参数
emitter.on('data', function (a, b, c) {
  console.log('收到：', a, b, c);
});
emitter.emit('data', 1, 2, 3); // => 收到： 1 2 3

// 取消订阅
emitter.off('greet', greet);
emitter.emit('greet', 'Bob'); // => Hi, Bob （greet 已被移除）

// listenerCount
console.log(emitter.listenerCount('greet')); // => 1
console.log(emitter.listenerCount('data')); // => 1
console.log(emitter.listenerCount('notexist')); // => 0

// 全部移除
emitter.off('greet');
console.log(emitter.listenerCount('greet')); // => 0
emitter.emit('greet', 'Test'); // 无输出

// eventNames
console.log(emitter.eventNames()); // => ['data']
