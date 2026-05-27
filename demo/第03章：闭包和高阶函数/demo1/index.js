// ==============================
// 变量作用域与闭包的形成
// ==============================

console.log('=== 变量作用域 ===');

var a = 1; // 全局变量

var func = function() {
  var a = 2; // 局部变量，与全局变量 a 互不影响
  console.log('func 内部 a:', a); // 2
};

func();
console.log('func 外部 a:', a); // 1

// 闭包：函数可以访问其定义时所在的词法作用域
console.log('\n=== 闭包的形成 ===');

var func2 = function() {
  var b = 1;
  return function() {
    console.log('通过闭包访问 b:', b);
  };
};

var closure = func2();
closure(); // 通过闭包访问 b: 1
// 虽然 func2 已经执行完毕，但内部函数仍然可以访问其局部变量 b

// ==============================
// 闭包延长局部变量的生命周期
// ==============================

console.log('\n=== 闭包延长局部变量生命周期 ===');

var createCounter = function() {
  var count = 0; // 局部变量

  return {
    increment: function() {
      count++;
      console.log('count:', count);
    },
    getCount: function() {
      return count;
    }
  };
};

var counter = createCounter();
counter.increment(); // count: 1
counter.increment(); // count: 2
counter.increment(); // count: 3
console.log('final count:', counter.getCount()); // 3

// count 本应在 createCounter 执行完毕后被销毁
// 但由于闭包的存在，它被保留了下来

// ==============================
// 闭包封装私有变量 —— mult 带缓存
// ==============================

console.log('\n=== 闭包封装私有变量 ===');

var mult = (function() {
  var cache = {}; // 私有缓存

  var calculate = function() {
    var a = arguments[0];
    for (var i = 1, l = arguments.length; i < l; i++) {
      a = a * arguments[i];
    }
    return a;
  };

  return function() {
    var args = Array.prototype.join.call(arguments, ',');
    if (args in cache) {
      console.log('(缓存命中) ' + args + ' = ' + cache[args]);
      return cache[args];
    }
    var result = calculate.apply(null, arguments);
    cache[args] = result;
    console.log('(计算结果) ' + args + ' = ' + result);
    return result;
  };
})();

mult(2, 3);    // (计算结果) 2,3 = 6
mult(2, 3);    // (缓存命中) 2,3 = 6
mult(3, 4, 5); // (计算结果) 3,4,5 = 60
mult(3, 4, 5); // (缓存命中) 3,4,5 = 60

// cache 是私有的，外部完全无法访问

// ==============================
// 闭包修复循环变量问题
// ==============================

console.log('\n=== 闭包修复循环变量问题 ===');

// 错误示例：所有输出都是 3
console.log('--- 错误示例 ---');

var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function() {
    console.log(i);
  });
}

for (var j = 0; j < 3; j++) {
  funcs[j](); // 3, 3, 3
}

// 正确示例：使用 IIFE 创建闭包，保存每次循环的 i 值
console.log('--- 正确示例（IIFE） ---');

var funcs2 = [];
for (var i = 0; i < 3; i++) {
  (function(k) {
    funcs2.push(function() {
      console.log(k);
    });
  })(i);
}

for (var j = 0; j < 3; j++) {
  funcs2[j](); // 0, 1, 2
}

// IIFE 每次执行时都会创建一个新的作用域
// k 是该作用域中的局部变量，值等于当时的 i
// 内部函数通过闭包引用了不同的 k
