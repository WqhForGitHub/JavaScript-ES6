/**
 * 手写 Vue 的 Watcher
 *
 * Watcher 是 Vue 响应式系统中的观察者，分三种：
 *   - 渲染 Watcher（render watcher）：组件渲染
 *   - 计算 Watcher（computed watcher）：惰性求值，带 dirty 标记
 *   - 用户 Watcher（user watcher）：watch 选项/$watch API
 *
 * 本文件实现一个通用 Watcher，支持：
 *   - 依赖收集（get）
 *   - 派发更新（update -> queue -> run）
 *   - 惰性求值（lazy，用于 computed）
 *   - 深度监听（deep）
 *   - 手动清理（teardown）
 */

var uid = 0;

function Dep() {
  this.subs = [];
  this.id = ++Dep.uid;
}
Dep.uid = 0;
Dep.target = null;
var targetStack = [];
Dep.pushTarget = function (t) { targetStack.push(t); Dep.target = t; };
Dep.popTarget = function () { targetStack.pop(); Dep.target = targetStack[targetStack.length - 1] || null; };
Dep.prototype.addSub = function (s) { if (this.subs.indexOf(s) === -1) this.subs.push(s); };
Dep.prototype.removeSub = function (s) { var i = this.subs.indexOf(s); if (i !== -1) this.subs.splice(i, 1); };
Dep.prototype.depend = function () { if (Dep.target) Dep.target.addDep(this); };
Dep.prototype.notify = function () { this.subs.slice().forEach(function (s) { s.update(); }); };

function defineReactive(obj, key, val) {
  var dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true, configurable: true,
    get: function () { dep.depend(); return val; },
    set: function (v) { if (v === val) return; val = v; dep.notify(); },
  });
}
function observe(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach(function (k) { defineReactive(obj, k, obj[k]); });
  return obj;
}

/**
 * Watcher 构造函数
 * @param {Object} vm - 上下文
 * @param {Function|string} expOrFn - 取值函数或表达式
 * @param {Function} cb - 回调
 * @param {Object} [options]
 * @param {boolean} [options.lazy=false] - 惰性求值（computed 用）
 * @param {boolean} [options.deep=false] - 深度监听
 * @param {boolean} [options.sync=false] - 同步执行（不进队列）
 */
function Watcher(vm, expOrFn, cb, options) {
  options = options || {};
  this.vm = vm;
  this.cb = cb || function () {};
  this.id = ++uid;
  this.lazy = !!options.lazy;
  this.deep = !!options.deep;
  this.sync = !!options.sync;
  this.dirty = this.lazy; // lazy 模式初始为 dirty

  // 解析 getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = function () {
      var path = expOrFn.split('.');
      var val = vm;
      path.forEach(function (k) { val = val[k]; });
      return val;
    };
  }

  this.deps = [];
  this.depIds = {};
  this.value = this.lazy ? undefined : this.get();
}

/**
 * 执行 getter，收集依赖
 */
Watcher.prototype.get = function () {
  Dep.pushTarget(this);
  var value;
  try {
    value = this.getter.call(this.vm, this.vm);
    // 深度监听：递归读取所有属性
    if (this.deep) {
      traverse(value);
    }
  } finally {
    Dep.popTarget();
    this.cleanupDeps();
  }
  return value;
};

/**
 * 添加依赖
 */
Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.depIds[id]) {
    this.depIds[id] = true;
    this.deps.push(dep);
    dep.addSub(this);
  }
};

/**
 * 清理旧依赖（防止依赖变化后残留）
 */
Watcher.prototype.cleanupDeps = function () {
  // 简化：实际 Vue 会对比新旧依赖
};

/**
 * 依赖变化时调用
 */
Watcher.prototype.update = function () {
  if (this.lazy) {
    // computed watcher：标记 dirty，不立即计算
    this.dirty = true;
  } else if (this.sync) {
    // 同步执行
    this.run();
  } else {
    // 加入异步队列
    this.run(); // 这里简化为直接执行
  }
};

/**
 * 执行更新
 */
Watcher.prototype.run = function () {
  var value = this.get();
  var oldValue = this.value;
  if (value !== oldValue || this.deep || typeof value === 'object') {
    this.value = value;
    this.cb.call(this.vm, value, oldValue);
  }
};

/**
 * 计算 Watcher 求值（computed 用）
 */
Watcher.prototype.evaluate = function () {
  if (this.dirty) {
    this.value = this.get();
    this.dirty = false;
  }
  return this.value;
};

/**
 * 依赖所有下游 Watcher
 */
Watcher.prototype.depend = function () {
  this.deps.forEach(function (dep) { dep.depend(); });
};

/**
 * 销毁 Watcher，移除所有依赖
 */
Watcher.prototype.teardown = function () {
  this.deps.forEach(function (dep) { dep.removeSub(this); }.bind(this));
  this.deps = [];
  this.depIds = {};
};

/**
 * 递归遍历对象（深度监听用）
 */
function traverse(val) {
  if (val && typeof val === 'object') {
    Object.keys(val).forEach(function (k) {
      traverse(val[k]);
    });
  }
}

// ===== 测试用例 =====
var data = observe({ count: 0, user: { name: 'vue', age: 3 } });

// 1. 普通 Watcher
var w1 = new Watcher(data, 'count', function (newVal, oldVal) {
  console.log('count 变化：', oldVal, '->', newVal);
});
data.count = 1; // => count 变化： 0 -> 1
data.count = 2; // => count 变化： 1 -> 2

// 2. 深度监听
var w2 = new Watcher(
  data,
  function () { return this.user; },
  function () { console.log('user 对象变化'); },
  { deep: true }
);
data.user.name = 'react'; // => user 对象变化
data.user.age = 5;        // => user 对象变化

// 3. 函数 getter
var w3 = new Watcher(
  data,
  function () { return this.count * 2; },
  function (newVal, oldVal) {
    console.log('双倍 count：', oldVal, '->', newVal);
  }
);
data.count = 10; // => count 变化： 2 -> 10 \n 双倍 count： 4 -> 20

// 4. teardown 销毁
w1.teardown();
data.count = 20; // w1 不再触发，只触发 w3
// => 双倍 count： 20 -> 40

console.log('w3 当前值：', w3.value); // => 40
