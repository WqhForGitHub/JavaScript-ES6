# 038 - 手写类型判断函数（模拟 typeof）

## 原生 typeof 的结果

| 输入                     | 结果                               |
| ------------------------ | ---------------------------------- |
| `1`, `NaN`, `Infinity`   | `'number'`                         |
| `'abc'`                  | `'string'`                         |
| `true`                   | `'boolean'`                        |
| `undefined`              | `'undefined'`                      |
| `null`                   | `'object'`（历史 bug，需特殊处理） |
| `function(){}`           | `'function'`                       |
| `[]`, `{}`, `new Date()` | `'object'`                         |

## 实现：用 Object.prototype.toString 模拟

```js
function myTypeof(value) {
  // 1. null 需要单独处理（typeof null === 'object' 是历史遗留）
  if (value === null) return 'object';

  // 2. typeof 只对 function 和 基本类型（除 null）准确
  const type = typeof value;
  if (type !== 'object') return type; // number/string/boolean/undefined/function

  // 3. 其余对象类型，原生 typeof 一律返回 'object'
  return 'object';
}
```

上面的实现已经和 `typeof` 行为一致，但面试通常更想要**增强版**：
能进一步区分数组、日期等，这里用 `Object.prototype.toString` 实现：

## 增强：万能类型判断函数（区分具体对象类型）

```js
function getType(value) {
  // null 和 undefined 直接返回
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;
  if (type !== 'object') return type; // number/string/boolean/function/symbol/bigint

  // 对象类型：借助 Object.prototype.toString
  // 格式：'[object Array]' -> 'array'
  const tag = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  return tag;
}

console.log(getType(1)); // number
console.log(getType('abc')); // string
console.log(getType(true)); // boolean
console.log(getType(undefined)); // undefined
console.log(getType(null)); // null
console.log(getType(() => {})); // function
console.log(getType([])); // array
console.log(getType({})); // object
console.log(getType(new Date())); // date
console.log(getType(/abc/)); // regexp
console.log(getType(new Map())); // map
console.log(getType(new Set())); // set
console.log(getType(Symbol())); // symbol
console.log(getType(10n)); // bigint
console.log(getType(document)); // htmldocument（环境相关）
```

## 对比验证 myTypeof 与原生 typeof

```js
console.log(myTypeof(1) === typeof 1); // true
console.log(myTypeof(null) === typeof null); // true（都是 'object'）
console.log(myTypeof([]) === typeof []); // true（都是 'object'）
console.log(myTypeof(() => {}) === typeof (() => {})); // true
```

> 面试建议：先写 `myTypeof`（与 typeof 完全一致），
> 再补充 `getType`（利用 `Object.prototype.toString.call`）区分具体类型。
