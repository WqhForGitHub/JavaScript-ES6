/**
 * 手写 Set 集合
 *
 * Set 是一个值的集合，其中每个值都是唯一的（使用 SameValueZero 比较）。
 * 实现要点：使用内部数组存储值，add 时去重，NaN 视为相等。
 * 同时实现迭代器协议使其可被 for...of 遍历。
 */

function MySet(iterable) {
  this._values = [];
  if (iterable) {
    var self = this;
    iterable.forEach(function (item) {
      self.add(item);
    });
  }
}

// SameValueZero 比较（NaN 等于 NaN，其余用 ===）
function sameValueZero(a, b) {
  if (a !== a) return b !== b;
  return a === b;
}

MySet.prototype.add = function (value) {
  for (var i = 0; i < this._values.length; i++) {
    if (sameValueZero(this._values[i], value)) {
      return this; // 已存在，不重复添加
    }
  }
  this._values.push(value);
  return this;
};

MySet.prototype.has = function (value) {
  for (var i = 0; i < this._values.length; i++) {
    if (sameValueZero(this._values[i], value)) {
      return true;
    }
  }
  return false;
};

MySet.prototype.delete = function (value) {
  for (var i = 0; i < this._values.length; i++) {
    if (sameValueZero(this._values[i], value)) {
      this._values.splice(i, 1);
      return true;
    }
  }
  return false;
};

MySet.prototype.clear = function () {
  this._values = [];
};

MySet.prototype.forEach = function (callback, thisArg) {
  var self = this;
  this._values.forEach(function (value) {
    callback.call(thisArg, value, value, self);
  });
};

// 实现迭代器协议，使 MySet 可被 for...of 遍历
MySet.prototype[Symbol.iterator] = function () {
  var index = 0;
  var values = this._values;
  return {
    next: function () {
      if (index < values.length) {
        return { value: values[index++], done: false };
      }
      return { value: undefined, done: true };
    },
  };
};

Object.defineProperty(MySet.prototype, "size", {
  get: function () {
    return this._values.length;
  },
});

// 测试
var set = new MySet([1, 2, 3, 2, 1]);
console.log(set.size); // 3
console.log(set.has(2)); // true
console.log(set.has(5)); // false

set.add(4).add(5);
console.log(set.size); // 5

set.delete(2);
console.log(set.has(2)); // false

var result = [];
set.forEach(function (v) {
  result.push(v);
});
console.log(result); // [1, 3, 4, 5]

// 使用 for...of 遍历
var iterResult = [];
for (var v of set) iterResult.push(v);
console.log(iterResult); // [1, 3, 4, 5]

// NaN 去重
var nanSet = new MySet();
nanSet.add(NaN).add(NaN);
console.log(nanSet.size); // 1
console.log(nanSet.has(NaN)); // true

// 集合运算：并集
MySet.prototype.union = function (other) {
  var result = new MySet();
  this.forEach(function (v) {
    result.add(v);
  });
  other.forEach(function (v) {
    result.add(v);
  });
  return result;
};

var a = new MySet([1, 2, 3]);
var b = new MySet([3, 4, 5]);
console.log([...a.union(b)]); // [1, 2, 3, 4, 5]
