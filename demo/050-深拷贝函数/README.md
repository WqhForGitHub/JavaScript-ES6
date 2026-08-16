# 050 - 手写深拷贝函数

## 基础版：递归（仅处理对象和数组）

```js
function deepClone(target) {
  if (typeof target !== 'object' || target === null) {
    return target; // 基本类型直接返回
  }

  const clone = Array.isArray(target) ? [] : {};
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      clone[key] = deepClone(target[key]); // 递归拷贝
    }
  }
  return clone;
}

const obj = { a: 1, b: { c: 2 } };
const copy = deepClone(obj);
copy.b.c = 99;
console.log(obj.b.c); // 2，原对象不受影响
```

> 缺点：无法处理循环引用（栈溢出）、Date、RegExp、Map、Set、Symbol 等。

## 完整版：处理各种类型 + 循环引用（WeakMap）

```js
function deepClone(target, map = new WeakMap()) {
  // 1. 基本类型与函数直接返回（函数无重新拷贝意义）
  if (target === null || typeof target !== 'object') {
    return target;
  }

  // 2. Date / RegExp
  if (target instanceof Date) return new Date(target);
  if (target instanceof RegExp) return new RegExp(target.source, target.flags);

  // 3. 循环引用检查：已拷贝过直接返回缓存
  if (map.has(target)) {
    return map.get(target);
  }

  // 4. Map / Set
  if (target instanceof Map) {
    const cloneMap = new Map();
    map.set(target, cloneMap);
    target.forEach((value, key) => {
      cloneMap.set(deepClone(key, map), deepClone(value, map));
    });
    return cloneMap;
  }
  if (target instanceof Set) {
    const cloneSet = new Set();
    map.set(target, cloneSet);
    target.forEach((value) => {
      cloneSet.add(deepClone(value, map));
    });
    return cloneSet;
  }

  // 5. 普通对象 / 数组（含 Symbol 键）
  const clone = Array.isArray(target) ? [] : {};
  map.set(target, clone); // 先缓存再递归，防止循环引用死循环

  // string 键 + Symbol 键
  const keys = [...Object.keys(target), ...Object.getOwnPropertySymbols(target)];
  for (const key of keys) {
    clone[key] = deepClone(target[key], map);
  }

  return clone;
}
```

## 测试

```js
const sym = Symbol('id');
const obj = {
  num: 1,
  str: 'hello',
  date: new Date('2026-01-01'),
  reg: /abc/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nested: { a: [1, 2, { b: 3 }] },
  [sym]: 'symbol值',
  fn: function () {
    return '函数';
  },
};

// 循环引用
obj.self = obj;

const copy = deepClone(obj);

console.log(copy.num); // 1
console.log(copy.date instanceof Date); // true
console.log(copy.reg); // /abc/gi
console.log(copy.map.get('key')); // value
console.log(copy.set.has(2)); // true
console.log(copy[sym]); // symbol值
console.log(copy.self === copy); // true（循环引用正确处理）
console.log(copy.self === obj); // false（不是原对象）

// 修改拷贝不影响原对象
copy.nested.a[2].b = 99;
console.log(obj.nested.a[2].b); // 3
```

## 其他实现方式

```js
// 1. JSON（简单但功能受限）：不支持 undefined、函数、Symbol、循环引用、Date 变字符串、RegExp 变空对象
const copy1 = JSON.parse(JSON.stringify(obj));

// 2. structuredClone（原生 API，支持循环引用/Date/Map/Set，不支持函数和 Symbol）
const copy2 = structuredClone(obj);
```
