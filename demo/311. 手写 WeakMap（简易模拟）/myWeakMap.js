/**
 * 手写 WeakMap（简易模拟）
 *
 * WeakMap 的键必须是对象，且键是弱引用（不影响垃圾回收）。
 * 真正的弱引用在 ES5 中无法实现，这里使用对象自身的隐藏属性来存储值，
 * 实现键到值的映射。注意：这只是简易模拟，无法真正实现弱引用语义，
 * 也不可枚举、不可遍历。
 */

function MyWeakMap() {
  // 每个实例使用一个随机属性名作为存储键，避免冲突
  var STORAGE_KEY = "__weakmap_" + Math.random().toString(36).slice(2) + "__";

  function isObject(key) {
    return (
      key !== null && (typeof key === "object" || typeof key === "function")
    );
  }

  this.set = function (key, value) {
    if (!isObject(key)) {
      throw new TypeError("Invalid value used as weak map key");
    }
    Object.defineProperty(key, STORAGE_KEY, {
      value: value,
      enumerable: false,
      configurable: true,
      writable: true,
    });
    return this;
  };

  this.get = function (key) {
    if (!isObject(key)) return undefined;
    return key[STORAGE_KEY];
  };

  this.has = function (key) {
    if (!isObject(key)) return false;
    return Object.prototype.hasOwnProperty.call(key, STORAGE_KEY);
  };

  this.delete = function (key) {
    if (!this.has(key)) return false;
    delete key[STORAGE_KEY];
    return true;
  };
}

// 测试
var wm = new MyWeakMap();
var obj = {};
var arr = [];
var fn = function () {};

wm.set(obj, "value1");
wm.set(arr, 123);
wm.set(fn, true);

console.log(wm.get(obj)); // value1
console.log(wm.get(arr)); // 123
console.log(wm.get(fn)); // true
console.log(wm.has(obj)); // true

wm.delete(obj);
console.log(wm.has(obj)); // false
console.log(wm.get(obj)); // undefined

// 非对象键会抛错
try {
  wm.set("string", "val");
} catch (e) {
  console.log(e.message); // Invalid value used as weak map key
}

try {
  wm.set(null, "val");
} catch (e) {
  console.log(e.message); // Invalid value used as weak map key
}

// 重新赋值
wm.set(arr, "updated");
console.log(wm.get(arr)); // updated

// 对象属性不可枚举（不影响正常遍历）
var data = { x: 1, y: 2 };
wm.set(data, "hidden");
console.log(Object.keys(data)); // ['x', 'y']（不包含隐藏属性）
console.log(wm.get(data)); // hidden
