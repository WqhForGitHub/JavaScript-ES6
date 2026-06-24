/**
 * 手写 Array.prototype.includes（ES5 实现）
 *
 * Array.prototype.includes(searchElement, fromIndex) 判断数组中是否包含指定值，
 * 返回布尔值。与 indexOf 的区别：
 * - includes 使用 SameValueZero 算法（NaN 等于 NaN）
 * - indexOf 使用 ===（NaN 不等于 NaN）
 * - includes 返回布尔值，indexOf 返回索引
 */

// 手写 Array.prototype.includes
function arrayIncludes(arr, searchElement, fromIndex) {
  if (arr == null) {
    throw new TypeError('Cannot read property of null or undefined');
  }

  var length = arr.length >>> 0;
  if (length === 0) return false;

  // 处理 fromIndex
  var start;
  if (fromIndex === undefined || fromIndex === null) {
    start = 0;
  } else {
    start = Number(fromIndex) || 0;
  }

  // 负数 fromIndex 从末尾计算
  if (start < 0) {
    start = Math.max(length + start, 0);
  }
  // 超出范围直接返回 false
  if (start >= length) return false;

  // SameValueZero 比较
  for (var i = start; i < length; i++) {
    var element = arr[i];
    // 处理 NaN（SameValueZero：NaN 等于 NaN）
    if (element !== element && searchElement !== searchElement) {
      return true;
    }
    if (element === searchElement) {
      return true;
    }
    // 处理 +0 和 -0（SameValueZero 中 +0 === -0，所以 === 已经覆盖）
  }
  return false;
}

// 挂到 Array.prototype 的演示版本
function myIncludes(searchElement, fromIndex) {
  return arrayIncludes(this, searchElement, fromIndex);
}

// 测试 1：基本查找
console.log('--- Basic ---');
console.log(arrayIncludes([1, 2, 3], 2));    // true
console.log(arrayIncludes([1, 2, 3], 4));    // false
console.log(arrayIncludes(['a', 'b'], 'b')); // true
console.log(arrayIncludes(['a', 'b'], 'c')); // false

// 测试 2：NaN 查找（与 indexOf 的关键区别）
console.log('--- NaN ---');
var nanArr = [1, NaN, 3];
console.log(arrayIncludes(nanArr, NaN)); // true
console.log(nanArr.indexOf(NaN));        // -1（indexOf 找不到 NaN）

// 测试 3：fromIndex 参数
console.log('--- fromIndex ---');
console.log(arrayIncludes([1, 2, 3, 2, 1], 2, 2)); // true（从索引 2 开始找到）
console.log(arrayIncludes([1, 2, 3, 2, 1], 2, 3)); // true
console.log(arrayIncludes([1, 2, 3, 2, 1], 1, 2)); // true（索引 4 处有 1）
console.log(arrayIncludes([1, 2, 3], 1, 1));       // false（从索引 1 开始找，找不到 1）

// 测试 4：负数 fromIndex
console.log('--- Negative fromIndex ---');
console.log(arrayIncludes([1, 2, 3, 4, 5], 3, -3)); // true（从倒数第 3 个，即索引 2 开始）
console.log(arrayIncludes([1, 2, 3, 4, 5], 1, -3)); // false（从索引 2 开始找不到 1）
console.log(arrayIncludes([1, 2, 3], 1, -100));     // true（负数过大时从 0 开始）

// 测试 5：空数组
console.log('--- Empty array ---');
console.log(arrayIncludes([], 1)); // false

// 测试 6：稀疏数组
console.log('--- Sparse array ---');
var sparse = [1, , 3];
console.log(arrayIncludes(sparse, undefined)); // true（空洞视为 undefined）
console.log(arrayIncludes([1, 2, 3], undefined)); // false

// 测试 7：类型敏感
console.log('--- Type sensitive ---');
console.log(arrayIncludes([1, 2, 3], '2')); // false（类型不同）
console.log(arrayIncludes([true, false], 1)); // false（不进行类型转换）

// 测试 8：与原生对比
console.log('--- Compare with native ---');
var testArr = [1, 2, 3, NaN, 5];
console.log(arrayIncludes(testArr, NaN) === testArr.includes(NaN));     // true
console.log(arrayIncludes(testArr, 3, 2) === testArr.includes(3, 2));   // true
console.log(arrayIncludes(testArr, 1, -3) === testArr.includes(1, -3)); // true

// 测试 9：对象引用比较
console.log('--- Object reference ---');
var obj = { x: 1 };
console.log(arrayIncludes([obj, { x: 1 }], obj)); // true（同一引用）
console.log(arrayIncludes([{ x: 1 }], obj));       // false（不同引用）
