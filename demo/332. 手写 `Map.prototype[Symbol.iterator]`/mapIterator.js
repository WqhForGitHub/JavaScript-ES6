/**
 * 手写 Map.prototype[Symbol.iterator]
 *
 * Map 的默认迭代器按插入顺序返回 [key, value] 键值对数组。
 * 这里基于手写的 Map 实现，手写其 [Symbol.iterator] 方法，
 * 并验证与原生 Map 行为一致。
 */

// 简化版 Map（仅用于演示迭代器）
function SimpleMap(entries) {
  this._keys = [];
  this._values = [];
  if (entries) {
    var self = this;
    entries.forEach(function (entry) {
      self.set(entry[0], entry[1]);
    });
  }
}

SimpleMap.prototype.set = function (key, value) {
  var idx = this._keys.indexOf(key);
  if (idx === -1) {
    this._keys.push(key);
    this._values.push(value);
  } else {
    this._values[idx] = value;
  }
  return this;
};

SimpleMap.prototype.get = function (key) {
  var idx = this._keys.indexOf(key);
  return idx === -1 ? undefined : this._values[idx];
};

// 手写 entries 方法
SimpleMap.prototype.entries = function () {
  var index = 0;
  var keys = this._keys;
  var values = this._values;
  return {
    next: function () {
      if (index < keys.length) {
        return { value: [keys[index], values[index++]], done: false };
      }
      return { value: undefined, done: true };
    },
  };
};

// 手写 keys 方法
SimpleMap.prototype.keys = function () {
  var index = 0;
  var keys = this._keys;
  return {
    next: function () {
      if (index < keys.length) {
        return { value: keys[index++], done: false };
      }
      return { value: undefined, done: true };
    },
  };
};

// 手写 values 方法
SimpleMap.prototype.values = function () {
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

// 默认迭代器等同于 entries
SimpleMap.prototype[Symbol.iterator] = SimpleMap.prototype.entries;

Object.defineProperty(SimpleMap.prototype, "size", {
  get: function () {
    return this._keys.length;
  },
});

// 测试 1：for...of 遍历键值对
console.log("--- for...of entries ---");
var map = new SimpleMap([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
var pairs = [];
for (var entry of map) {
  pairs.push(entry);
}
console.log(pairs); // [['a', 1], ['b', 2], ['c', 3]]

// 测试 2：展开运算符
console.log("--- Spread ---");
console.log([...map]); // [['a', 1], ['b', 2], ['c', 3]]

// 测试 3：解构
console.log("--- Destructuring ---");
for (var [key, value] of map) {
  console.log(key + "=" + value);
}
// a=1
// b=2
// c=3

// 测试 4：keys 迭代器
console.log("--- keys() ---");
var keys = [];
var keysIt = map.keys();
var r;
while (!(r = keysIt.next()).done) keys.push(r.value);
console.log(keys); // ['a', 'b', 'c']

// 测试 5：values 迭代器
console.log("--- values() ---");
var values = [];
for (var v of {
  [Symbol.iterator]: function () {
    return map.values();
  },
}) {
  values.push(v);
}
console.log(values); // [1, 2, 3]

// 测试 6：插入顺序保持
console.log("--- Insertion order ---");
var ordered = new SimpleMap();
ordered.set("z", 26);
ordered.set("a", 1);
ordered.set("m", 13);
console.log([...ordered]); // [['z', 26], ['a', 1], ['m', 13]]

// 测试 7：与原生 Map 对比
console.log("--- Compare with native Map ---");
var native = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
var nativePairs = [...native];
var myPairs = [...map];
console.log(JSON.stringify(nativePairs) === JSON.stringify(myPairs)); // true

// 测试 8：空 Map
console.log("--- Empty map ---");
var empty = new SimpleMap();
console.log([...empty]); // []
console.log(empty.size); // 0
