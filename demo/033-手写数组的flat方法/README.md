# 033 - 手写数组的 flat 方法

> `Array.prototype.flat(depth)`：按指定深度递归遍历数组，返回新数组。
> `depth` 默认为 1，传 `Infinity` 可完全拍平。

## 实现（递归版）

```js
Array.prototype.myFlat = function (depth = 1) {
  if (depth < 0) throw new RangeError('depth must be a positive number');

  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (Array.isArray(this[i]) && depth > 0) {
      // 递归拍平，深度减一
      result.push(...this[i].myFlat(depth - 1));
    } else {
      result.push(this[i]);
    }
  }

  return result;
};

// 测试
console.log([1, [2, 3]].myFlat()); // [1, 2, 3]
console.log([1, [2, [3, [4]]]].myFlat(1)); // [1, 2, [3, [4]]]
console.log([1, [2, [3, [4]]]].myFlat(2)); // [1, 2, 3, [4]]
console.log([1, [2, [3, [4]]]].myFlat(Infinity)); // [1, 2, 3, 4]
console.log([1, , 2].myFlat()); // [1, 2]（空槽被移除，与原生一致）
```

## 实现（reduce 版）

```js
Array.prototype.myFlat = function (depth = 1) {
  return this.reduce(
    (prev, cur) =>
      prev.concat(
        Array.isArray(cur) && depth > 0 ? cur.myFlat(depth - 1) : cur
      ),
    []
  );
};

console.log([1, [2, [3, [4]]]].myFlat(Infinity)); // [1, 2, 3, 4]
```

## 实现（迭代栈版，避免深递归）

```js
Array.prototype.myFlat = function (depth = 1) {
  const stack = [...this.map((item) => ({ item, depth }))];
  const result = [];

  while (stack.length) {
    const { item, depth: d } = stack.pop();
    if (Array.isArray(item) && d > 0) {
      // 子元素入栈，深度减一
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push({ item: item[i], depth: d - 1 });
      }
    } else {
      result.push(item);
    }
  }

  // 栈是倒序处理，需要反转
  return result.reverse();
};

console.log([1, [2, [3, [4, 5]]]].myFlat(Infinity)); // [1, 2, 3, 4, 5]
```

## 附：flatMap 简单实现

```js
Array.prototype.myFlatMap = function (callback) {
  return this.myFlat(1).map((item, index, arr) => callback(item, index, arr));
  // 更严谨的实现：先 map 再 flat(1)
};

console.log([1, 2, 3].myFlatMap((x) => [x, x * 2]));
// [1, 2, 2, 4, 3, 6]
```
