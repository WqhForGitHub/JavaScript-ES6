/**
 * 手写简易 JSON 解析器
 *
 * 将 JSON 字符串解析为 JavaScript 对象/值，支持：
 *   - 对象 { "key": value, ... }
 *   - 数组 [ value, ... ]
 *   - 字符串（含转义字符）
 *   - 数字（含负数、小数、指数）
 *   - true / false / null
 *
 * 实现思路（递归下降）：
 * 1. 维护指针 pos，逐字符扫描。
 * 2. skipWhitespace 跳过空白。
 * 3. parseValue 根据 peek 到的首字符分派到具体解析函数。
 * 4. parseString 解析带转义的双引号字符串。
 * 5. parseNumber 解析数字字面量。
 * 6. parseObject / parseArray 递归解析容器。
 *
 * @param {string} text - JSON 字符串
 * @returns {*} 解析后的值
 */
function jsonParser(text) {
  let pos = 0;

  function skipWhitespace() {
    while (pos < text.length && /\s/.test(text[pos])) pos++;
  }

  function peek() {
    skipWhitespace();
    return text[pos];
  }

  function expect(ch) {
    skipWhitespace();
    if (text[pos] !== ch)
      throw new SyntaxError(`期望 '${ch}'，实际得到 '${text[pos]}'`);
    pos++;
  }

  function parseValue() {
    const ch = peek();
    if (ch === "{") return parseObject();
    if (ch === "[") return parseArray();
    if (ch === '"') return parseString();
    if (ch === "-" || (ch >= "0" && ch <= "9")) return parseNumber();
    if (text.startsWith("true", pos)) {
      pos += 4;
      return true;
    }
    if (text.startsWith("false", pos)) {
      pos += 5;
      return false;
    }
    if (text.startsWith("null", pos)) {
      pos += 4;
      return null;
    }
    throw new SyntaxError(`意外的字符: ${ch}`);
  }

  function parseString() {
    expect('"');
    let str = "";
    while (pos < text.length && text[pos] !== '"') {
      if (text[pos] === "\\") {
        pos++;
        const esc = text[pos];
        const escapes = {
          '"': '"',
          "\\": "\\",
          "/": "/",
          b: "\b",
          f: "\f",
          n: "\n",
          r: "\r",
          t: "\t",
        };
        if (escapes[esc] !== undefined) {
          str += escapes[esc];
        } else if (esc === "u") {
          str += String.fromCharCode(
            parseInt(text.slice(pos + 1, pos + 5), 16),
          );
          pos += 4;
        } else {
          throw new SyntaxError(`无效的转义字符: \\${esc}`);
        }
        pos++;
      } else {
        str += text[pos++];
      }
    }
    expect('"');
    return str;
  }

  function parseNumber() {
    skipWhitespace();
    const start = pos;
    if (text[pos] === "-") pos++;
    while (pos < text.length && /[0-9]/.test(text[pos])) pos++;
    if (text[pos] === ".") {
      pos++;
      while (pos < text.length && /[0-9]/.test(text[pos])) pos++;
    }
    if (text[pos] === "e" || text[pos] === "E") {
      pos++;
      if (text[pos] === "+" || text[pos] === "-") pos++;
      while (pos < text.length && /[0-9]/.test(text[pos])) pos++;
    }
    return parseFloat(text.slice(start, pos));
  }

  function parseObject() {
    expect("{");
    const obj = {};
    skipWhitespace();
    if (peek() === "}") {
      pos++;
      return obj;
    }
    while (true) {
      const key = parseString();
      expect(":");
      obj[key] = parseValue();
      skipWhitespace();
      if (text[pos] === ",") {
        pos++;
        continue;
      }
      if (text[pos] === "}") {
        pos++;
        break;
      }
      throw new SyntaxError("期望 ',' 或 '}'");
    }
    return obj;
  }

  function parseArray() {
    expect("[");
    const arr = [];
    skipWhitespace();
    if (peek() === "]") {
      pos++;
      return arr;
    }
    while (true) {
      arr.push(parseValue());
      skipWhitespace();
      if (text[pos] === ",") {
        pos++;
        continue;
      }
      if (text[pos] === "]") {
        pos++;
        break;
      }
      throw new SyntaxError("期望 ',' 或 ']'");
    }
    return arr;
  }

  const result = parseValue();
  skipWhitespace();
  if (pos < text.length) throw new SyntaxError("JSON 末尾有多余字符");
  return result;
}

// ===== 测试用例 =====
console.log(JSON.stringify(jsonParser('{"name":"张三","age":30}')));
// 期望输出: {"name":"张三","age":30}

console.log(JSON.stringify(jsonParser('[1, 2, [3, 4], {"x": true}]')));
// 期望输出: [1,2,[3,4],{"x":true}]

console.log(jsonParser("null")); // 期望输出: null
console.log(jsonParser("true")); // 期望输出: true
console.log(jsonParser("-3.14e2")); // 期望输出: -314
console.log(jsonParser('"hello\\nworld"')); // 期望输出: hello<换行>world
console.log(jsonParser('{"nested":{"a":[1,2,3]},"ok":false}'));
// 期望输出: { nested: { a: [ 1, 2, 3 ] }, ok: false }
