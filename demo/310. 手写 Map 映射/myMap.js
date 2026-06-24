/**
 * 手写 Map 映射
 *
 * Map 是键值对的集合，键可以是任意值（包括对象和 NaN）。
 * 实现要点：维护平行的键数组和值数组，使用 SameValueZero 比较键。
 * 同时实现迭代器协议，支持 for...of 遍历和展开运算符。
 */

function MyMap(iterable) {
  this._keys = [];
  this._values = [];
  if (iterable) {
    var self = this;
    iterable.forEach(function (entry) {
      self.set(entry[0], entry[1]);
    });
  }
}

// SameValueZero 比较
function sameValueZero(a, b) {
  if (a !== a) return b !== b;
  return a === b;
}

MyMap.prototype.set = function (key, value) {
  for (var i = 0; i < this._keys.length; i++) {
    if (sameValueZero(this._keys[i], key)) {
      this._values[i] = value;
      return this;
    }
  }
  this._keys.push(key);
  this._values.push(value);
  return this;
};

MyMap.prototype.get = function (key) {
  for (var i = 0; i < this._keys.length; i++) {
    if (sameValueZero(this._keys[i], key)) {
      return this._values[i];
    }
  }
  return undefined;
};

MyMap.prototype.has = function (key) {
  for (var i = 0; i < this._keys.length; i++) {
    if (sameValueZero(this._keys[i], key)) {
      return true;
    }
  }
  return false;
};

MyMap.prototype.delete = function (key) {
  for (var i = 0; i < this._keys.length; i++) {
    if (sameValueZero(this._keys[i], key)) {
      this._keys.splice(i, 1);
      this._values.splice(i, 1);
      return true;
    }
  }
  return false;
};

MyMap.prototype.clear = function () {
  this._keys = [];
  this._values = [];
};

MyMap.prototype.forEach = function (callback, thisArg) {
  for (var i = 0; i < this._keys.length; i++) {
    callback.call(thisArg, this._values[i], this._keys[i], this);
  }
};

// 实现 entries 迭代器
MyMap.prototype.entries = function () {
  var index = 0;
  var keys = this._keys;
  var values = this._values;
  return {
    next: function () {
      if (index < keys.length) {
        return { value: [keys[index], values[index++]], done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

// 实现 keys 迭代器
MyMap.prototype.keys = function () {
  var index = 0;
  var keys = this._keys;
  return {
    next: function () {
      if (index < keys.length) {
        return { value: keys[index++], done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

// 实现 values 迭代器
MyMap.prototype.values = function () {
  var index = 0;
  var values = this._values;
  return {
    next: function () {
      if (index < values.length) {
        return { value: values[index++], done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

// 默认迭代器与 entries 相同
MyMap.prototype[Symbol.iterator] = MyMap.prototype.entries;

Object.defineProperty(MyMap.prototype, 'size', {
  get: function () { return this._keys.length; }
});

// 测试
var map = new MyMap([['a', 1], ['b', 2]]);
console.log(map.size);     // 2
console.log(map.get('a')); // 1

map.set('c', 3);
map.set('a', 10); // 覆盖
console.log(map.get('a')); // 10
console.log(map.size);     // 3

console.log(map.has('b')); // true
map.delete('b');
console.log(map.has('b')); // false

// 对象作为键
var objKey = {};
var funcKey = function () {};
map.set(objKey, 'object value');
map.set(funcKey, 'function value');
console.log(map.get(objKey));  // object value
console.log(map.get(funcKey)); // function value

// NaN 作为键
map.set(NaN, 'nan value');
console.log(map.get(NaN)); // nan value

// forEach 遍历
var entries = [];
map.forEach(function (v, k) { entries.push([k, v]); });
console.log(entries.length); // 5

// for...of 遍历
var forOfEntries = [];
for (var entry of map) forOfEntries.push(entry);
console.log(forOfEntries.length); // 5
