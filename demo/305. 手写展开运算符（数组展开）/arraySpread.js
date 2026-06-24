/**
 * 手写展开运算符（数组展开）
 *
 * 数组展开 `[...arr1, ...arr2]` 本质上是将数组元素逐个放入新数组中。
 * 可以通过 concat、push.apply 或 slice + 循环来模拟。
 * 将数组展开为函数参数则使用 apply。
 */

// 使用 concat 模拟数组展开
function arraySpreadConcat() {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    if (Array.isArray(arguments[i])) {
      result = result.concat(arguments[i]);
    } else {
      result.push(arguments[i]);
    }
  }
  return result;
}

// 使用 push.apply 模拟数组展开
function arraySpreadPush() {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    if (Array.isArray(arguments[i])) {
      Array.prototype.push.apply(result, arguments[i]);
    } else {
      result.push(arguments[i]);
    }
  }
  return result;
}

// 复制数组（模拟 const copy = [...arr]）
function copyArray(arr) {
  return arr.slice();
}

// 将数组展开为函数参数（模拟 fn(...args)）
function applyArgs(fn, args) {
  return fn.apply(null, args);
}

// 模拟 Math.max(...arr)
function maxOfArray(arr) {
  return Math.max.apply(null, arr);
}

// 测试
var arr1 = [1, 2, 3];
var arr2 = [4, 5, 6];

var merged1 = arraySpreadConcat(arr1, arr2);
console.log(merged1); // [1, 2, 3, 4, 5, 6]

var merged2 = arraySpreadPush(arr1, [0], arr2);
console.log(merged2); // [1, 2, 3, 0, 4, 5, 6]

var copy = copyArray(arr1);
console.log(copy);          // [1, 2, 3]
console.log(copy === arr1); // false

var sum = applyArgs(function () {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) total += arguments[i];
  return total;
}, [1, 2, 3, 4]);
console.log(sum); // 10

console.log(maxOfArray([3, 7, 2, 9, 1])); // 9

// 嵌套展开：模拟 [...outer, ...inner]
var nested = arraySpreadConcat([1, 2], arraySpreadConcat([3], [4]));
console.log(nested); // [1, 2, 3, 4]
