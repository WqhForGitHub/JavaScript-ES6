# 032 - 数组去重

## 方式一：Set + 扩展运算符（ES6，推荐）

```js
function unique(arr) {
  return [...new Set(arr)];
}

console.log(unique([1, 2, 2, 3, 3, 3])); // [1, 2, 3]
console.log(unique(['a', 'b', 'a', NaN, NaN])); // ['a', 'b', NaN]
```

> Set 认为NaN 与 NaN 相等，因此可以去掉重复的 NaN（与 === 行为不同）。

## 方式二：Array.from + Set

```js
const unique = (arr) => Array.from(new Set(arr));

console.log(unique([1, 1, 2, 3])); // [1, 2, 3]
```

## 方式三：filter + indexOf

```js
function unique(arr) {
  return arr.filter((item, index) => {
    // indexOf 返回第一个出现的位置，只有第一次出现时才保留
    return arr.indexOf(item) === index;
  });
}

console.log(unique([1, 2, 2, 3, 1])); // [1, 2, 3]
```

> 注意：`indexOf` 内部使用严格相等（===），无法去重 NaN。

## 方式四：Map / includes + 循环（可去重 NaN）

```js
function unique(arr) {
  const result = [];
  arr.forEach((item) => {
    if (!result.includes(item)) {
      result.push(item);
    }
  });
  return result;
}

console.log(unique([1, 2, 2, NaN, NaN])); // [1, 2, NaN]
```

## 方式五：reduce

```js
function unique(arr) {
  return arr.reduce((prev, cur) => (prev.includes(cur) ? prev : [...prev, cur]), []);
}

console.log(unique([1, 2, 2, 3, 3])); // [1, 2, 3]
```

## 方式六：双循环（ splice，ES5 面试手写）

```js
function unique(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1); // 删除重复元素
        j--; // 删除后下标回退
      }
    }
  }
  return arr;
}

console.log(unique([1, 2, 2, 3, 1])); // [1, 2, 3]
```

## 扩展：对象数组按某个字段去重

```js
function uniqueBy(arr, key) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 1, name: '张三' },
];

console.log(uniqueBy(users, 'id'));
// [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
```
