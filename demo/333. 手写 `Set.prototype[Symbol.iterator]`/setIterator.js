/**
 * 手写 Set.prototype[Symbol.iterator]
 *
 * Set 的默认迭代器按插入顺序逐个返回集合中的值。
 * 这里基于手写的 Set 实现，手写其 [Symbol.iterator] 方法，
 * 并验证与原生 Set 行为一致。
 */

// 简化版 Set（仅用于演示迭代器）
function SimpleSet(iterable) {
  this._values = [];
  if (iterable) {
    var self = this;
    iterable.forEach(function (item) {
      self.add(item);
    });
  }
}

SimpleSet.prototype.add = function (value) {
  if (this._values.indexOf(value) === -1) {
    this._values.push(value);
  }
  return this;
};

SimpleSet.prototype.has = function (value) {
  return this._values.indexOf(value) !== -1;
};

SimpleSet.prototype.delete = function (value) {
  var idx = this._values.indexOf(value);
  if (idx === -1) return false;
  this._values.splice(idx, 1);
  return true;
};

// 手写 values 方法
SimpleSet.prototype.values = function () {
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

// 手写 entries 方法（Set 的 entries 返回 [value, value] 对）
SimpleSet.prototype.entries = function () {
  var index = 0;
  var values = this._values;
  return {
    next: function () {
      if (index < values.length) {
        var v = values[index++];
        return { value: [v, v], done: false };
      }
      return { value: undefined, done: true };
    },
  };
};

// 默认迭代器等同于 values
SimpleSet.prototype[Symbol.iterator] = SimpleSet.prototype.values;

Object.defineProperty(SimpleSet.prototype, "size", {
  get: function () {
    return this._values.length;
  },
});

SimpleSet.prototype.forEach = function (callback, thisArg) {
  var self = this;
  this._values.forEach(function (value) {
    callback.call(thisArg, value, value, self);
  });
};

// 测试 1：for...of 遍历值
console.log("--- for...of values ---");
var set = new SimpleSet([1, 2, 3, 2, 1]);
var collected = [];
for (var v of set) {
  collected.push(v);
}
console.log(collected); // [1, 2, 3]

// 测试 2：展开运算符
console.log("--- Spread ---");
console.log([...set]); // [1, 2, 3]

// 测试 3：解构
console.log("--- Destructuring ---");
var [a, b] = set;
console.log(a, b); // 1 2

// 测试 4：entries 方法
console.log("--- entries() ---");
var entriesArr = [];
var entriesIt = set.entries();
var r;
while (!(r = entriesIt.next()).done) entriesArr.push(r.value);
console.log(entriesArr); // [[1, 1], [2, 2], [3, 3]]

// 测试 5：插入顺序保持
console.log("--- Insertion order ---");
var ordered = new SimpleSet();
ordered.add("z").add("a").add("m");
console.log([...ordered]); // ['z', 'a', 'm']

// 测试 6：用于数组去重
console.log("--- Deduplication ---");
var deduped = [...new SimpleSet([1, 1, 2, 3, 3, 3, 4])];
console.log(deduped); // [1, 2, 3, 4]

// 测试 7：与原生 Set 对比
console.log("--- Compare with native Set ---");
var native = new Set([1, 2, 3, 2, 1]);
var nativeArr = [...native];
var myArr = [...set];
console.log(JSON.stringify(nativeArr) === JSON.stringify(myArr)); // true

// 测试 8：空 Set
console.log("--- Empty set ---");
var empty = new SimpleSet();
console.log([...empty]); // []
console.log(empty.size); // 0

// 测试 9：集合运算
console.log("--- Set operations ---");
var s1 = new SimpleSet([1, 2, 3]);
var s2 = new SimpleSet([3, 4, 5]);
// 交集
var intersection = [...s1].filter(function (x) {
  return s2.has(x);
});
console.log(intersection); // [3]
// 差集
var difference = [...s1].filter(function (x) {
  return !s2.has(x);
});
console.log(difference); // [1, 2]
