/**
 * 手写 Iterator 迭代器
 *
 * 迭代器是一个对象，提供 next() 方法，返回 { value, done }。
 * 可选地提供 return() 方法用于提前终止时的清理。
 * 这里实现多种迭代器工厂：数组迭代器、范围迭代器、无限迭代器等。
 */

// 创建数组迭代器
function createArrayIterator(arr) {
  var index = 0;
  return {
    next: function () {
      if (index < arr.length) {
        return { value: arr[index++], done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

// 创建范围迭代器
function createRangeIterator(start, end, step) {
  step = step || 1;
  var current = start;
  return {
    next: function () {
      if (current < end) {
        var value = current;
        current += step;
        return { value: value, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

// 创建无限迭代器（需手动停止）
function createInfiniteIterator(start) {
  var current = start;
  return {
    next: function () {
      return { value: current++, done: false };
    },
  };
}

// 带提前终止（return）的迭代器
function createIteratorWithReturn(arr) {
  var index = 0;
  var closed = false;
  return {
    next: function () {
      if (closed || index >= arr.length) {
        return { value: undefined, done: true };
      }
      return { value: arr[index++], done: false };
    },
    return: function (value) {
      closed = true;
      console.log("  [iterator return() called - cleanup]");
      return { value: value, done: true };
    },
  };
}

// 创建对象属性迭代器
function createObjectIterator(obj) {
  var keys = Object.keys(obj);
  var index = 0;
  return {
    next: function () {
      if (index < keys.length) {
        var key = keys[index++];
        return { value: { key: key, value: obj[key] }, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

// 消费迭代器的通用函数
function consume(iterator) {
  var result = [];
  var item;
  while (!(item = iterator.next()).done) {
    result.push(item.value);
  }
  return result;
}

// 测试
console.log("--- Array Iterator ---");
var arrIt = createArrayIterator(["a", "b", "c"]);
console.log(arrIt.next().value); // a
console.log(arrIt.next().value); // b
console.log(arrIt.next().value); // c
console.log(arrIt.next().done); // true

console.log("--- Range Iterator ---");
console.log(consume(createRangeIterator(1, 5, 2))); // [1, 3]

console.log("--- Infinite Iterator (take 5) ---");
var infIt = createInfiniteIterator(1);
var first5 = [];
for (var i = 0; i < 5; i++) {
  first5.push(infIt.next().value);
}
console.log(first5); // [1, 2, 3, 4, 5]

console.log("--- Iterator with return() ---");
var retIt = createIteratorWithReturn([1, 2, 3, 4, 5]);
console.log(retIt.next().value); // 1
console.log(retIt.next().value); // 2
retIt.return("stopped"); // [iterator return() called - cleanup]
console.log(retIt.next().done); // true

console.log("--- Object Iterator ---");
var objIt = createObjectIterator({ x: 10, y: 20 });
console.log(objIt.next().value); // { key: 'x', value: 10 }
console.log(objIt.next().value); // { key: 'y', value: 20 }
console.log(objIt.next().done); // true
