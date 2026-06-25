/**
 * 手写 Vue 响应式原理（派发更新）
 *
 * 在「依赖收集」基础上，重点实现「派发更新」机制：
 *   - 数据变化时，setter 调用 dep.notify()
 *   - notify 通知所有 Watcher 调用 update()
 *   - Watcher 不会立即执行，而是加入队列，在 nextTick 中批量执行
 *   - 通过 id 排序、去重保证更新顺序和性能
 *
 * 派发更新的核心优化：异步批量更新（避免同步多次更新）。
 */

function Dep() {
  this.subs = [];
}

Dep.target = null;
var targetStack = [];

Dep.prototype.pushTarget = function (target) {
  targetStack.push(target);
  Dep.target = target;
};

Dep.prototype.popTarget = function () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1] || null;
};

Dep.prototype.addSub = function (sub) {
  if (this.subs.indexOf(sub) === -1) this.subs.push(sub);
};

Dep.prototype.depend = function () {
  if (Dep.target) Dep.target.addDep(this);
};

/**
 * 派发更新：通知所有 Watcher
 */
Dep.prototype.notify = function () {
  var subs = this.subs.slice();
  subs.forEach(function (sub) {
    sub.update();
  });
};

function defineReactive(obj, key, val) {
  var dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify(); // 派发更新
    },
  });
}

function observe(obj) {
  if (!obj || typeof obj !== "object") return obj;
  Object.keys(obj).forEach(function (key) {
    defineReactive(obj, key, obj[key]);
  });
  return obj;
}

// ===== 更新队列调度 =====
var queue = []; // 待更新的 Watcher 队列
var has = {}; // 去重记录
var waiting = false; // 是否已在等待刷新
var flushing = false;
var index = 0;

/**
 * 将 Watcher 加入队列
 */
function queueWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 刷新过程中加入，按 id 插入合适位置
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    if (!waiting) {
      waiting = true;
      // 使用 nextTick 异步刷新（这里用 setTimeout 模拟）
      setTimeout(flushQueue, 0);
    }
  }
}

/**
 * 刷新队列：按 id 排序后执行
 */
function flushQueue() {
  flushing = true;
  queue.sort(function (a, b) {
    return a.id - b;
  });

  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index];
    has[watcher.id] = null;
    watcher.run();
  }

  // 重置
  queue.length = 0;
  has = {};
  waiting = false;
  flushing = false;
  index = 0;
}

var uid = 0;
/**
 * Watcher
 */
function Watcher(vm, getter, cb) {
  this.id = ++uid;
  this.vm = vm;
  this.getter = getter;
  this.cb = cb || function () {};
  this.deps = [];
  this.depIds = {};
  this.value = this.get();
  this.dirty = false;
}

Watcher.prototype.get = function () {
  Dep.prototype.pushTarget(this);
  try {
    return this.getter.call(this.vm);
  } finally {
    Dep.prototype.popTarget();
  }
};

Watcher.prototype.addDep = function (dep) {
  var id = dep.subs ? this.id : 0; // 简化
  if (!this.depIds[dep]) {
    this.depIds[dep] = true;
    this.deps.push(dep);
    dep.addSub(this);
  }
};

/**
 * 数据变化时调用：加入队列
 */
Watcher.prototype.update = function () {
  queueWatcher(this);
};

/**
 * 实际执行更新
 */
Watcher.prototype.run = function () {
  var oldValue = this.value;
  var value = this.get();
  if (value !== oldValue) {
    this.value = value;
    this.cb.call(this.vm, value, oldValue);
  }
};

// ===== 测试用例 =====
var data = observe({ count: 0, name: "test" });

var log = [];
var watcher1 = new Watcher(
  data,
  function () {
    return this.count;
  },
  function (newVal, oldVal) {
    log.push("watcher1: " + oldVal + " -> " + newVal);
  },
);

var watcher2 = new Watcher(
  data,
  function () {
    return this.count;
  },
  function (newVal, oldVal) {
    log.push("watcher2: " + oldVal + " -> " + newVal);
  },
);

// 同步多次修改 count，只会触发一次批量更新
data.count = 1;
data.count = 2;
data.count = 3;

// 由于是异步（setTimeout），需要等待
setTimeout(function () {
  console.log(log);
  // => ['watcher1: 0 -> 3', 'watcher2: 0 -> 3']
  // 多次同步修改被合并为一次更新

  // 验证 id 排序
  console.log("watcher1 id < watcher2 id:", watcher1.id < watcher2.id); // => true
}, 10);
