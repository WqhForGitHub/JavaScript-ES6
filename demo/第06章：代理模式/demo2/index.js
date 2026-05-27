// 第06章：代理模式 - 缓存代理

// ========== 基础函数：乘积计算 ==========
console.log('===== 基础函数：乘积计算 =====');

var mult = function() {
  console.log('开始计算乘积...');
  var a = 1;
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a * arguments[i];
  }
  return a;
};

console.log('mult(2, 3) =', mult(2, 3));       // 6
console.log('mult(2, 3, 4) =', mult(2, 3, 4)); // 24

// ========== 缓存代理：缓存乘积结果 ==========
console.log('\n===== 缓存代理：缓存乘积结果 =====');

var proxyMult = (function() {
  var cache = {};
  return function() {
    var args = Array.prototype.join.call(arguments, ',');
    if (args in cache) {
      console.log('命中缓存，直接返回结果');
      return cache[args];
    }
    console.log('未命中缓存，执行计算');
    return cache[args] = mult.apply(this, arguments);
  };
})();

console.log('proxyMult(2, 3) =', proxyMult(2, 3));       // 计算
console.log('proxyMult(2, 3) =', proxyMult(2, 3));       // 命中缓存
console.log('proxyMult(2, 3, 4) =', proxyMult(2, 3, 4)); // 计算
console.log('proxyMult(2, 3, 4) =', proxyMult(2, 3, 4)); // 命中缓存

// ========== 通用缓存代理工厂 ==========
console.log('\n===== 通用缓存代理工厂 =====');

var createProxyFactory = function(fn) {
  var cache = {};
  return function() {
    var args = Array.prototype.join.call(arguments, ',');
    if (args in cache) {
      console.log('命中缓存，直接返回结果');
      return cache[args];
    }
    console.log('未命中缓存，执行计算');
    return cache[args] = fn.apply(this, arguments);
  };
};

// 加法函数
var plus = function() {
  console.log('开始计算加和...');
  var a = 0;
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a + arguments[i];
  }
  return a;
};

// 使用工厂创建缓存代理
var proxyMult2 = createProxyFactory(mult);
var proxyPlus = createProxyFactory(plus);

console.log('\n--- 测试乘积缓存代理 ---');
console.log('proxyMult2(2, 3, 4) =', proxyMult2(2, 3, 4)); // 计算
console.log('proxyMult2(2, 3, 4) =', proxyMult2(2, 3, 4)); // 命中缓存

console.log('\n--- 测试加和缓存代理 ---');
console.log('proxyPlus(1, 2, 3) =', proxyPlus(1, 2, 3)); // 计算
console.log('proxyPlus(1, 2, 3) =', proxyPlus(1, 2, 3)); // 命中缓存

// ========== 缓存代理的优势 ==========
console.log('\n===== 缓存代理的优势 =====');
console.log('1. 对于计算开销大的操作，缓存代理可以避免重复计算');
console.log('2. 代理和本体职责分离，本体只负责计算，代理负责缓存');
console.log('3. 通过工厂函数，可以为任意函数创建缓存代理');
