# 012 - 字符串翻转

## 方式一：split + reverse + join（最常用）

```js
function reverseString(str) {
  return str.split('').reverse().join('');
}

console.log(reverseString('hello')); // olleh
```

## 方式二：for 循环倒序拼接

```js
function reverseString(str) {
  let result = '';
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

console.log(reverseString('hello')); // olleh
```

## 方式三：reduce

```js
function reverseString(str) {
  return str.split('').reduce((prev, cur) => cur + prev, '');
}

console.log(reverseString('hello')); // olleh
```

## 方式四：递归

```js
function reverseString(str) {
  if (str === '') return '';
  return reverseString(str.slice(1)) + str[0];
}

console.log(reverseString('hello')); // olleh
```

## 扩展：单词翻转（保留单词内部顺序）

```js
// 'I am a student.' -> 'student. a am I'
function reverseWords(str) {
  return str.split(' ').reverse().join(' ');
}

console.log(reverseWords('I am a student.')); // student. a am I
```

## 扩展：包含 Unicode 代理对的翻转

> `split('')` 会把 emoji 等 UTF-16 代理对拆散，可用扩展运算符处理：

```js
function reverseString(str) {
  return [...str].reverse().join('');
}

console.log(reverseString('a😀b')); // b😀a
```
