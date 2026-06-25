/**
 * 手写响应式数据（简单版）
 *
 * 使用 Object.defineProperty 或 Proxy 实现数据响应式。
 * 当数据被读取时收集依赖，被修改时触发更新。
 *
 * 这里使用 Proxy 实现一个简单版的响应式系统：
 *   - reactive(obj)：将对象转为响应式
 *   - effect(fn)：注册副作用函数，依赖变化时重新执行
 */

// 当前正在执行的 effect
var activeEffect = null;

// 存储依赖关系：target -> key -> Set<effect>
var targetMap = new WeakMap();

/**
 * 收集依赖
 */
function track(target, key) {
  if (!activeEffect) return;
  var depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  var dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

/**
 * 触发更新
 */
function trigger(target, key) {
  var depsMap = targetMap.get(target);
  if (!depsMap) return;
  var dep = depsMap.get(key);
  if (dep) {
    dep.forEach(function (effect) {
      effect();
    });
  }
}

/**
 * 将对象转为响应式
 * @param {Object} obj
 * @returns {Proxy}
 */
function reactive(obj) {
  return new Proxy(obj, {
    get: function (target, key, receiver) {
      var result = Reflect.get(target, key, receiver);
      // 收集依赖
      track(target, key);
      // 如果是对象，递归代理
      if (result !== null && typeof result === "object") {
        return reactive(result);
      }
      return result;
    },
    set: function (target, key, value, receiver) {
      var oldValue = target[key];
      var result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return result;
    },
    deleteProperty: function (target, key) {
      var result = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return result;
    },
  });
}

/**
 * 注册副作用函数
 * @param {Function} fn
 * @returns {Function} runner（可手动重新执行）
 */
function effect(fn) {
  var _effect = function () {
    activeEffect = _effect;
    try {
      return fn();
    } finally {
      activeEffect = null;
    }
  };
  _effect();
  return _effect;
}

/**
 * ref：将基本类型转为响应式
 * @param {*} value
 * @returns {{ value: * }}
 */
function ref(value) {
  return {
    get value() {
      track(this, "value");
      return value;
    },
    set value(newVal) {
      if (newVal !== value) {
        value = newVal;
        trigger(this, "value");
      }
    },
  };
}

// ===== 测试用例 =====
var state = reactive({ count: 0, name: "vue" });

// 注册副作用：依赖 count
var double = 0;
effect(function () {
  double = state.count * 2;
  console.log("副作用执行，double =", double);
});
// => 副作用执行，double = 0

state.count = 1;
// => 副作用执行，double = 2

state.count = 5;
// => 副作用执行，double = 10

// 不依赖 count 的修改不触发
state.name = "react"; // 无输出

// ref 测试
var num = ref(10);
var display = "";
effect(function () {
  display = "num = " + num.value;
  console.log(display);
});
// => num = 10

num.value = 20;
// => num = 20

num.value = 20; // 相同值不触发（无输出）

// 嵌套对象响应式
var nested = reactive({ user: { age: 18 } });
effect(function () {
  console.log("用户年龄：", nested.user.age);
});
// => 用户年龄： 18

nested.user.age = 20;
// => 用户年龄： 20

console.log("最终 double：", double); // => 10
