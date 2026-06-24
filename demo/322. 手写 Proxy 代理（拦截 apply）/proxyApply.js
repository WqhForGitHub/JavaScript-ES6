/**
 * 手写 Proxy 代理（拦截 apply）
 *
 * Proxy 的 apply 拦截器可以拦截函数调用（包括 call/apply 调用）。
 * 常用于函数调用前后添加逻辑、参数转换、缓存等。
 * 注意：apply 拦截器的目标是函数对象。
 */

// ========== 原生 Proxy：拦截 apply ==========

// 拦截 apply，记录调用日志
function createLoggingProxy(fn) {
  return new Proxy(fn, {
    apply: function (target, thisArg, argumentsList) {
      console.log('  [apply] called with: ' + JSON.stringify(argumentsList));
      var result = target.apply(thisArg, argumentsList);
      console.log('  [apply] returned: ' + result);
      return result;
    }
  });
}

// 拦截 apply，实现函数缓存（memoize）
function createMemoizeProxy(fn) {
  var cache = {};
  return new Proxy(fn, {
    apply: function (target, thisArg, argumentsList) {
      var key = JSON.stringify(argumentsList);
      if (key in cache) {
        console.log('  [memoize] cache hit: ' + key);
        return cache[key];
      }
      console.log('  [memoize] cache miss: ' + key);
      var result = target.apply(thisArg, argumentsList);
      cache[key] = result;
      return result;
    }
  });
}

// 拦截 apply，实现参数校验
function createValidatedProxy(fn, validator) {
  return new Proxy(fn, {
    apply: function (target, thisArg, argumentsList) {
      var error = validator(argumentsList);
      if (error) throw new TypeError(error);
      return target.apply(thisArg, argumentsList);
    }
  });
}

// 拦截 apply，实现重试机制
function createRetryProxy(fn, retries) {
  return new Proxy(fn, {
    apply: function (target, thisArg, argumentsList) {
      var lastError;
      for (var i = 0; i <= retries; i++) {
        try {
          return target.apply(thisArg, argumentsList);
        } catch (e) {
          lastError = e;
          console.log('  [retry] attempt ' + (i + 1) + ' failed');
        }
      }
      throw lastError;
    }
  });
}

// 测试 1：调用日志
console.log('--- Logging Apply Proxy ---');
var add = createLoggingProxy(function (a, b) { return a + b; });
console.log(add(2, 3)); // [apply] called with: [2,3] \n [apply] returned: 5 \n 5

// 测试 2：memoize 缓存
console.log('--- Memoize Apply Proxy ---');
var slowSquare = createMemoizeProxy(function (n) {
  console.log('  [computing...]');
  return n * n;
});
console.log(slowSquare(4)); // [computing...] \n 16
console.log(slowSquare(4)); // cache hit \n 16
console.log(slowSquare(5)); // [computing...] \n 25

// 测试 3：参数校验
console.log('--- Validated Apply Proxy ---');
var divide = createValidatedProxy(
  function (a, b) { return a / b; },
  function (args) {
    if (args[1] === 0) return 'Division by zero';
  }
);
console.log(divide(10, 2)); // 5
try {
  divide(10, 0);
} catch (e) {
  console.log(e.message); // Division by zero
}

// 测试 4：重试机制
console.log('--- Retry Apply Proxy ---');
var attempts = 0;
var flaky = createRetryProxy(function () {
  attempts++;
  if (attempts < 3) throw new Error('fail');
  return 'success on attempt ' + attempts;
}, 5);
console.log(flaky()); // 重试后成功

// 测试 5：apply 拦截也拦截 call/apply 调用
console.log('--- apply with call/apply ---');
var loggedFn = createLoggingProxy(function () {
  return Array.prototype.join.call(arguments, '-');
});
console.log(loggedFn.call(null, 'a', 'b', 'c')); // [apply] ... \n a-b-c
console.log(loggedFn.apply(null, [['x', 'y', 'z']])); // [apply] ... \n x-y-z
