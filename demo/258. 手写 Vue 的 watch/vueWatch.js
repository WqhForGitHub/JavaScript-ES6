/**
 * 手写 Vue 的 watch
 *
 * watch 用于监听数据变化并执行回调。
 * 特性：
 *   - 监听基本类型和对象属性（支持点号路径 a.b.c）
 *   - 深度监听（deep）：监听对象内部变化
 *   - 立即执行（immediate）：创建时立即执行回调
 *   - 返回 unwatch 函数用于取消监听
 *
 * 底层基于 Watcher 实现（user watcher）。
 */

// ===== 基础设施 =====
var depUid = 0;
function Dep() { this.id = depUid++; this.subs = []; }
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
  // 递归 observe
  if (val && typeof val === 'object') observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true, configurable: true,
    get: function () { dep.depend(); return val; },
    set: function (v) {
      if (v === val) return;
      val = v;
      if (v && typeof v === 'object') observe(v);
      dep.notify();
    },
  });
}
function observe(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.__ob__) return obj;
  Object.defineProperty(obj, '__ob__', { value: true, enumerable: false });
  Object.keys(obj).forEach(function (k) { defineReactive(obj, k, obj[k]); });
  return obj;
}

// ===== Watcher =====
var wUid = 0;
function Watcher(vm, getter, cb, options) {
  options = options || {};
  this.id = ++wUid;
  this.vm = vm;
  this.cb = cb;
  this.getter = getter;
  this.deep = !!options.deep;
  this.deps = [];
  this.depIds = {};
  this.value = this.get();
}

Watcher.prototype.get = function () {
  Dep.pushTarget(this);
  try {
    var value = this.getter.call(this.vm);
    if (this.deep) traverse(value);
    return value;
  } finally {
    Dep.popTarget();
  }
};

Watcher.prototype.addDep = function (dep) {
  if (!this.depIds[dep.id]) {
    this.depIds[dep.id] = true;
    this.deps.push(dep);
    dep.addSub(this);
  }
};

Watcher.prototype.update = function () {
  this.run();
};

Watcher.prototype.run = function () {
  var value = this.get();
  var oldValue = this.value;
  if (value !== oldValue || this.deep || (value && typeof value === 'object')) {
    this.value = value;
    this.cb.call(this.vm, value, oldValue);
  }
};

Watcher.prototype.teardown = function () {
  this.deps.forEach(function (dep) { dep.removeSub(this); }.bind(this));
  this.deps = [];
  this.depIds = {};
};

function traverse(val, seen) {
  seen = seen || [];
  if (val && typeof val === 'object') {
    if (seen.indexOf(val) !== -1) return;
    seen.push(val);
    Object.keys(val).forEach(function (k) { traverse(val[k], seen); });
  }
}

// ===== watch 实现 =====

/**
 * 解析监听表达式为 getter
 * @param {string|Function} expOrFn
 * @returns {Function}
 */
function parsePath(expOrFn) {
  if (typeof expOrFn === 'function') return expOrFn;
  var segments = expOrFn.split('.');
  return function () {
    var obj = this;
    for (var i = 0; i < segments.length; i++) {
      if (obj == null) return undefined;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

/**
 * 创建 watch
 * @param {Object} vm - 数据对象
 * @param {string|Function} expOrFn - 监听表达式或函数
 * @param {Function} cb - 回调 (newVal, oldVal)
 * @param {Object} [options]
 * @param {boolean} [options.deep=false] - 深度监听
 * @param {boolean} [options.immediate=false] - 立即执行
 * @returns {Function} unwatch - 取消监听函数
 */
function watch(vm, expOrFn, cb, options) {
  options = options || {};
  var getter = parsePath(expOrFn);

  // immediate：立即执行一次
  if (options.immediate) {
    var value = getter.call(vm);
    cb.call(vm, value, undefined);
  }

  var watcher = new Watcher(vm, getter, cb, { deep: options.deep });

  return function unwatchFn() {
    watcher.teardown();
  };
}

/**
 * 批量创建 watch（模拟 Vue 组件 watch 选项）
 * @param {Object} vm
 * @param {Object} watchDef - { key: cb | { handler, deep, immediate } }
 * @returns {Object} unwatch 函数集合
 */
function createWatchers(vm, watchDef) {
  var unwatchFns = {};
  Object.keys(watchDef).forEach(function (key) {
    var def = watchDef[key];
    var handler, opts;
    if (typeof def === 'function') {
      handler = def;
      opts = {};
    } else {
      handler = def.handler;
      opts = { deep: def.deep, immediate: def.immediate };
    }
    unwatchFns[key] = watch(vm, key, handler, opts);
  });
  return unwatchFns;
}

// ===== 测试用例 =====
var data = observe({ count: 0, user: { name: 'vue', info: { age: 3 } } });

// 1. 基本监听
var unwatch1 = watch(data, 'count', function (newVal, oldVal) {
  console.log('count 变化：', oldVal, '->', newVal);
});
data.count = 1; // => count 变化： 0 -> 1
data.count = 2; // => count 变化： 1 -> 2

// 2. 路径监听
watch(data, 'user.name', function (newVal, oldVal) {
  console.log('name 变化：', oldVal, '->', newVal);
});
data.user.name = 'react'; // => name 变化： vue -> react

// 3. 深度监听
var deepLog = [];
watch(
  data,
  'user',
  function (newVal, oldVal) {
    deepLog.push('user 变化');
  },
  { deep: true }
);
data.user.info.age = 4; // => user 变化（深度监听到内部变化）
console.log('deep 触发次数：', deepLog.length); // => 1

// 4. immediate
var immediateLog = [];
watch(data, 'count', function (newVal, oldVal) {
  immediateLog.push(newVal);
}, { immediate: true });
// => 立即执行，immediateLog = [2]
console.log('immediate 后日志：', immediateLog); // => [2]

// 5. 函数 getter
watch(data, function () { return this.count * 10; }, function (newVal, oldVal) {
  console.log('十倍 count：', oldVal, '->', newVal);
});
data.count = 5; // => 十倍 count： 20 -> 50

// 6. unwatch 取消监听
unwatch1();
data.count = 100; // unwatch1 已取消，不触发 count 监听
// 但函数 getter 的 watcher 仍触发：=> 十倍 count： 50 -> 1000

// 7. 批量 watch
var vm = observe({ a: 1, b: 2 });
var unwatches = createWatchers(vm, {
  a: function (n, o) { console.log('a:', o, '->', n); },
  b: { handler: function (n, o) { console.log('b:', o, '->', n); }, immediate: true },
});
// => b: undefined -> 2 （immediate）
vm.a = 10; // => a: 1 -> 10
unwatches.a();
vm.a = 20; // 无输出（已取消）
