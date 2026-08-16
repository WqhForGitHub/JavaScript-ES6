# 049 - 手写 JSON.parse

## 方式一：new Function（模拟 eval，需先校验）

> `eval` 与 `new Function` 都能执行 JS 表达式。直接执行任意字符串有 XSS 风险，
> 必须先校验字符串是合法的 JSON（不含函数调用、表达式等）。

```js
function myParse(jsonStr) {
  // 1. 校验字符串是否为合法 JSON（防御性检查）
  if (!/^[\],:{}\s]*$/.test(
    jsonStr
      .replace(/\\["\\\/bfnrtu]/g, '@') // 转义字符
      .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']') // 字面量
      .replace(/(?:^|:|,)(?:\s*\[)+/g, '') // 数组
  )) {
    throw new SyntaxError('Unexpected token in JSON');
  }

  // 2. 通过 Function 构造器执行（比 eval 略安全：不污染当前作用域）
  return new Function('return (' + jsonStr + ')')();
}

// 测试
console.log(myParse('{"a":1,"b":[1,2,3]}')); // { a: 1, b: [1, 2, 3] }
console.log(myParse('[1, "two", true, null]')); // [1, 'two', true, null]
console.log(myParse('"hello"')); // hello
console.log(myParse('123')); // 123
```

## 方式二：递归下降解析器（完整实现原理）

> 真正的 JSON.parse 是手写解析器：逐字符扫描，根据 JSON 语法生成对应的 JS 值。

```js
function myParse(jsonStr) {
  let index = 0; // 当前扫描位置

  // 跳过空白字符
  function skipWhitespace() {
    while (
      index < jsonStr.length &&
      /[\s]/.test(jsonStr[index])
    ) {
      index++;
    }
  }

  function parseValue() {
    skipWhitespace();
    const ch = jsonStr[index];

    if (ch === '{') return parseObject();
    if (ch === '[') return parseArray();
    if (ch === '"') return parseString();
    if (ch === 't') return parseLiteral('true', true);
    if (ch === 'f') return parseLiteral('false', false);
    if (ch === 'n') return parseLiteral('null', null);
    return parseNumber();
  }

  function parseObject() {
    const obj = {};
    index++; // 跳过 '{'
    skipWhitespace();

    if (jsonStr[index] === '}') {
      index++;
      return obj; // 空对象
    }

    while (true) {
      skipWhitespace();
      const key = parseString(); // key 必须是字符串
      skipWhitespace();
      expect(':'); // 冒号
      const value = parseValue();
      obj[key] = value;
      skipWhitespace();

      if (jsonStr[index] === ',') {
        index++; // 继续下一对
      } else if (jsonStr[index] === '}') {
        index++; // 对象结束
        return obj;
      } else {
        throw new SyntaxError('Unexpected token in object');
      }
    }
  }

  function parseArray() {
    const arr = [];
    index++; // 跳过 '['
    skipWhitespace();

    if (jsonStr[index] === ']') {
      index++;
      return arr; // 空数组
    }

    while (true) {
      const value = parseValue();
      arr.push(value);
      skipWhitespace();

      if (jsonStr[index] === ',') {
        index++;
      } else if (jsonStr[index] === ']') {
        index++;
        return arr;
      } else {
        throw new SyntaxError('Unexpected token in array');
      }
    }
  }

  function parseString() {
    expect('"');
    let result = '';

    while (index < jsonStr.length) {
      const ch = jsonStr[index];
      if (ch === '"') {
        index++;
        return result;
      }
      if (ch === '\\') {
        index++;
        result += parseEscape();
      } else {
        result += ch;
        index++;
      }
    }
    throw new SyntaxError('Unterminated string');
  }

  function parseEscape() {
    const escapeMap = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
    };
    const ch = jsonStr[index];
    if (escapeMap[ch]) {
      index++;
      return escapeMap[ch];
    }
    if (ch === 'u') {
      // \uXXXX 四位十六进制
      const hex = jsonStr.slice(index + 1, index + 5);
      if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
        throw new SyntaxError('Invalid Unicode escape');
      }
      index += 5;
      return String.fromCharCode(parseInt(hex, 16));
    }
    throw new SyntaxError('Invalid escape character');
  }

  function parseNumber() {
    const match = jsonStr.slice(index).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (!match) throw new SyntaxError('Invalid number');
    index += match[0].length;
    return Number(match[0]);
  }

  function parseLiteral(literal, value) {
    if (jsonStr.slice(index, index + literal.length) === literal) {
      index += literal.length;
      return value;
    }
    throw new SyntaxError(`Invalid literal: ${literal}`);
  }

  function expect(ch) {
    if (jsonStr[index] !== ch) {
      throw new SyntaxError(`Expected '${ch}'`);
    }
    index++;
  }

  const result = parseValue();
  skipWhitespace();
  if (index !== jsonStr.length) {
    throw new SyntaxError('Unexpected trailing characters');
  }
  return result;
}

// 测试
console.log(myParse('{"name":"张三","age":18,"tags":["a","b"]}'));
// { name: '张三', age: 18, tags: ['a', 'b'] }
console.log(myParse('[1,2.5,-3e2]')); // [1, 2.5, -300]
console.log(myParse('"a\\nb\\u4e2d"')); // 'a\nb中'（先输出换行再输出「中」）
console.log(myParse('true')); // true
console.log(myParse('{}')); // {}
console.log(myParse('[]')); // []
```
