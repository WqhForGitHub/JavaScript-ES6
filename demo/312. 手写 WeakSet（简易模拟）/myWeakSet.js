/**
 * 手写 WeakSet（简易模拟）
 *
 * WeakSet 只能存储对象成员，且是弱引用。
 * 真正的弱引用在 ES5 中无法实现，这里使用对象自身的隐藏属性来标记成员。
 * 注意：这只是简易模拟，不可遍历，无 size 属性。
 */

function MyWeakSet() {
  var STORAGE_KEY = "__weakset_" + Math.random().toString(36).slice(2) + "__";

  function isObject(value) {
    return (
      value !== null &&
      (typeof value === "object" || typeof value === "function")
    );
  }

  this.add = function (value) {
    if (!isObject(value)) {
      throw new TypeError("Invalid value used in weak set");
    }
    Object.defineProperty(value, STORAGE_KEY, {
      value: true,
      enumerable: false,
      configurable: true,
      writable: true,
    });
    return this;
  };

  this.has = function (value) {
    if (!isObject(value)) return false;
    return Object.prototype.hasOwnProperty.call(value, STORAGE_KEY);
  };

  this.delete = function (value) {
    if (!this.has(value)) return false;
    delete value[STORAGE_KEY];
    return true;
  };
}

// 测试
var ws = new MyWeakSet();
var obj1 = {};
var obj2 = {};
var obj3 = function () {};

ws.add(obj1);
ws.add(obj2);
ws.add(obj3);

console.log(ws.has(obj1)); // true
console.log(ws.has(obj2)); // true
console.log(ws.has(obj3)); // true

ws.delete(obj1);
console.log(ws.has(obj1)); // false
console.log(ws.has(obj2)); // true

// 重复添加不会出错
ws.add(obj2);
console.log(ws.has(obj2)); // true

// 非对象值会抛错
try {
  ws.add(42);
} catch (e) {
  console.log(e.message); // Invalid value used in weak set
}

try {
  ws.add("string");
} catch (e) {
  console.log(e.message); // Invalid value used in weak set
}

try {
  ws.add(null);
} catch (e) {
  console.log(e.message); // Invalid value used in weak set
}

// 隐藏属性不可枚举
var data = { name: "test" };
ws.add(data);
console.log(Object.keys(data)); // ['name']
console.log(ws.has(data)); // true
