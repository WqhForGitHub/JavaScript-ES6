# 022 - 非负大整数相加

> JavaScript 中 `Number.MAX_SAFE_INTEGER` 为 `2^53 - 1`，超出后精度丢失。
> 大数相加的思路：把数字转为**字符串**，从低位到高位逐位相加，处理进位。

## 代码实现

```js
function bigNumberAdd(a, b) {
  // 转为字符串并倒序（从个位开始计算）
  const numA = String(a).split('').reverse();
  const numB = String(b).split('').reverse();
  const result = [];
  let carry = 0; // 进位
  let i = 0;

  const len = Math.max(numA.length, numB.length);

  while (i < len || carry !== 0) {
    const digitA = i < numA.length ? +numA[i] : 0;
    const digitB = i < numB.length ? +numB[i] : 0;
    const sum = digitA + digitB + carry;

    carry = Math.floor(sum / 10); // 进位
    result.push(sum % 10);        // 当前位
    i++;
  }

  return result.reverse().join('');
}

// 测试
console.log(bigNumberAdd('123', '456')); // 579
console.log(bigNumberAdd('999', '1')); // 1000
console.log(bigNumberAdd('9007199254740993', '123456789')); // 9007200509321782
console.log(
  bigNumberAdd(
    '123456789012345678901234567890',
    '987654321098765432109876543210'
  )
); // 1111111110111111111011111111100
```

## 验证精度丢失问题

```js
// 直接用 Number 相加会丢失精度
console.log(9007199254740993 + 123456789); // 9007200509321781（错误）
console.log(bigNumberAdd('9007199254740993', '123456789')); // 9007200509321782（正确）
```

## 进阶：支持负数（先比较再运算）

```js
function compare(a, b) {
  // 比较两个非负数字符串的大小
  if (a.length !== b.length) return a.length > b.length ? 1 : -1;
  return a > b ? 1 : a < b ? -1 : 0;
}

function bigSubtract(a, b) {
  // 保证 a >= b 的减法
  const numA = a.split('').reverse();
  const numB = b.split('').reverse();
  const result = [];
  let borrow = 0;
  for (let i = 0; i < numA.length; i++) {
    let diff = +numA[i] - (+numB[i] || 0) - borrow;
    if (diff < 0) {
      diff += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result.push(diff);
  }
  return result.reverse().join('').replace(/^0+/, '') || '0';
}

function bigAdd(a, b) {
  const negA = a.startsWith('-');
  const negB = b.startsWith('-');
  a = a.replace(/^-/, '');
  b = b.replace(/^-/, '');

  if (!negA && !negB) return bigNumberAdd(a, b);
  if (negA && negB) return '-' + bigNumberAdd(a, b);
  // 一正一负：转为减法
  if (negA) [a, b] = [b, a]; // 保证 a 是正数，b 是负数
  const cmp = compare(a, b);
  if (cmp === 0) return '0';
  if (cmp > 0) return bigSubtract(a, b);
  return '-' + bigSubtract(b, a);
}

console.log(bigAdd('-100', '35')); // -65
console.log(bigAdd('35', '-100')); // -65
console.log(bigAdd('-35', '100')); // 65
```

> 实际项目中推荐直接使用 ES2020 的 `BigInt`：`123n + 456n`。
