/**
 * 手写事件总线 EventBus
 *
 * EventBus 是全局的事件中心，用于跨组件/模块通信。
 * 特点：
 *   - 全局单例，任何模块都能访问
 *   - 支持 on / once / off / emit
 *   - 支持命名空间和通配符
 *   - 提供 clean 清空、listenerCount 统计
 *   - 返回 dispose 函数便于取消订阅
 */

function EventBus() {
  this.events = {};
  this.delimiter = ':';
}

/**
 * 判断模式匹配（支持通配符）
 */
EventBus.prototype._match = function (pattern, event) {
  if (pattern === event || pattern === '*') return true;
  var patternParts = pattern.split(this.delimiter);
  var eventParts = event.split(this.delimiter);
  for (var i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === '*') return true;
    if (i >= eventParts.length || patternParts[i] !== eventParts[i]) return false;
  }
  return patternParts.length === eventParts.length;
};

/**
 * 订阅事件
 * @param {string} event
 * @param {Function} callback
 * @returns {Function} dispose 取消订阅函数
 */
EventBus.prototype.on = function (event, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push({ fn: callback, once: false });

  var self = this;
  return function dispose() {
    self.off(event, callback);
  };
};

/**
 * 订阅一次
 */
EventBus.prototype.once = function (event, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push({ fn: callback, once: true });

  var self = this;
  return function dispose() {
    self.off(event, callback);
  };
};

/**
 * 发布事件
 */
EventBus.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var triggered = false;
  var toRemove = [];

  Object.keys(this.events).forEach(function (pattern) {
    if (!this._match(pattern, event)) return;
    this.events[pattern].slice().forEach(function (item) {
      item.fn.apply(null, args);
      triggered = true;
      if (item.once) {
        toRemove.push({ pattern: pattern, fn: item.fn });
      }
    });
  }.bind(this));

  // 清理 once 监听器
  toRemove.forEach(function (r) {
    if (this.events[r.pattern]) {
      this.events[r.pattern] = this.events[r.pattern].filter(function (item) {
        return item.fn !== r.fn;
      });
      if (this.events[r.pattern].length === 0) {
        delete this.events[r.pattern];
      }
    }
  }.bind(this));

  return triggered;
};

/**
 * 取消订阅
 */
EventBus.prototype.off = function (event, callback) {
  if (!event) {
    this.events = {};
    return this;
  }
  if (!callback) {
    Object.keys(this.events).forEach(function (pattern) {
      if (this._match(pattern, event)) {
        delete this.events[pattern];
      }
    }.bind(this));
    return this;
  }
  if (this.events[event]) {
    this.events[event] = this.events[event].filter(function (item) {
      return item.fn !== callback;
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
EventBus.prototype.listenerCount = function (event) {
  if (!event) {
    return Object.keys(this.events).reduce(function (sum, k) {
      return sum + this.events[k].length;
    }.bind(this), 0);
  }
  var count = 0;
  Object.keys(this.events).forEach(function (pattern) {
    if (this._match(pattern, event)) {
      count += this.events[pattern].length;
    }
  }.bind(this));
  return count;
};

/**
 * 清空所有
 */
EventBus.prototype.clear = function () {
  this.events = {};
  return this;
};

// 创建全局单例
var eventBus = new EventBus();

// ===== 测试用例 =====
// 跨模块通信示例

// 模块 A：订阅
var dispose = eventBus.on('user:login', function (user) {
  console.log('[模块A] 用户登录：', user);
});

// 模块 B：订阅
eventBus.on('user:login', function (user) {
  console.log('[模块B] 用户登录：', user);
});

// 模块 C：通配符订阅
eventBus.on('user:*', function () {
  console.log('[模块C] 用户事件触发');
});

// 触发
eventBus.emit('user:login', { name: '张三', id: 1 });
// => [模块A] 用户登录： { name: '张三', id: 1 }
// => [模块B] 用户登录： { name: '张三', id: 1 }
// => [模块C] 用户事件触发

// once 测试
eventBus.once('notify', function (msg) {
  console.log('通知：', msg);
});
eventBus.emit('notify', '第一条'); // => 通知： 第一条
eventBus.emit('notify', '第二条'); // 无输出

// dispose 取消订阅
dispose();
eventBus.emit('user:login', { name: '李四' });
// => [模块B] 用户登录： { name: '李四' }
// => [模块C] 用户事件触发 （模块A 已取消）

console.log(eventBus.listenerCount('user:login')); // => 2（模块B + user:*）

// clear 清空
eventBus.clear();
console.log(eventBus.listenerCount()); // => 0
