/**
 * 手写 Node.js EventEmitter
 *
 * 模拟 Node.js events 模块的核心 EventEmitter 类。
 * 支持 API：
 *   - on(event, listener) / addListener：注册监听器
 *   - once(event, listener)：注册一次性监听器
 *   - off(event, listener) / removeListener：移除监听器
 *   - emit(event, ...args)：触发事件
 *   - removeAllListeners([event])：移除所有/指定事件监听器
 *   - listeners(event)：获取监听器数组
 *   - listenerCount(event)：监听器数量
 *   - prependListener / prependOnceListener：插入到头部
 *   - setMaxListeners / getMaxListeners
 *
 * 与浏览器版区别：
 *   - this 指向 EventEmitter 实例
 *   - 支持 newListener / removeListener 内置事件
 *   - 错误事件特殊处理（无监听器时抛出）
 */

function EventEmitter() {
  EventEmitter.init.call(this);
}

EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function () {
  if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }
  this._maxListeners = this._maxListeners || undefined;
};

/**
 * 获取最大监听器数量
 */
EventEmitter.prototype.getMaxListeners = function () {
  if (this._maxListeners === undefined) {
    return EventEmitter.defaultMaxListeners;
  }
  return this._maxListeners;
};

/**
 * 设置最大监听器数量
 */
EventEmitter.prototype.setMaxListeners = function (n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n)) {
    throw new RangeError('The value of "n" is out of range.');
  }
  this._maxListeners = n;
  return this;
};

/**
 * 发出控制台警告（超出最大监听器数量）
 */
EventEmitter.prototype._emitWarning = function (event, count) {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(
      '(node) warning: possible EventEmitter memory leak detected. ' +
      count + ' ' + event + ' listeners added. ' +
      'Use emitter.setMaxListeners() to increase limit.'
    );
  }
};

/**
 * 添加监听器
 * @param {string} event
 * @param {Function} listener
 * @param {boolean} [prepend=false]
 * @returns {this}
 */
EventEmitter.prototype.addListener = function (event, listener, prepend) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function.');
  }

  // 触发 newListener 事件
  if (this._events.newListener) {
    this.emit('newListener', event, typeof listener.listener === 'function' ? listener.listener : listener);
  }

  if (!this._events[event]) {
    this._events[event] = listener;
    this._eventsCount++;
  } else {
    if (Array.isArray(this._events[event])) {
      if (prepend) {
        this._events[event].unshift(listener);
      } else {
        this._events[event].push(listener);
      }
    } else {
      this._events[event] = prepend ? [listener, this._events[event]] : [this._events[event], listener];
    }

    // 检查最大监听器
    var max = this.getMaxListeners();
    var len = Array.isArray(this._events[event]) ? this._events[event].length : 1;
    if (max > 0 && len > max && !this._events[event].warned) {
      this._events[event].warned = true;
      this._emitWarning(event, len);
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

/**
 * 添加到头部
 */
EventEmitter.prototype.prependListener = function (event, listener) {
  return this.addListener(event, listener, true);
};

/**
 * 注册一次性监听器
 */
EventEmitter.prototype.once = function (event, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function.');
  }
  var self = this;
  function wrapper() {
    self.removeListener(event, wrapper);
    listener.apply(self, arguments);
  }
  wrapper.listener = listener; // 保留原始引用，便于 off
  return this.on(event, wrapper);
};

EventEmitter.prototype.prependOnceListener = function (event, listener) {
  var self = this;
  function wrapper() {
    self.removeListener(event, wrapper);
    listener.apply(self, arguments);
  }
  wrapper.listener = listener;
  return this.prependListener(event, wrapper);
};

/**
 * 移除监听器
 */
EventEmitter.prototype.removeListener = function (event, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function.');
  }

  var list = this._events[event];
  if (list === undefined) return this;

  var position = -1;
  var originalListener;
  var isSingle = list === listener || (typeof list.listener === 'function' && list.listener === listener);

  if (isSingle) {
    // 单个监听器匹配：直接删除
    originalListener = list;
    delete this._events[event];
    this._eventsCount--;
  } else if (Array.isArray(list)) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
        position = i;
        originalListener = list[i];
        break;
      }
    }
    if (position < 0) return this;

    list.splice(position, 1);
    if (list.length === 0) {
      delete this._events[event];
      this._eventsCount--;
    } else if (list.length === 1) {
      // 数组只剩一个时，退化为单个函数存储
      this._events[event] = list[0];
    }
  } else {
    // 单个监听器不匹配
    return this;
  }

  // 触发 removeListener 事件
  if (this._events.removeListener) {
    this.emit('removeListener', event, originalListener.listener || originalListener);
  }

  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

/**
 * 移除所有监听器
 */
EventEmitter.prototype.removeAllListeners = function (event) {
  if (!this._events) return this;

  // 如果有 removeListener 监听器且不是移除 removeListener 自身
  if (event !== 'removeListener' && this._events.removeListener) {
    this.emit('removeListener', event);
  }

  if (event === undefined) {
    // 移除所有
    var keys = Object.keys(this._events);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k === 'removeListener') continue;
      this.removeAllListeners(k);
    }
    this.removeAllListeners('removeListener');
    this._events = Object.create(null);
    this._eventsCount = 0;
  } else {
    delete this._events[event];
    this._eventsCount--;
  }

  return this;
};

/**
 * 触发事件
 */
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var list = this._events[event];

  if (list === undefined) {
    // error 事件无监听器时抛出
    if (event === 'error') {
      var err = args[0] instanceof Error ? args[0] : new Error(args[0]);
      throw err;
    }
    return false;
  }

  if (typeof list === 'function') {
    list.apply(this, args);
  } else {
    list.slice().forEach(function (fn) {
      fn.apply(this, args);
    }.bind(this));
  }

  return true;
};

/**
 * 获取监听器数组
 */
EventEmitter.prototype.listeners = function (event) {
  var list = this._events[event];
  if (list === undefined) return [];
  if (typeof list === 'function') return [list.listener || list];
  return list.map(function (fn) { return fn.listener || fn; });
};

/**
 * 原始监听器（含 wrapper）
 */
EventEmitter.prototype.rawListeners = function (event) {
  var list = this._events[event];
  if (list === undefined) return [];
  return Array.isArray(list) ? list.slice() : [list];
};

/**
 * 监听器数量
 */
EventEmitter.prototype.listenerCount = function (event) {
  var list = this._events[event];
  if (list === undefined) return 0;
  return Array.isArray(list) ? list.length : 1;
};

/**
 * 返回所有事件名
 */
EventEmitter.prototype.eventNames = function () {
  return Object.keys(this._events).filter(function (k) { return k !== undefined; });
};

// 静态方法
EventEmitter.listenerCount = function (emitter, event) {
  return emitter.listenerCount(event);
};

// ===== 测试用例 =====
var ee = new EventEmitter();

// 1. 基本 on / emit
ee.on('data', function (a, b) {
  console.log('data:', a, b);
});
ee.emit('data', 1, 2); // => data: 1 2

// 2. this 指向
ee.on('test', function () {
  console.log('this === ee:', this === ee);
});
ee.emit('test'); // => this === ee: true

// 3. once
ee.once('connect', function () {
  console.log('connected');
});
ee.emit('connect'); // => connected
ee.emit('connect'); // 无输出
console.log('once 后监听器数量：', ee.listenerCount('connect')); // => 0

// 4. off / removeListener
function handler() { console.log('handler'); }
ee.on('click', handler);
ee.on('click', function () { console.log('other'); });
console.log('click 监听器数量：', ee.listenerCount('click')); // => 2
ee.off('click', handler);
console.log('off 后数量：', ee.listenerCount('click')); // => 1
ee.emit('click'); // => other

// 5. once + off（用原始 listener）
function onceHandler() { console.log('once handler'); }
ee.once('msg', onceHandler);
ee.off('msg', onceHandler); // 通过 listener 引用移除
console.log('once off 后数量：', ee.listenerCount('msg')); // => 0

// 6. prependListener
var order2 = [];
ee.on('step', function () { order2.push('first'); });
ee.prependListener('step', function () { order2.push('prepended'); });
ee.emit('step');
console.log('执行顺序：', order2); // => ['prepended', 'first']

// 7. error 事件
try {
  ee.emit('error', new Error('出错了'));
} catch (e) {
  console.log('捕获错误：', e.message); // => 捕获错误： 出错了
}

// 8. newListener / removeListener 内置事件
ee.on('newListener', function (event, listener) {
  console.log('新增监听器：', event);
});
ee.on('custom', function () {}); // => 新增监听器：custom

// 9. removeAllListeners
ee.removeAllListeners('click');
console.log('click 数量：', ee.listenerCount('click')); // => 0

// 10. listeners
ee.on('a', function a1() {});
ee.on('a', function a2() {});
console.log('a 的监听器数量：', ee.listeners('a').length); // => 2
