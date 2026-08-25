// ==============================
// 柯里化 (currying)
// ==============================

console.log('=== 柯里化实现 ===');

// currying 函数：收集参数，直到不传参数时才执行计算
const currying = function (fn) {
  const args = []; // 用于收集参数

  return function () {
    if (arguments.length === 0) {
      // 不传参数时，执行原函数
      return fn.apply(this, args);
    } else {
      // 传入参数时，收集参数
      Array.prototype.push.apply(args, arguments);
      // 返回自身，支持链式调用
      return arguments.callee;
    }
  };
};

// ==============================
// 月度开销计算示例
// ==============================

console.log('\n=== 月度开销计算 ===');

// 原始的 cost 函数
const cost = (function () {
  let money = 0;
  return function () {
    for (let i = 0, l = arguments.length; i < l; i++) {
      money += arguments[i];
    }
    return money;
  };
})();

// 经过柯里化后
const costCurried = currying(cost);

costCurried(100); // 记录第1笔开销
costCurried(200); // 记录第2笔开销
costCurried(300); // 记录第3笔开销

console.log('所有开销总计:', costCurried()); // 600

// 可以继续添加新的开销
costCurried(50);
costCurried(150);

console.log('追加后总计:', costCurried()); // 800

// ==============================
// 通用柯里化示例
// ==============================

console.log('\n=== 通用柯里化示例 ===');

const sum = function () {
  let total = 0;
  for (let i = 0, l = arguments.length; i < l; i++) {
    total += arguments[i];
  }
  console.log('求和结果:', total);
  return total;
};

const curriedSum = currying(sum);

curriedSum(1);
curriedSum(2);
curriedSum(3);
curriedSum(4);
curriedSum(5);
curriedSum(); // 求和结果: 15

// ==============================
// uncurrying 示例
// ==============================

console.log('\n=== uncurrying ===');

// uncurrying：将对象的方法脱离出来，使其可以被任意对象使用
const uncurrying = function (fn) {
  return function () {
    const obj = [].shift.call(arguments);
    return fn.apply(obj, arguments);
  };
};

// 将 Array.prototype.push 脱离出来
const push = uncurrying(Array.prototype.push);

(function () {
  push(arguments, 4);
  push(arguments, 5);
  console.log('arguments after push:', arguments.length); // 4 (原2个 + 新增2个)
  console.log('arguments[2]:', arguments[2]); // 4
  console.log('arguments[3]:', arguments[3]); // 5
})(1, 2, 3);
