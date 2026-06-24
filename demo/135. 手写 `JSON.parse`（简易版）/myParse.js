/**
 * 手写 JSON.parse（简易版）
 *
 * 作用：
 *   - 将 JSON 字符串解析为 JavaScript 值
 *
 * 实现思路（两种常见方案）：
 *   方案1：用 new Function('return ' + str) —— 简单但有安全风险（不推荐生产）
 *   方案2：手写递归下降解析器 —— 安全、能体现原理
 *
 * 本实现采用方案2：递归下降解析器
 *   - 维护一个位置指针 index
 *   - 跳过空白字符
 *   - 根据当前字符判断解析：{ 对象, [ 数组, " 字符串, t/f 布尔, n null, 数字
 *
 * 支持类型：对象、数组、字符串、数字、布尔、null
 */

function myParse(json) {
  if (typeof json !== "string") {
    throw new TypeError("JSON.parse expects a string");
  }

  let index = 0;
  const str = json;

  function skipWhitespace() {
    while (index < str.length) {
      const ch = str[index];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        index++;
      } else {
        break;
      }
    }
  }

  function parseValue() {
    skipWhitespace();
    if (index >= str.length) {
      throw new SyntaxError("Unexpected end of JSON input");
    }
    const ch = str[index];
    if (ch === "{") return parseObject();
    if (ch === "[") return parseArray();
    if (ch === '"') return parseString();
    if (ch === "t" || ch === "f") return parseBoolean();
    if (ch === "n") return parseNull();
    return parseNumber();
  }

  function parseObject() {
    const obj = {};
    index++; // 跳过 '{'
    skipWhitespace();
    if (str[index] === "}") {
      index++;
      return obj;
    }
    while (true) {
      skipWhitespace();
      if (str[index] !== '"') {
        throw new SyntaxError("Expected string key in object");
      }
      const key = parseString();
      skipWhitespace();
      if (str[index] !== ":") {
        throw new SyntaxError("Expected ':' after key");
      }
      index++; // 跳过 ':'
      const value = parseValue();
      obj[key] = value;
      skipWhitespace();
      if (str[index] === ",") {
        index++;
        continue;
      } else if (str[index] === "}") {
        index++;
        break;
      } else {
        throw new SyntaxError("Expected ',' or '}' in object");
      }
    }
    return obj;
  }

  function parseArray() {
    const arr = [];
    index++; // 跳过 '['
    skipWhitespace();
    if (str[index] === "]") {
      index++;
      return arr;
    }
    while (true) {
      const value = parseValue();
      arr.push(value);
      skipWhitespace();
      if (str[index] === ",") {
        index++;
        continue;
      } else if (str[index] === "]") {
        index++;
        break;
      } else {
        throw new SyntaxError("Expected ',' or ']' in array");
      }
    }
    return arr;
  }

  function parseString() {
    let result = "";
    index++; // 跳过开头的 '"'
    while (index < str.length && str[index] !== '"') {
      const ch = str[index];
      if (ch === "\\") {
        index++;
        const esc = str[index];
        switch (esc) {
          case '"': result += '"'; break;
          case "\\": result += "\\"; break;
          case "/": result += "/"; break;
          case "n": result += "\n"; break;
          case "r": result += "\r"; break;
          case "t": result += "\t"; break;
          case "b": result += "\b"; break;
          case "f": result += "\f"; break;
          case "u":
            const hex = str.slice(index + 1, index + 5);
            result += String.fromCharCode(parseInt(hex, 16));
            index += 4;
            break;
          default:
            throw new SyntaxError("Invalid escape: \\" + esc);
        }
        index++;
      } else {
        result += ch;
        index++;
      }
    }
    if (index >= str.length) {
      throw new SyntaxError("Unterminated string");
    }
    index++; // 跳过结尾的 '"'
    return result;
  }

  function parseNumber() {
    const start = index;
    if (str[index] === "-") index++;
    while (index < str.length && /[0-9]/.test(str[index])) index++;
    if (str[index] === ".") {
      index++;
      while (index < str.length && /[0-9]/.test(str[index])) index++;
    }
    if (str[index] === "e" || str[index] === "E") {
      index++;
      if (str[index] === "+" || str[index] === "-") index++;
      while (index < str.length && /[0-9]/.test(str[index])) index++;
    }
    const numStr = str.slice(start, index);
    if (numStr === "" || numStr === "-") {
      throw new SyntaxError("Invalid number");
    }
    return Number(numStr);
  }

  function parseBoolean() {
    if (str.slice(index, index + 4) === "true") {
      index += 4;
      return true;
    }
    if (str.slice(index, index + 5) === "false") {
      index += 5;
      return false;
    }
    throw new SyntaxError("Invalid boolean");
  }

  function parseNull() {
    if (str.slice(index, index + 4) === "null") {
      index += 4;
      return null;
    }
    throw new SyntaxError("Invalid null");
  }

  const result = parseValue();
  skipWhitespace();
  if (index < str.length) {
    throw new SyntaxError("Unexpected token after JSON");
  }
  return result;
}

// ===== 测试 =====

console.log(myParse("123")); // 123
console.log(myParse('"hello"')); // 'hello'
console.log(myParse("true")); // true
console.log(myParse("false")); // false
console.log(myParse("null")); // null

console.log(myParse('{"a":1,"b":"hi"}')); // { a: 1, b: 'hi' }
console.log(myParse("[1,2,3]")); // [1, 2, 3]
console.log(myParse('{"nested":{"arr":[1,"x",true]}}'));
// { nested: { arr: [1, 'x', true] } }

// 负数与小数与科学计数法
console.log(myParse("-3.14")); // -3.14
console.log(myParse("1.5e3")); // 1500

// 转义字符
console.log(myParse('"a\\nb\\t\\"c"')); // 'a\nb\t"c'
console.log(myParse('"\\u4e2d\\u6587"')); // '中文'

// 空白字符容忍
console.log(myParse('  { "a" : 1 }  ')); // { a: 1 }

// 空对象 / 空数组
console.log(myParse("{}")); // {}
console.log(myParse("[]")); // []

// 与原生对比
const jsonStr = '{"name":"Tom","age":20,"scores":[90,85],"pass":true}';
console.log(JSON.stringify(myParse(jsonStr)) === jsonStr); // true

// 错误处理
try {
  myParse("{a:1}"); // key 未加引号
} catch (e) {
  console.log("解析错误:", e instanceof SyntaxError); // true
}
