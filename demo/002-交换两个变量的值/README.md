# 002 - 交换两个变量的值（不使用临时变量）

## 方式一：数组解构赋值（ES6，推荐）

```js
let a = 1;
let b = 2;

[a, b] = [b, a];

console.log(a); // 2
console.log(b); // 1
```

## 方式二：算术运算（仅适用于数字）

```js
let a = 1;
let b = 2;

a = a + b; // 3
b = a - b; // 3 - 2 = 1
a = a - b; // 3 - 1 = 2

console.log(a); // 2
console.log(b); // 1
```

## 方式三：异或运算（仅适用于整数）

```js
let a = 1; // 01
let b = 2; // 10

a = a ^ b; // 11 -> 3
b = a ^ b; // 11 ^ 10 = 01 -> 1
a = a ^ b; // 11 ^ 01 = 10 -> 2

console.log(a); // 2
console.log(b); // 1
```

## 方式四：利用对象

```js
let a = 1;
let b = 2;

a = { a: b, b: a };
b = a.b;
a = a.a;

console.log(a); // 2
console.log(b); // 1
```
