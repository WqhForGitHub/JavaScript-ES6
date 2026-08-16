# 009 - 手写数组的 filter 方法

## 实现思路

1. `filter` 接收一个回调函数 `callback` 和可选的 `thisArg`；
2. 遍历数组，对每个元素执行回调，回调返回真值则保留该元素；
3. 返回一个**新数组**，不改变原数组；
4. 回调接收三个参数：`element`、`index`、`array`；
5. 遍历开始后追加的元素不会被访问，被删除的元素跳过。

## 代码实现

```js
Array.prototype.myFilter = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or not defined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const arr = Object(this);
  const len = arr.length >>> 0;
  const result = [];

  for (let i = 0; i < len; i++) {
    // 跳过稀疏数组中的空槽
    if (i in arr) {
      if (callback.call(thisArg, arr[i], i, arr)) {
        result.push(arr[i]);
      }
    }
  }
  return result;
};

// 测试
const arr = [1, 2, 3, 4, 5, 6];

console.log(arr.myFilter((item) => item > 3)); // [4, 5, 6]
console.log(arr.myFilter((item, index) => index % 2 === 0)); // [1, 3, 5]
console.log(arr); // [1, 2, 3, 4, 5, 6] 原数组不变
```

## 使用示例

```js
// 过滤对象数组
const users = [
  { name: '张三', age: 18 },
  { name: '李四', age: 25 },
  { name: '王五', age: 30 },
];

const adults = users.myFilter((user) => user.age >= 25);
console.log(adults);
// [{ name: '李四', age: 25 }, { name: '王五', age: 30 }]
```
