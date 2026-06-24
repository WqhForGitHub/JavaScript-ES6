/**
 * 手写 Reflect.apply
 *
 * Reflect.apply(target, thisArg, argumentsList)
 * 等价于 Function.prototype.apply.call(target, thisArg, argumentsList)。
 * 通过指定 this 和参数列表调用目标函数。
 * 这里手写一个与原生 Reflect.apply 行为一致的实现。
 */

// 手写 Reflect.apply
function myReflectApply(target, thisArg, argumentsList) {
  if (typeof target !== 'function') {
    throw new TypeError('Reflect.apply called on non-function');
  }
  if (argumentsList == null || typeof argumentsList !== 'object') {
    throw new TypeError('CreateListFromArrayLike called on non-object');
  }
  // 将 argumentsList 转为数组（支持类数组对象）
  var args;
  if (Array.isArray(argumentsList)) {
    args = argumentsList;
  } else {
    var len = argumentsList.length >>> 0;
    args = [];
    for (var i = 0; i < len; i++) {
      args.push(argumentsList[i]);
    }
  }
  return target.apply(thisArg, args);
}

// 测试 1：基本调用
console.log('--- Basic apply ---');
function greet(greeting, name) {
  return greeting + ', ' + name + '!';
}
console.log(myReflectApply(greet, undefined, ['Hello', 'Alice'])); // Hello, Alice!

// 测试 2：使用 thisArg
console.log('--- With thisArg ---');
var obj = {
  prefix: 'Mr.',
  format: function (name) {
    return this.prefix + ' ' + name;
  }
};
console.log(myReflectApply(obj.format, obj, ['Smith'])); // Mr. Smith

// 测试 3：与 Math.max 配合
console.log('--- Math.max ---');
console.log(myReflectApply(Math.max, null, [1, 5, 3, 9, 2])); // 9

// 测试 4：空参数列表
console.log('--- Empty args ---');
console.log(myReflectApply(function () { return arguments.length; }, null, [])); // 0

// 测试 5：类数组对象作为参数列表
console.log('--- Array-like arguments ---');
function sum() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) total += arguments[i];
  return total;
}
var arrayLike = { 0: 1, 1: 2, 2: 3, length: 3 };
console.log(myReflectApply(sum, null, arrayLike)); // 6

// 测试 6：与原生 Reflect.apply 对比
console.log('--- Compare with native ---');
console.log(myReflectApply(greet, undefined, ['Hi', 'Bob'])); // Hi, Bob!
console.log(Reflect.apply(greet, undefined, ['Hi', 'Bob']));  // Hi, Bob!

// 测试 7：非函数目标抛错
console.log('--- Error on non-function ---');
try {
  myReflectApply({}, null, []);
} catch (e) {
  console.log(e.message); // Reflect.apply called on non-function
}
