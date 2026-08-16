# 008 - 手写数组的 push 方法

## 实现

```js
Array.prototype.myPush = function (...items) {
  // this 指向调用该方法的数组
  for (let i = 0; i < items.length; i++) {
    this[this.length] = items[i];
  }
  // push 返回数组的新长度
  return this.length;
};

// 测试
const arr = [1, 2, 3];
console.log(arr.myPush(4, 5)); // 5
console.log(arr); // [1, 2, 3, 4, 5]
```

## 补充：手写 pop

```js
Array.prototype.myPop = function () {
  if (this.length === 0) return undefined;
  const last = this[this.length - 1];
  this.length = this.length - 1; // 删除最后一项
  return last;
};

const arr2 = [1, 2, 3];
console.log(arr2.myPop()); // 3
console.log(arr2); // [1, 2]
```

## 注意点

- `push` / `pop` 定义在 `Array.prototype` 上，函数内的 `this` 指向调用者（数组本身）；
- `push` 支持一次传入多个参数，返回值为**新数组的长度**；
- `pop` 返回被删除的元素，空数组返回 `undefined`。
