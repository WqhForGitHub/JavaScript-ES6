/**
 * 手写可迭代对象（自定义迭代行为）
 *
 * 可迭代对象实现了 [Symbol.iterator] 方法，返回一个迭代器。
 * 实现了该协议的对象可被 for...of、展开运算符、解构等消费。
 * 这里创建自定义的可迭代类：Range 和 LinkedList。
 */

// 可迭代的 Range 类
function Range(start, end, step) {
  this.start = start;
  this.end = end;
  this.step = step || 1;
}

Range.prototype[Symbol.iterator] = function () {
  var current = this.start;
  var end = this.end;
  var step = this.step;
  return {
    next: function () {
      if (current < end) {
        var value = current;
        current += step;
        return { value: value, done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

// 可迭代的 LinkedList
function Node(value) {
  this.value = value;
  this.next = null;
}

function LinkedList() {
  this.head = null;
  this._size = 0;
}

LinkedList.prototype.add = function (value) {
  var node = new Node(value);
  if (!this.head) {
    this.head = node;
  } else {
    var current = this.head;
    while (current.next) current = current.next;
    current.next = node;
  }
  this._size++;
  return this;
};

LinkedList.prototype[Symbol.iterator] = function () {
  var current = this.head;
  return {
    next: function () {
      if (current) {
        var value = current.value;
        current = current.next;
        return { value: value, done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

Object.defineProperty(LinkedList.prototype, 'size', {
  get: function () { return this._size; }
});

// 可迭代的矩阵（按行优先遍历）
function Matrix(rows) {
  this.rows = rows;
}

Matrix.prototype[Symbol.iterator] = function () {
  var rowIndex = 0;
  var colIndex = 0;
  var rows = this.rows;
  return {
    next: function () {
      while (rowIndex < rows.length) {
        if (colIndex < rows[rowIndex].length) {
          return { value: rows[rowIndex][colIndex++], done: false };
        }
        rowIndex++;
        colIndex = 0;
      }
      return { value: undefined, done: true };
    }
  };
};

// 测试 Range
console.log('--- Range ---');
var range = new Range(1, 6, 2);
var rangeArr = [];
for (var v of range) rangeArr.push(v);
console.log(rangeArr); // [1, 3, 5]

// 展开运算符（依赖 Symbol.iterator）
console.log([...new Range(1, 4)]); // [1, 2, 3]

// 解构
var [r1, r2] = new Range(10, 13);
console.log(r1, r2); // 10 11

// 测试 LinkedList
console.log('--- LinkedList ---');
var list = new LinkedList();
list.add(10).add(20).add(30);
var listArr = [];
for (var v of list) listArr.push(v);
console.log(listArr); // [10, 20, 30]
console.log(list.size); // 3

// 解构链表
var [first, second] = list;
console.log(first, second); // 10 20

// 展开链表
console.log([...list]); // [10, 20, 30]

// 测试 Matrix
console.log('--- Matrix ---');
var matrix = new Matrix([[1, 2, 3], [4, 5], [6, 7, 8, 9]]);
var flat = [];
for (var v of matrix) flat.push(v);
console.log(flat); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
