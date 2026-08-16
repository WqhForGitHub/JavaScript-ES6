# 043 - 数字每千分位加逗号（1000 -> 1,000）

## 方式一：正则替换（推荐）

```js
function formatNumber(num) {
  // \B：非单词边界，确保不是开头
  // (?=)：正向先行断言，后面每 3 位数字一组（直至小数点或末尾）
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

console.log(formatNumber(1000)); // 1,000
console.log(formatNumber(1000000)); // 1,000,000
console.log(formatNumber(123456789)); // 123,456,789
console.log(formatNumber(123)); // 123（不足千位不加）
```

## 方式二：正则（支持小数）

```js
function formatNumber(num) {
  const [intPart, decimalPart] = String(num).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimalPart !== undefined
    ? `${formattedInt}.${decimalPart}`
    : formattedInt;
}

console.log(formatNumber(1234567.89)); // 1,234,567.89
console.log(formatNumber(1234.5)); // 1,234.5
```

## 方式三：toLocaleString（原生 API，最简单）

```js
console.log((1000).toLocaleString('en-US')); // 1,000
console.log((123456789.123).toLocaleString('en-US')); // 123,456,789.123
console.log((123456789).toLocaleString('zh-CN')); // 123,456,789
```

## 方式四：取余循环

```js
function formatNumber(num) {
  let [intPart, decimalPart] = String(num).split('.');
  let result = '';
  let count = 0;

  // 从末位往前遍历整数部分
  for (let i = intPart.length - 1; i >= 0; i--) {
    result = intPart[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = ',' + result;
    }
  }

  return decimalPart !== undefined ? `${result}.${decimalPart}` : result;
}

console.log(formatNumber(1234567890)); // 1,234,567,890
console.log(formatNumber(9876543.21)); // 9,876,543.21
```

## 方式五：递归

```js
function formatNumber(num) {
  const [intPart, decimalPart] = String(num).split('.');
  if (intPart.length <= 3) {
    return decimalPart !== undefined
      ? `${intPart}.${decimalPart}`
      : intPart;
  }
  // 取出末三位，前面的部分递归处理
  const rest = formatNumber(intPart.slice(0, -3));
  const last3 = intPart.slice(-3);
  const int = `${rest},${last3}`;
  return decimalPart !== undefined ? `${int}.${decimalPart}` : int;
}

console.log(formatNumber(12345678)); // 12,345,678
```

## 扩展：还原为数字

```js
function parseNumber(str) {
  return Number(str.replace(/,/g, ''));
}

console.log(parseNumber('1,234,567.89')); // 1234567.89
```
