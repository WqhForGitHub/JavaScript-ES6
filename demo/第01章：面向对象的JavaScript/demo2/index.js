// ==============================
// 封装数据 —— 使用闭包实现私有变量
// ==============================

console.log('=== 封装数据：IIFE 闭包模式 ===');

var myObject = (function() {
  var __name = 'sven'; // 私有变量

  return {
    getName: function() {
      return __name;
    },
    setName: function(name) {
      __name = name;
    }
  };
})();

console.log(myObject.getName()); // sven
myObject.setName('Tom');
console.log(myObject.getName()); // Tom

// 无法从外部直接访问 __name
console.log(myObject.__name);    // undefined

// ==============================
// 封装数据 —— mult 函数缓存
// ==============================

console.log('\n=== 封装数据：mult 缓存 ===');

var mult = (function() {
  var cache = {}; // 私有缓存对象

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
      console.log('从缓存中读取结果:', cache[args]);
      return cache[args];
    }
    var result = calculate.apply(null, arguments);
    cache[args] = result;
    console.log('计算并缓存结果:', result);
    return result;
  };
})();

mult(2, 3);       // 计算并缓存结果: 6
mult(2, 3);       // 从缓存中读取结果: 6
mult(1, 2, 3);    // 计算并缓存结果: 6
mult(1, 2, 3);    // 从缓存中读取结果: 6
mult(2, 3, 4);    // 计算并缓存结果: 24
mult(2, 3, 4);    // 从缓存中读取结果: 24

// cache 是私有的，外部无法直接访问或修改
// 只能通过 mult 函数间接使用缓存功能
