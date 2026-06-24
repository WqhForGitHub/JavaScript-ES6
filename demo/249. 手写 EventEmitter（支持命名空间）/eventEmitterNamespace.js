/**
 * 手写 EventEmitter（支持命名空间）
 *
 * 命名空间允许按层级组织事件，使用冒号 ':' 或点 '.' 分隔。
 * 例如：
 *   - on('user:login', cb) 监听 user:login
 *   - on('user:*', cb) 通配符监听 user 下所有事件
 *   - emit('user:login') 会触发 'user:login' 和 'user:*' 的监听器
 *
 * 支持通配符 '*' 匹配任意层级。
 */

function EventEmitter() {
  this.events = {};
  this.delimiter = ':';
}

/**
 * 判断事件名是否匹配（支持通配符）
 * @param {string} pattern - 订阅的模式（可含 *）
 * @param {string} event - 实际触发的事件
 * @returns {boolean}
 */
EventEmitter.prototype._match = function (pattern, event) {
  if (pattern === event) return true;
  if (pattern === '*') return true;

  var patternParts = pattern.split(this.delimiter);
  var eventParts = event.split(this.delimiter);

  // 模式层级必须 <= 事件层级（除非用 *）
  for (var i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === '*') {
      // * 匹配剩余所有
      return true;
    }
    if (i >= eventParts.length) return false;
    if (patternParts[i] !== eventParts[i]) return false;
  }
  return patternParts.length === eventParts.length;
};

/**
 * 订阅事件（支持通配符）
 * @param {string} event - 事件名或模式
 * @param {Function} callback
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
 * 发布事件（触发匹配的所有监听器）
 * @param {string} event - 事件名
 * @param {...*} args
 * @returns {boolean}
 */
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var triggered = false;

  // 遍历所有已注册的事件模式，检查是否匹配
  Object.keys(this.events).forEach(function (pattern) {
    if (this._match(pattern, event)) {
      this.events[pattern].slice().forEach(function (cb) {
        cb.apply(null, args);
      });
      triggered = true;
    }
  }.bind(this));

  return triggered;
};

/**
 * 取消订阅
 * @param {string} event
 * @param {Function} [callback]
 * @returns {this}
 */
EventEmitter.prototype.off = function (event, callback) {
  if (!callback) {
    // 移除所有匹配该模式的监听器
    Object.keys(this.events).forEach(function (pattern) {
      if (this._match(pattern, event)) {
        delete this.events[pattern];
      }
    }.bind(this));
    return this;
  }
  if (this.events[event]) {
    this.events[event] = this.events[event].filter(function (cb) {
      return cb !== callback;
    });
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }
  return this;
};

/**
 * 监听器数量
 */
EventEmitter.prototype.listenerCount = function (event) {
  var count = 0;
  Object.keys(this.events).forEach(function (pattern) {
    if (this._match(pattern, event)) {
      count += this.events[pattern].length;
    }
  }.bind(this));
  return count;
};

// ===== 测试用例 =====
var emitter = new EventEmitter();

// 精确匹配
emitter.on('user:login', function (name) {
  console.log('用户登录：', name);
});
emitter.emit('user:login', '张三'); // => 用户登录： 张三

// 通配符监听
emitter.on('user:*', function () {
  console.log('用户操作（通配符触发）');
});
emitter.emit('user:login', '李四');
// => 用户登录： 李四
// => 用户操作（通配符触发）

emitter.emit('user:logout');
// => 用户操作（通配符触发）

// 全局通配符
emitter.on('*', function () {
  console.log('任意事件触发');
});
emitter.emit('user:login', '王五');
// => 用户登录： 王五
// => 用户操作（通配符触发）
// => 任意事件触发

emitter.emit('system:error', 'timeout');
// => 任意事件触发

// 不同命名空间
emitter.on('order:create', function (id) {
  console.log('订单创建：', id);
});
emitter.emit('order:create', 1001); // => 订单创建： 1001
// user:* 不会触发，* 会触发

// listenerCount 统计匹配的监听器
console.log(emitter.listenerCount('user:login')); // => 3（精确 + user:* + *）
console.log(emitter.listenerCount('order:create')); // => 2（精确 + *）

// off 移除通配符匹配的
emitter.off('user:*');
emitter.emit('user:login', '测试');
// => 用户登录： 测试 （user:* 已移除）
// => 任意事件触发 （* 仍存在）
