# 048 - 手写 JSON.stringify

## 原生规则回顾

| 值类型 | 转换结果 |
| ------ | -------- |
| `undefined` / `function` / `symbol` | 作为对象属性值时被**忽略**；作为数组元素转为 `null`；单独转换返回 `undefined` |
| `null` / `number` / `boolean` | 原样输出（NaN/Infinity -> null） |
| `string` | 加双引号，转义特殊字符 |
| `Array` | 递归序列化，无效元素转为 `null` |
| `Object` | 递归序列化，忽略无效属性值 |
| `Date` | 调用 toJSON，输出时间字符串 |
| `RegExp` | `{}`（空对象字面量） |
| 循环引用 | 抛出 TypeError |

## 代码实现

```js
function myStringify(value) {
  // 输出缓冲 + 存储已处理对象（检测循环引用）
  const seen = new WeakSet();

  function serialize(val) {
    // 1. null 与基本类型
    if (val === null) return 'null';
    const type = typeof val;

    if (type === 'number') {
      // NaN 和 Infinity 转为 null（与原生一致）
      return isFinite(val) ? String(val) : 'null';
    }
    if (type === 'boolean') return String(val);
    if (type === 'string') return quoteString(val);

    // 2. undefined / function / symbol
    if (type === 'undefined' || type === 'function' || type === 'symbol') {
      return undefined; // 由调用处决定忽略或转 null
    }
    if (type === 'bigint') {
      throw new TypeError('Do not know how to serialize a BigInt');
    }

    // 3. 有 toJSON 的对象（Date 等）
    if (typeof val.toJSON === 'function') {
      return serialize(val.toJSON());
    }

    // 4. 引用类型
    if (Array.isArray(val)) {
      return serializeArray(val);
    }
    if (val instanceof Object) {
      return serializeObject(val);
    }
    return undefined;
  }

  // 字符串加引号 + 转义
  function quoteString(str) {
    const escapeMap = {
      '"': '\\"',
      '\\': '\\\\',
      '\b': '\\b',
      '\f': '\\f',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
    };
    const escaped = str.replace(
      /["\\\b\f\n\r\t]/g,
      (ch) => escapeMap[ch]
    );
    return `"${escaped}"`;
  }

  function serializeArray(arr) {
    if (seen.has(arr)) throw new TypeError('Converting circular structure to JSON');
    seen.add(arr);

    const items = arr.map((item) => {
      const result = serialize(item);
      return result === undefined ? 'null' : result; // 无效元素转 null
    });

    seen.delete(arr);
    return `[${items.join(',')}]`;
  }

  function serializeObject(obj) {
    if (seen.has(obj)) throw new TypeError('Converting circular structure to JSON');
    seen.add(obj);

    const keys = Object.keys(obj); // 只处理自有可枚举属性
    const items = keys.reduce((acc, key) => {
      const result = serialize(obj[key]);
      if (result === undefined) return acc; // 忽略无效属性
      acc.push(`${serialize(key)}:${result}`);
      return acc;
    }, []);

    seen.delete(obj);
    return `{${items.join(',')}}`;
  }

  return serialize(value);
}
```

## 测试

```js
console.log(myStringify(1)); // 1
console.log(myStringify('abc')); // "abc"
console.log(myStringify(true)); // true
console.log(myStringify(null)); // null
console.log(myStringify(undefined)); // undefined
console.log(myStringify(NaN)); // null

console.log(myStringify([1, 'a', null])); // [1,"a",null]
console.log(myStringify([1, undefined, function () {}, 4])); // [1,null,null,4]

console.log(myStringify({ a: 1, b: 'x', c: null })); // {"a":1,"b":"x","c":null}
console.log(myStringify({ a: undefined, b: function () {}, c: Symbol() })); // {}
console.log(myStringify({ a: { b: [1, 2] } })); // {"a":{"b":[1,2]}}

console.log(myStringify(new Date('2026-01-01T00:00:00Z'))); // "2026-01-01T00:00:00.000Z"
console.log(myStringify(/abc/)); // {}

// 循环引用
const obj = { name: '循环' };
obj.self = obj;
console.log(myStringify(obj)); // TypeError: Converting circular structure to JSON

// 与原生结果对比
console.log(JSON.stringify({ a: { b: [1, 2] } }) === myStringify({ a: { b: [1, 2] } })); // true
```
