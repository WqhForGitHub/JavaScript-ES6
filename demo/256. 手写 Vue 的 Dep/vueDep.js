/**
 * 手写 Vue 的 Dep
 *
 * Dep（Dependency）是 Vue 响应式系统中的依赖管理器。
 * 每个响应式属性对应一个 Dep 实例，负责：
 *   - 收集依赖该属性的 Watcher（depend）
 *   - 属性变化时通知所有 Watcher（notify）
 *   - 管理 Watcher 的添加和移除
 *
 * Dep 使用静态属性 target 记录当前正在收集依赖的 Watcher。
 */

var depUid = 0;

function Dep() {
  this.id = depUid++;
  this.subs = [];
}

// 当前正在收集依赖的 Watcher（静态）
Dep.target = null;

// target 栈，支持 Watcher 嵌套
var targetStack = [];

/**
 * 压入 Watcher
 */
Dep.pushTarget = function (target) {
  targetStack.push(target);
  Dep.target = target;
};

/**
 * 弹出 Watcher
 */
Dep.popTarget = function () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1] || null;
};

/**
 * 添加 Watcher 订阅
 * @param {Watcher} sub
 */
Dep.prototype.addSub = function (sub) {
  if (this.subs.indexOf(sub) === -1) {
    this.subs.push(sub);
  }
};

/**
 * 移除 Watcher 订阅
 * @param {Watcher} sub
 */
Dep.prototype.removeSub = function (sub) {
  var index = this.subs.indexOf(sub);
  if (index !== -1) {
    this.subs.splice(index, 1);
  }
};

/**
 * 依赖收集
 * 让当前 Watcher（Dep.target）订阅此 Dep
 */
Dep.prototype.depend = function () {
  if (Dep.target) {
    // 双向记录：Watcher 记录 Dep，Dep 记录 Watcher
    Dep.target.addDep(this);
  }
};

/**
 * 派发更新：通知所有 Watcher
 */
Dep.prototype.notify = function () {
  // 复制一份，防止遍历过程中 subs 被修改
  var subs = this.subs.slice();
  subs.forEach(function (sub) {
    sub.update();
  });
};

/**
 * 清空所有订阅
 */
Dep.prototype.clearSubs = function () {
  this.subs = [];
};

// ===== 辅助：简化响应式与 Watcher（配合测试） =====
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
      dep.notify();
    },
  });
  return dep;
}

function observe(obj) {
  if (!obj || typeof obj !== "object") return obj;
  Object.keys(obj).forEach(function (key) {
    defineReactive(obj, key, obj[key]);
  });
  return obj;
}

// 简化 Watcher
function createWatcher(getter, cb) {
  var watcher = {
    deps: [],
    value: undefined,
    addDep: function (dep) {
      if (this.deps.indexOf(dep) === -1) {
        this.deps.push(dep);
        dep.addSub(this);
      }
    },
    update: function () {
      var old = this.value;
      Dep.pushTarget(this);
      this.value = getter();
      Dep.popTarget();
      if (cb) cb(this.value, old);
    },
    get: function () {
      Dep.pushTarget(this);
      this.value = getter();
      Dep.popTarget();
      return this.value;
    },
  };
  watcher.get();
  return watcher;
}

// ===== 测试用例 =====
var data = observe({ a: 1, b: 2 });

var updates = [];
var watcher = createWatcher(
  function () {
    return data.a + data.b;
  },
  function (newVal, oldVal) {
    updates.push(oldVal + " -> " + newVal);
  },
);

console.log("初始值：", watcher.value); // => 3
console.log("收集的 Dep 数量：", watcher.deps.length); // => 2

// 修改 a，触发更新
data.a = 10;
console.log(updates); // => ['3 -> 12']

// 修改 b，触发更新
data.b = 20;
console.log(updates); // => ['3 -> 12', '12 -> 30']

// 测试 target 栈嵌套
var innerWatcher = createWatcher(
  function () {
    return data.a;
  },
  function () {},
);
console.log("innerWatcher value:", innerWatcher.value); // => 10

// 测试 depend 双向记录
console.log("a 的 Dep subs 数量：", watcher.deps[0].subs.length); // => 2（watcher + innerWatcher）

// 测试 removeSub
watcher.deps[0].removeSub(watcher);
console.log("移除后 subs 数量：", watcher.deps[0].subs.length); // => 1

// 测试 Dep.target 为 null 时 depend 不收集
Dep.target = null;
watcher.deps[0].depend(); // 不应有副作用
console.log("depend 后 subs 不变：", watcher.deps[0].subs.length); // => 1
