# 010 - 手写数组的 map 方法

## 实现思路

1. `map` 接收一个回调函数 `callback` 和可选的 `thisArg`；
2. 遍历数组，对每个元素执行回调，把**返回值**收集到新数组；
3. 返回一个长度相同的新数组，不改变原数组；
4. 回调接收三个参数：`element`、`index`、`array`。

## 代码实现

```js
Array.prototype.myMap = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or not defined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const arr = Object(this);
  const len = arr.length >>> 0;
  const result = new Array(len);

  for (let i = 0; i < len; i++) {
    if (i in arr) {
      result[i] = callback.call(thisArg, arr[i], i, arr);
    }
  }
  return result;
};

// 测试
const arr = [1, 2, 3, 4, 5];

console.log(arr.myMap((item) => item * 2)); // [2, 4, 6, 8, 10]
console.log(arr.myMap((item, index) => `${index}-${item}`)); // ['0-1', '1-2', '2-3', '3-4', '4-5']
console.log(arr); // [1, 2, 3, 4, 5] 原数组不变
```

## 使用示例

```js
// 提取对象数组中的某个属性
const users = [
  { name: '张三', age: 18 },
  { name: '李四', age: 25 },
];

const names = users.myMap((user) => user.name);
console.log(names); // ['张三', '李四']
```

## 注意点

- `map` 与 `forEach` 的区别：`map` 会返回新数组，`forEach` 返回 `undefined`；
- 若回调中不写 `return`，新数组对应位置为 `undefined`。
