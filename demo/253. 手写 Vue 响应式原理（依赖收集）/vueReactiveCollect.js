/**
 * 手写 Vue 响应式原理（依赖收集）
 *
 * Vue 2 的响应式核心：
 *   1. Observer：通过 Object.defineProperty 劫持对象属性
 *   2. Dep：每个属性有一个 Dep，存储依赖该属性的 Watcher
 *   3. Watcher：观察者，读取属性时触发依赖收集（dep.depend()）
 *
 * 依赖收集流程：
 *   - Watcher 执行 getter 时，会设置 Dep.target = 当前 Watcher
 *   - 属性的 getter 被触发，调用 dep.depend() 收集当前 Watcher
 *   - Watcher 执行完毕，清除 Dep.target
 *
 * 本文件重点演示「依赖收集」过程。
 */

// Dep 类
function Dep() {
  this.subs = []; // 订阅者（Watcher）列表
}

// 当前正在收集依赖的 Watcher
Dep.target = null;

// target 栈（支持嵌套 Watcher）
var targetStack = [];

Dep.prototype.pushTarget = function (target) {
  targetStack.push(target);
  Dep.target = target;
};

Dep.prototype.popTarget = function () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1] || null;
};

/**
 * 添加订阅者
 */
Dep.prototype.addSub = function (sub) {
  if (this.subs.indexOf(sub) === -1) {
    this.subs.push(sub);
  }
};

/**
 * 移除订阅者
 */
Dep.prototype.removeSub = function (sub) {
  var index = this.subs.indexOf(sub);
  if (index !== -1) {
    this.subs.splice(index, 1);
  }
};

/**
 * 依赖收集：让当前 Watcher 订阅此 Dep
 */
Dep.prototype.depend = function () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

/**
 * 通知所有订阅者
 */
Dep.prototype.notify = function () {
  this.subs.slice().forEach(function (sub) {
    sub.update();
  });
};

/**
 * Observer：将对象转为响应式
 * @param {Object} obj
 */
function observe(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach(function (key) {
    defineReactive(obj, key, obj[key]);
  });
  return obj;
}

/**
 * 定义响应式属性
 */
function defineReactive(obj, key, val) {
  var dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // 依赖收集
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;
      val = newVal;
      // 新值如果是对象，也要 observe
      if (typeof newVal === 'object' && newVal !== null) {
        observe(newVal);
      }
      // 派发更新
      dep.notify();
    },
  });
}

/**
 * Watcher（简化版，用于演示依赖收集）
 * @param {Object} vm - 数据对象
 * @param {Function} getter - 取值函数
 * @param {Function} cb - 回调
 */
function Watcher(vm, getter, cb) {
  this.vm = vm;
  this.getter = getter;
  this.cb = cb || function () {};
  this.deps = []; // 此 Watcher 订阅的所有 Dep
  this.value = this.get(); // 首次执行，触发依赖收集
}

/**
 * 执行 getter，收集依赖
 */
Watcher.prototype.get = function () {
  Dep.prototype.pushTarget(this);
  var value;
  try {
    value = this.getter.call(this.vm);
  } finally {
    Dep.prototype.popTarget();
  }
  return value;
};

/**
 * 添加 Dep（被 Dep.depend 调用）
 */
Watcher.prototype.addDep = function (dep) {
  if (this.deps.indexOf(dep) === -1) {
    this.deps.push(dep);
    dep.addSub(this);
  }
};

/**
 * 数据变化时调用
 */
Watcher.prototype.update = function () {
  var oldValue = this.value;
  this.value = this.get();
  this.cb(this.value, oldValue);
};

// ===== 测试用例 =====
var data = observe({
  name: 'Vue',
  count: 0,
});

// 创建 Watcher，依赖 name 和 count
var renderOutput = '';
var watcher = new Watcher(
  data,
  function () {
    // 模拟渲染函数读取数据
    return this.name + ' - ' + this.count;
  },
  function (newVal, oldVal) {
    renderOutput = newVal;
    console.log('更新：', oldVal, '->', newVal);
  }
);
// 首次执行时，name 和 count 的 getter 被触发，依赖被收集

console.log('初始值：', watcher.value); // => Vue - 0
console.log('收集的 Dep 数量：', watcher.deps.length); // => 2（name + count）

// 修改 name，触发更新
data.name = 'React';
// => 更新： Vue - 0 -> React - 0

// 修改 count，触发更新
data.count = 1;
// => 更新： React - 0 -> React - 1

// 修改未被收集依赖的属性不会触发（这里所有属性都被收集了）
// 验证依赖收集：subs 数量
console.log('name 的 subs 数量：', watcher.deps[0].subs.length); // => 1
console.log('count 的 subs 数量：', watcher.deps[1].subs.length); // => 1
