/**
 * 手写 Proxy 代理（拦截 has）
 *
 * Proxy 的 has 拦截器可以拦截 in 操作符，控制属性是否"存在"的判断。
 * 常用于隐藏某些属性，使其不被 in 操作符或 for...in 发现。
 * 这里演示原生 Proxy 的 has 拦截以及 ES5 模拟。
 */

// ========== 原生 Proxy：拦截 has ==========

// 拦截 has，隐藏指定属性
function createHiddenProxy(target, hiddenProps) {
  return new Proxy(target, {
    has: function (target, prop) {
      if (hiddenProps.indexOf(prop) !== -1) {
        return false; // 隐藏该属性
      }
      return prop in target;
    },
  });
}

// 拦截 has，只暴露白名单属性
function createWhitelistProxy(target, allowedProps) {
  return new Proxy(target, {
    has: function (target, prop) {
      if (allowedProps.indexOf(prop) !== -1) {
        return prop in target;
      }
      return false;
    },
  });
}

// 拦截 has，记录查询日志
function createHasLoggingProxy(target) {
  return new Proxy(target, {
    has: function (target, prop) {
      var result = prop in target;
      console.log('  [has] checking "' + String(prop) + '": ' + result);
      return result;
    },
  });
}

// ========== ES5 手写模拟 ===

// ES5 无法拦截 in 操作符本身，但可以通过包装对象控制可见属性
function createHasProxyES5(target, hiddenProps) {
  var proxy = {};
  var keys = Object.keys(target);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (hiddenProps.indexOf(key) === -1) {
      (function (k) {
        Object.defineProperty(proxy, k, {
          get: function () {
            return target[k];
          },
          set: function (v) {
            target[k] = v;
          },
          enumerable: true,
          configurable: true,
        });
      })(key);
    }
  }
  return proxy;
}

// 测试 1：隐藏属性
console.log("--- Hidden Proxy ---");
var user = createHiddenProxy({ name: "Alice", password: "secret", age: 25 }, [
  "password",
]);
console.log("name" in user); // true
console.log("age" in user); // true
console.log("password" in user); // false（被隐藏）
console.log(user.password); // secret（get 未拦截，仍可访问）

// 测试 2：白名单
console.log("--- Whitelist Proxy ---");
var safe = createWhitelistProxy({ a: 1, b: 2, c: 3 }, ["a", "b"]);
console.log("a" in safe); // true
console.log("b" in safe); // true
console.log("c" in safe); // false（不在白名单）

// 测试 3：日志
console.log("--- Has Logging Proxy ---");
var logged = createHasLoggingProxy({ x: 1, y: 2 });
console.log("x" in logged); // [has] checking "x": true \n true
console.log("z" in logged); // [has] checking "z": false \n false

// 测试 4：与 for...in 配合（has 拦截会影响 for...in）
console.log("--- has with for...in ---");
var obj = createHiddenProxy({ a: 1, b: 2, _private: 3 }, ["_private"]);
var visibleKeys = [];
for (var key in obj) visibleKeys.push(key);
console.log(visibleKeys); // ['a', 'b']（_private 被隐藏）

// 测试 5：ES5 模拟
console.log("--- ES5 Has Proxy ---");
var source = { name: "Bob", token: "abc123", role: "user" };
var es5Proxy = createHasProxyES5(source, ["token"]);
console.log("name" in es5Proxy); // true
console.log("role" in es5Proxy); // true
console.log("token" in es5Proxy); // false（不在代理对象上）
console.log(es5Proxy.name); // Bob
