/**
 * 手写 Vue 的 computed
 *
 * computed（计算属性）特点：
 *   - 惰性求值：只有被访问时才计算
 *   - 缓存：依赖未变化时返回缓存值
 *   - 依赖变化时标记 dirty，下次访问才重新计算
 *
 * 实现原理：
 *   - computed 本身是一个 Watcher（lazy: true）
 *   - 首次访问时求值并缓存，同时收集依赖
 *   - 依赖变化时 watcher.dirty = true
 *   - 再次访问时如果 dirty，重新求值
 *   - computed 的 watcher 需要让下游 watcher 依赖它
 */

// ===== 基础设施（Dep + 响应式）=====
var depUid = 0;
function Dep() {
  this.id = depUid++;
  this.subs = [];
}
Dep.target = null;
var targetStack = [];
Dep.pushTarget = function (t) {
  targetStack.push(t);
  Dep.target = t;
};
Dep.popTarget = function () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1] || null;
};
Dep.prototype.addSub = function (s) {
  if (this.subs.indexOf(s) === -1) this.subs.push(s);
};
Dep.prototype.removeSub = function (s) {
  var i = this.subs.indexOf(s);
  if (i !== -1) this.subs.splice(i, 1);
};
Dep.prototype.depend = function () {
  if (Dep.target) Dep.target.addDep(this);
};
Dep.prototype.notify = function () {
  this.subs.slice().forEach(function (s) {
    s.update();
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
    set: function (v) {
      if (v === val) return;
      val = v;
      dep.notify();
    },
  });
}
function observe(obj) {
  if (!obj || typeof obj !== "object") return obj;
  Object.keys(obj).forEach(function (k) {
    defineReactive(obj, k, obj[k]);
  });
  return obj;
}

// ===== Watcher =====
var watcherUid = 0;
function Watcher(vm, getter, options) {
  options = options || {};
  this.id = ++watcherUid;
  this.vm = vm;
  this.getter = getter;
  this.lazy = !!options.lazy;
  this.dirty = this.lazy;
  this.deps = [];
  this.depIds = {};
  this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype.get = function () {
  Dep.pushTarget(this);
  try {
    return this.getter.call(this.vm);
  } finally {
    Dep.popTarget();
  }
};

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.depIds[id]) {
    this.depIds[id] = true;
    this.deps.push(dep);
    dep.addSub(this);
  }
};

Watcher.prototype.update = function () {
  if (this.lazy) {
    this.dirty = true;
  } else {
    this.run();
  }
};

Watcher.prototype.run = function () {
  var old = this.value;
  var val = this.get();
  if (val !== old) {
    this.value = val;
    if (this.cb) this.cb(val, old);
  }
};

Watcher.prototype.evaluate = function () {
  if (this.dirty) {
    this.value = this.get();
    this.dirty = false;
  }
  return this.value;
};

Watcher.prototype.depend = function () {
  this.deps.forEach(function (dep) {
    dep.depend();
  });
};

// ===== computed 实现 =====

/**
 * 定义计算属性
 * @param {Object} vm - 数据对象（已 observe）
 * @param {Object} computed - 计算属性定义 { key: getter }
 * @returns {Object} 包含计算属性的对象
 */
function initComputed(vm, computed) {
  var watchers = {};
  var result = {};

  Object.keys(computed).forEach(function (key) {
    var getter = computed[key];

    // 为每个 computed 创建一个 lazy Watcher
    watchers[key] = new Watcher(vm, getter, { lazy: true });

    // 定义 computed 的访问器
    Object.defineProperty(result, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        // 如果有下游 Watcher，让它依赖当前 computed watcher 收集的所有 Dep
        var watcher = watchers[key];
        if (Dep.target) {
          watcher.depend();
        }
        // 如果 dirty，重新计算
        if (watcher.dirty) {
          watcher.evaluate();
        }
        return watcher.value;
      },
      set: function () {
        console.warn(
          'Computed property "' +
            key +
            '" was assigned to but it has no setter.',
        );
      },
    });
  });

  result._watchers = watchers;
  return result;
}

// ===== 测试用例 =====
var data = observe({ firstName: "John", lastName: "Doe", count: 0 });

var computed = initComputed(data, {
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
  double: function () {
    return this.count * 2;
  },
});

// 1. 惰性求值：首次访问才计算
var callCount = 0;
var computed2 = initComputed(observe({ n: 5 }), {
  squared: function () {
    callCount++;
    return this.n * this.n;
  },
});

console.log(computed2.squared); // => 25
console.log("计算次数：", callCount); // => 1
console.log(computed2.squared); // => 25（缓存）
console.log("计算次数：", callCount); // => 1（未重新计算）

// 2. 依赖变化后重新计算
var src = observe({ n: 5 });
var sq = initComputed(src, {
  squared: function () {
    callCount++;
    return this.n * this.n;
  },
});
callCount = 0;
console.log(sq.squared); // => 25, callCount = 1
console.log(sq.squared); // => 25, callCount = 1（缓存）
src.n = 6;
console.log(sq.squared); // => 36, callCount = 2（重新计算）
console.log(sq.squared); // => 36, callCount = 2（缓存）

// 3. computed 依赖其他 computed（链式）
var base = observe({ radius: 2 });
var pi = observe({ value: 3.14 });
var areaComputed = initComputed(base, {
  // area = pi * r^2，这里简化为依赖 base.radius
  area: function () {
    return this.radius * this.radius * pi.value;
  },
});
console.log(areaComputed.area); // => 12.56
base.radius = 3;
console.log(areaComputed.area); // => 28.26

// 4. 多个 computed
console.log(computed.fullName); // => John Doe
data.firstName = "Jane";
console.log(computed.fullName); // => Jane Doe
console.log(computed.double); // => 0
data.count = 5;
console.log(computed.double); // => 10
