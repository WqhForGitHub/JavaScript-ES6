/**
 * 手写 for...of 迭代器协议
 *
 * for...of 循环通过调用对象的 [Symbol.iterator] 方法获取迭代器，
 * 然后反复调用迭代器的 next() 方法直到 done 为 true。
 * 这里手动模拟 for...of 的执行过程，并支持 break/return 提前退出。
 */

// 手写 for...of：接收可迭代对象和回调
function forOf(iterable, callback) {
  var iterator = iterable[Symbol.iterator]();
  var result;
  while (!(result = iterator.next()).done) {
    callback(result.value);
  }
  // 如果迭代器有 return 方法，正常结束时也可以调用（可选）
  return undefined;
}

// 支持 break 的 for...of：回调返回 false 时提前退出
function forOfBreakable(iterable, callback) {
  var iterator = iterable[Symbol.iterator]();
  var result;
  while (!(result = iterator.next()).done) {
    var ret = callback(result.value);
    if (ret === false) {
      // 提前退出时调用 return 方法进行清理
      if (typeof iterator.return === "function") {
        iterator.return();
      }
      return "break";
    }
  }
  return "complete";
}

// 自定义可迭代对象
var range = {
  from: 1,
  to: 5,
  [Symbol.iterator]: function () {
    var current = this.from;
    var last = this.to;
    return {
      next: function () {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
      return: function () {
        console.log("  [iterator cleanup called]");
        return { value: undefined, done: true };
      },
    };
  },
};

// 测试 1：完整遍历
var collected = [];
forOf(range, function (v) {
  collected.push(v);
});
console.log(collected); // [1, 2, 3, 4, 5]

// 测试 2：对原生数组使用
var sum = 0;
forOf([10, 20, 30], function (v) {
  sum += v;
});
console.log(sum); // 60

// 测试 3：对字符串使用（字符串也是可迭代的）
var chars = [];
forOf("abc", function (c) {
  chars.push(c);
});
console.log(chars); // ['a', 'b', 'c']

// 测试 4：带 break 提前退出
var firstBig = null;
var status = forOfBreakable([1, 2, 3, 10, 20, 30], function (v) {
  if (v > 5) {
    firstBig = v;
    return false; // 模拟 break
  }
});
console.log(firstBig); // 10
console.log(status); // break

// 测试 5：带 break 退出自定义可迭代对象（会触发 return 清理）
var partial = [];
var status2 = forOfBreakable(range, function (v) {
  partial.push(v);
  if (v >= 3) return false;
});
console.log(partial); // [1, 2, 3]
console.log(status2); // break
