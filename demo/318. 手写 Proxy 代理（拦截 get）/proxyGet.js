/**
 * 手写 Proxy 代理（拦截 get）
 *
 * Proxy 的 get 拦截器可以在读取属性时进行自定义行为。
 * 真正的 Proxy 可以拦截任意属性（包括不存在的），ES5 无法完全做到。
 * 这里通过两种方式演示：
 * 1. 原生 Proxy 拦截 get（展示用法）
 * 2. ES5 手写模拟：通过 Object.defineProperty 为已知属性定义 getter
 */

// ========== 原生 Proxy：拦截 get ==========

// 拦截 get，未定义属性返回默认值
function createDefaultProxy(target, defaultValue) {
  return new Proxy(target, {
    get: function (target, prop, receiver) {
      if (prop in target) {
        return target[prop];
      }
      return defaultValue;
    }
  });
}

// 拦截 get，实现数组负索引访问
function createNegativeIndexProxy(arr) {
  return new Proxy(arr, {
    get: function (target, prop) {
      var idx = Number(prop);
      if (!isNaN(idx) && idx < 0) {
        return target[target.length + idx];
      }
      return target[prop];
    }
  });
}

// 拦截 get，记录访问日志
function createLoggingProxy(target) {
  return new Proxy(target, {
    get: function (target, prop) {
      console.log('  [get] accessing: ' + String(prop));
      return target[prop];
    }
  });
}

// ========== ES5 手写模拟：通过 getter 拦截 get ==========

// 为对象的已知属性创建 getter 拦截
function createGetProxyES5(target, getHandler) {
  var proxy = {};
  var keys = Object.keys(target);
  for (var i = 0; i < keys.length; i++) {
    (function (key) {
      Object.defineProperty(proxy, key, {
        get: function () {
          return getHandler(target, key);
        },
        enumerable: true,
        configurable: true
      });
    })(keys[i]);
  }
  return proxy;
}

// 测试 1：默认值代理
console.log('--- Default Value Proxy ---');
var data = { name: 'Alice', age: 25 };
var proxied1 = createDefaultProxy(data, 'N/A');
console.log(proxied1.name);    // Alice
console.log(proxied1.age);     // 25
console.log(proxied1.unknown); // N/A

// 测试 2：负索引代理
console.log('--- Negative Index Proxy ---');
var arr = createNegativeIndexProxy([1, 2, 3, 4, 5]);
console.log(arr[-1]); // 5
console.log(arr[-2]); // 4
console.log(arr[0]);  // 1

// 测试 3：日志代理
console.log('--- Logging Proxy ---');
var logged = createLoggingProxy({ x: 1, y: 2 });
console.log(logged.x); // [get] accessing: x \n 1
console.log(logged.y); // [get] accessing: y \n 2

// 测试 4：ES5 手写 get 拦截
console.log('--- ES5 Get Proxy (getter) ---');
var config = { host: 'localhost', port: 8080 };
var proxied2 = createGetProxyES5(config, function (target, key) {
  console.log('  [es5 get] ' + key);
  return target[key];
});
console.log(proxied2.host); // [es5 get] host \n localhost
console.log(proxied2.port); // [es5 get] port \n 8080

// 测试 5：拦截 get 实现只读视图
console.log('--- Read-only View Proxy ---');
var readOnly = new Proxy({ secret: 'hidden', public: 'ok' }, {
  get: function (target, prop) {
    if (prop === 'secret') return undefined;
    return target[prop];
  }
});
console.log(readOnly.public); // ok
console.log(readOnly.secret); // undefined
