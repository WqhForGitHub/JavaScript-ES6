# 011 - 手写字符串的 repeat 方法

> `str.repeat(n)`：返回一个新字符串，表示将原字符串重复 n 次。

## 方式一：循环拼接

```js
String.prototype.myRepeat = function (count) {
  if (count < 0 || count === Infinity) {
    throw new RangeError('Invalid count value');
  }
  count = Math.floor(count); // 小数会被向下取整
  if (count === 0) return '';

  let result = '';
  for (let i = 0; i < count; i++) {
    result += this;
  }
  return result;
};

console.log('abc'.myRepeat(3)); // abcabcabc
console.log('ab'.myRepeat(0)); // ''
```

## 方式二：递归

```js
String.prototype.myRepeat = function (count) {
  count = Math.floor(count);
  if (count < 0) throw new RangeError('Invalid count value');
  if (count === 0) return '';
  if (count === 1) return this;
  // 折半递归，减少拼接次数
  return count % 2 === 0
    ? this.myRepeat(count / 2) + this.myRepeat(count / 2)
    : this + this.myRepeat(count - 1);
};

console.log('ab'.myRepeat(4)); // abababab
```

## 方式三：Array.join

```js
String.prototype.myRepeat = function (count) {
  count = Math.floor(count);
  if (count < 0) throw new RangeError('Invalid count value');
  return new Array(count + 1).join(this);
};

console.log('-'.myRepeat(20)); // --------------------
```

## 原生对照

```js
console.log('abc'.repeat(3)); // abcabcabc
console.log('ab'.repeat(2.9)); // abab（小数向下取整）
```
