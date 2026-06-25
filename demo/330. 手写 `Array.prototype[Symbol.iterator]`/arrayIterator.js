/**
 * 手写 Array.prototype[Symbol.iterator]
 *
 * 数组的默认迭代器按索引顺序逐个返回元素。
 * 这里手写实现数组迭代器，并验证它与原生行为一致。
 * 实现要点：维护一个索引，每次 next() 返回当前索引元素并递增。
 */

// 手写数组迭代器工厂
function createArrayIterator(arr) {
  var index = 0;
  var length = arr.length;
  return {
    next: function () {
      if (index < length) {
        return { value: arr[index++], done: false };
      }
      return { value: undefined, done: true };
    },
    // 可选的 return 方法（提前终止时调用）
    return: function (value) {
      return { value: value, done: true };
    },
  };
}

// 手写 Array.prototype[Symbol.iterator] 的实现
function myArrayIterator() {
  return createArrayIterator(this);
}

// 将手写迭代器挂到一个自定义数组类上验证
function MyArray() {
  var arr = [];
  for (var i = 0; i < arguments.length; i++) {
    arr[i] = arguments[i];
  }
  arr.__proto__ = MyArray.prototype;
  return arr;
}
MyArray.prototype = Object.create(Array.prototype);
MyArray.prototype[Symbol.iterator] = myArrayIterator;

// 也可以直接覆盖原生数组的迭代器（仅在测试中，不建议在生产环境）
function withCustomIterator(arr) {
  return {
    _arr: arr,
    [Symbol.iterator]: function () {
      return createArrayIterator(this._arr);
    },
  };
}

// 测试 1：手写迭代器基本功能
console.log("--- Basic array iterator ---");
var it = createArrayIterator([10, 20, 30]);
console.log(it.next().value); // 10
console.log(it.next().value); // 20
console.log(it.next().value); // 30
console.log(it.next().done); // true

// 测试 2：用于 for...of
console.log("--- for...of ---");
var collected = [];
var customArr = withCustomIterator([1, 2, 3, 4, 5]);
for (var v of customArr) {
  collected.push(v);
}
console.log(collected); // [1, 2, 3, 4, 5]

// 测试 3：展开运算符
console.log("--- Spread ---");
console.log([...withCustomIterator([6, 7, 8])]); // [6, 7, 8]

// 测试 4：解构
console.log("--- Destructuring ---");
var [a, b, c] = withCustomIterator([100, 200, 300]);
console.log(a, b, c); // 100 200 300

// 测试 5：空数组
console.log("--- Empty array ---");
var emptyIt = createArrayIterator([]);
console.log(emptyIt.next().done); // true

// 测试 6：与原生迭代器对比
console.log("--- Compare with native ---");
var nativeArr = [1, 2, 3];
var nativeIt = nativeArr[Symbol.iterator]();
var myIt = createArrayIterator([1, 2, 3]);
var nativeResults = [];
var myResults = [];
var r;
while (!(r = nativeIt.next()).done) nativeResults.push(r.value);
while (!(r = myIt.next()).done) myResults.push(r.value);
console.log(nativeResults); // [1, 2, 3]
console.log(myResults); // [1, 2, 3]
console.log(JSON.stringify(nativeResults) === JSON.stringify(myResults)); // true

// 测试 7：稀疏数组处理
console.log("--- Sparse array ---");
var sparse = [1, , 3]; // 稀疏数组，索引 1 处无值
var sparseIt = createArrayIterator(sparse);
console.log(sparseIt.next().value); // 1
console.log(sparseIt.next().value); // undefined（空洞）
console.log(sparseIt.next().value); // 3
console.log(sparseIt.next().done); // true
