# 031 - 数组的扁平化

> 将多维数组转为一维数组，如 `[1, [2, [3, [4]]]]` -> `[1, 2, 3, 4]`。

## 方式一：递归 + reduce

```js
function flatten(arr) {
  return arr.reduce(
    (prev, cur) => (Array.isArray(cur) ? prev.concat(flatten(cur)) : prev.concat(cur)),
    []
  );
}

console.log(flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]
```

## 方式二：递归 + for 循环

```js
function flatten(arr) {
  let result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result = result.concat(flatten(item)); // 或用 push(...flatten(item))
    } else {
      result.push(item);
    }
  }
  return result;
}

console.log(flatten([1, [2, [3, [4, 5]]], 6])); // [1, 2, 3, 4, 5, 6]
```

## 方式三：while + concat（拍平一层直到没有嵌套）

```js
function flatten(arr) {
  let result = arr.slice();
  // 只要还存在嵌套数组就拍平一层
  while (result.some(Array.isArray)) {
    result = [].concat(...result);
  }
  return result;
}

console.log(flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]
```

## 方式四：toString / join（仅适用于数字或字符串数组）

```js
function flatten(arr) {
  return arr
    .toString()
    .split(',')
    .map((item) => +item);
}

console.log(flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]
```

## 方式五：ES2019 flat（原生 API）

```js
// flat(depth)，depth 默认为 1，Infinity 表示全部拍平
console.log([1, [2, [3, [4]]]].flat()); // [1, 2, [3, [4]]]
console.log([1, [2, [3, [4]]]].flat(Infinity)); // [1, 2, 3, 4]
```

## 方式六：Generator 生成器

```js
function* flattenGenerator(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flattenGenerator(item); // 委托给子生成器
    } else {
      yield item;
    }
  }
}

console.log([...flattenGenerator([1, [2, [3, [4]]]])]); // [1, 2, 3, 4]
```

## 扩展：支持指定拍平深度

```js
function flatten(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((prev, cur) => prev.concat(Array.isArray(cur) ? flatten(cur, depth - 1) : cur), [])
    : arr.slice();
}

console.log(flatten([1, [2, [3, [4]]]], 1)); // [1, 2, [3, [4]]]
console.log(flatten([1, [2, [3, [4]]]], 2)); // [1, 2, 3, [4]]
console.log(flatten([1, [2, [3, [4]]]], Infinity)); // [1, 2, 3, 4]
```
