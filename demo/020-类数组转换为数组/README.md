# 020 - 类数组对象转换为数组

> 类数组对象：具有 `length` 属性和索引，但没有数组原型方法的对象。
> 常见的有：`arguments`、DOM 的 `NodeList`、`HTMLCollection`。

```js
// 一个典型的类数组对象
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
```

## 方式一：Array.from（ES6，推荐）

```js
const arr = Array.from(arrayLike);
console.log(arr); // ['a', 'b', 'c']

// 可同时进行 map 处理
const arr2 = Array.from(arrayLike, (item) => item.toUpperCase());
console.log(arr2); // ['A', 'B', 'C']
```

## 方式二：扩展运算符（仅适用于可迭代对象，如 NodeList、arguments）

```js
function fn() {
  const args = [...arguments];
  console.log(args); // [1, 2, 3]
}
fn(1, 2, 3);

// document.querySelectorAll('div') 返回的 NodeList 可迭代，也可直接展开
// const divs = [...document.querySelectorAll('div')];
```

> 注意：普通对象形式的类数组（如上面的 `arrayLike`）不可迭代，无法使用扩展运算符。

## 方式三：Array.prototype.slice.call

```js
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr); // ['a', 'b', 'c']

// 简写形式（借用数组的 slice 方法）
const arr2 = [].slice.call(arrayLike);
```

## 方式四：手动循环

```js
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0; i < arrayLike.length; i++) {
    arr.push(arrayLike[i]);
  }
  return arr;
}

console.log(toArray(arrayLike)); // ['a', 'b', 'c']
```

## 验证转换结果

```js
const arr = Array.from(arrayLike);
console.log(Array.isArray(arr)); // true
console.log(arr instanceof Array); // true

const notArr = Array.isArray(arrayLike);
console.log(notArr); // false 类数组不是真正的数组
```
