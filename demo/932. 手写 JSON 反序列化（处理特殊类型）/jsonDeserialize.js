/**
 * 手写 JSON 反序列化（处理特殊类型）
 *
 * 不使用内置的 JSON.parse，从零实现一个递归下降解析器。
 * 在解析完成后，通过 reviveValue 函数还原 931 中序列化的特殊类型：
 * - { "$type": "Date" }     → Date 对象
 * - { "$type": "RegExp" }   → RegExp 对象
 * - { "$type": "Map" }      → Map 对象
 * - { "$type": "Set" }      → Set 对象
 * - { "$type": "undefined" } → undefined
 * - { "$type": "function" } → Function（通过 eval 重建）
 * - { "$type": "Symbol" }   → Symbol
 * - { "$type": "BigInt" }   → BigInt
 */

// ===================== 词法分析器 =====================

/**
 * JSON 词法分析器，将 JSON 字符串分解为 token 流。
 */
class JSONLexer {
  /**
   * @param {string} text - JSON 文本
   */
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.len = text.length;
  }

  /**
   * 跳过空白字符。
   */
  skipWhitespace() {
    while (this.pos < this.len) {
      const ch = this.text[this.pos];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        this.pos++;
      } else {
        break;
      }
    }
  }

  /**
   * 获取下一个 token。
   * @returns {{type: string, value: *}} token 对象
   */
  next() {
    this.skipWhitespace();
    if (this.pos >= this.len) return { type: "EOF", value: null };

    const ch = this.text[this.pos];

    // 单字符 token
    if (ch === "{") {
      this.pos++;
      return { type: "LBRACE", value: "{" };
    }
    if (ch === "}") {
      this.pos++;
      return { type: "RBRACE", value: "}" };
    }
    if (ch === "[") {
      this.pos++;
      return { type: "LBRACKET", value: "[" };
    }
    if (ch === "]") {
      this.pos++;
      return { type: "RBRACKET", value: "]" };
    }
    if (ch === ",") {
      this.pos++;
      return { type: "COMMA", value: "," };
    }
    if (ch === ":") {
      this.pos++;
      return { type: "COLON", value: ":" };
    }

    // 字符串
    if (ch === '"') return this.readString();

    // 数字
    if (ch === "-" || (ch >= "0" && ch <= "9")) return this.readNumber();

    // 关键字: true, false, null
    if (ch === "t") return this.readKeyword("true", true);
    if (ch === "f") return this.readKeyword("false", false);
    if (ch === "n") return this.readKeyword("null", null);

    throw new SyntaxError(
      "Unexpected character: " + ch + " at position " + this.pos,
    );
  }

  /**
   * 读取字符串 token。
   * @returns {{type: string, value: string}}
   */
  readString() {
    this.pos++; // 跳过开头的 "
    let result = "";
    while (this.pos < this.len) {
      const ch = this.text[this.pos];
      if (ch === '"') {
        this.pos++;
        return { type: "STRING", value: result };
      }
      if (ch === "\\") {
        this.pos++;
        const esc = this.text[this.pos];
        switch (esc) {
          case '"':
            result += '"';
            break;
          case "\\":
            result += "\\";
            break;
          case "/":
            result += "/";
            break;
          case "n":
            result += "\n";
            break;
          case "r":
            result += "\r";
            break;
          case "t":
            result += "\t";
            break;
          case "b":
            result += "\b";
            break;
          case "f":
            result += "\f";
            break;
          case "u": {
            const hex = this.text.substring(this.pos + 1, this.pos + 5);
            result += String.fromCharCode(parseInt(hex, 16));
            this.pos += 4;
            break;
          }
          default:
            throw new SyntaxError("Invalid escape: \\(" + esc + ")");
        }
        this.pos++;
      } else {
        result += ch;
        this.pos++;
      }
    }
    throw new SyntaxError("Unterminated string");
  }

  /**
   * 读取数字 token。
   * @returns {{type: string, value: number}}
   */
  readNumber() {
    let start = this.pos;
    if (this.text[this.pos] === "-") this.pos++;
    while (
      this.pos < this.len &&
      this.text[this.pos] >= "0" &&
      this.text[this.pos] <= "9"
    ) {
      this.pos++;
    }
    if (this.text[this.pos] === ".") {
      this.pos++;
      while (
        this.pos < this.len &&
        this.text[this.pos] >= "0" &&
        this.text[this.pos] <= "9"
      ) {
        this.pos++;
      }
    }
    if (this.text[this.pos] === "e" || this.text[this.pos] === "E") {
      this.pos++;
      if (this.text[this.pos] === "+" || this.text[this.pos] === "-")
        this.pos++;
      while (
        this.pos < this.len &&
        this.text[this.pos] >= "0" &&
        this.text[this.pos] <= "9"
      ) {
        this.pos++;
      }
    }
    const numStr = this.text.substring(start, this.pos);
    return { type: "NUMBER", value: parseFloat(numStr) };
  }

  /**
   * 读取关键字 token。
   * @param {string} keyword - 期望的关键字
   * @param {*} value - 对应的值
   * @returns {{type: string, value: *}}
   */
  readKeyword(keyword, value) {
    const word = this.text.substring(this.pos, this.pos + keyword.length);
    if (word === keyword) {
      this.pos += keyword.length;
      return { type: "KEYWORD", value: value };
    }
    throw new SyntaxError("Unexpected keyword: " + word);
  }
}

// ===================== 解析器 =====================

/**
 * JSON 递归下降解析器。
 */
class JSONParser {
  /**
   * @param {string} text - JSON 文本
   */
  constructor(text) {
    this.lexer = new JSONLexer(text);
    this.current = this.lexer.next();
  }

  /**
   * 消费当前 token 并获取下一个。
   * @param {string} expectedType - 期望的 token 类型
   * @returns {{type: string, value: *}} 被消费的 token
   */
  eat(expectedType) {
    if (this.current.type !== expectedType) {
      throw new SyntaxError(
        "Expected " +
          expectedType +
          " but got " +
          this.current.type +
          " at position " +
          (this.lexer.pos - 1),
      );
    }
    const token = this.current;
    this.current = this.lexer.next();
    return token;
  }

  /**
   * 解析 JSON 值。
   * @returns {*} 解析后的值
   */
  parseValue() {
    switch (this.current.type) {
      case "LBRACE":
        return this.parseObject();
      case "LBRACKET":
        return this.parseArray();
      case "STRING": {
        const val = this.current.value;
        this.current = this.lexer.next();
        return val;
      }
      case "NUMBER": {
        const val = this.current.value;
        this.current = this.lexer.next();
        return val;
      }
      case "KEYWORD": {
        const val = this.current.value;
        this.current = this.lexer.next();
        return val;
      }
      case "EOF":
        throw new SyntaxError("Unexpected end of input");
      default:
        throw new SyntaxError("Unexpected token: " + this.current.type);
    }
  }

  /**
   * 解析对象。
   * @returns {Object} 解析后的对象
   */
  parseObject() {
    this.eat("LBRACE");
    const obj = {};
    if (this.current.type === "RBRACE") {
      this.eat("RBRACE");
      return obj;
    }
    while (true) {
      const keyToken = this.eat("STRING");
      this.eat("COLON");
      const value = this.parseValue();
      obj[keyToken.value] = value;
      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      } else if (this.current.type === "RBRACE") {
        this.eat("RBRACE");
        break;
      } else {
        throw new SyntaxError("Expected , or } but got " + this.current.type);
      }
    }
    return obj;
  }

  /**
   * 解析数组。
   * @returns {Array} 解析后的数组
   */
  parseArray() {
    this.eat("LBRACKET");
    const arr = [];
    if (this.current.type === "RBRACKET") {
      this.eat("RBRACKET");
      return arr;
    }
    while (true) {
      arr.push(this.parseValue());
      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      } else if (this.current.type === "RBRACKET") {
        this.eat("RBRACKET");
        break;
      } else {
        throw new SyntaxError("Expected , or ] but got " + this.current.type);
      }
    }
    return arr;
  }
}

// ===================== 类型还原 =====================

/**
 * 递归还原特殊类型（带 $type 标记的对象）。
 * @param {*} value - 解析后的原始值
 * @returns {*} 还原后的值
 */
function reviveValue(value) {
  // 先递归处理子元素
  if (Array.isArray(value)) {
    value = value.map(reviveValue);
  } else if (
    value !== null &&
    typeof value === "object" &&
    !isSpecialTypeWrapper(value)
  ) {
    for (const key of Object.keys(value)) {
      value[key] = reviveValue(value[key]);
    }
  }

  // 再处理自身
  if (
    value !== null &&
    typeof value === "object" &&
    typeof value["$type"] === "string"
  ) {
    switch (value["$type"]) {
      case "Date":
        return new Date(value.value);
      case "RegExp":
        return new RegExp(value.value, value.flags || "");
      case "Map": {
        const map = new Map();
        for (const entry of value.value) {
          map.set(entry[0], entry[1]);
        }
        return map;
      }
      case "Set":
        return new Set(value.value);
      case "undefined":
        return undefined;
      case "function": {
        // 通过 Function 构造器重建函数
        try {
          const match = value.value.match(
            /^function\s*\*?\s*([\w$]*)\s*\(([^)]*)\)\s*\{([\s\S]*)\}$/,
          );
          if (match) {
            return new Function(match[2], match[3]);
          }
          // 尝试箭头函数
          return eval("(" + value.value + ")");
        } catch (e) {
          return value.value; // 回退为字符串
        }
      }
      case "Symbol":
        // 从 "Symbol(description)" 中提取描述
        return Symbol(value.value.replace(/^Symbol\(|\)$/g, ""));
      case "BigInt":
        return BigInt(value.value);
      default:
        return value;
    }
  }
  return value;
}

/**
 * 检查对象是否为特殊类型包装器。
 * @param {*} obj
 * @returns {boolean}
 */
function isSpecialTypeWrapper(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj["$type"] === "string" &&
    Object.keys(obj).length <= 3
  );
}

// ===================== 主函数 =====================

/**
 * 手写 JSON 反序列化主函数。
 * @param {string} text - JSON 字符串
 * @returns {*} 反序列化后的值（含特殊类型还原）
 */
function fromJSON(text) {
  const parser = new JSONParser(text);
  const raw = parser.parseValue();
  if (parser.current.type !== "EOF") {
    throw new SyntaxError("Unexpected trailing characters");
  }
  return reviveValue(raw);
}

// ===================== 测试用例 =====================

// 引入 931 的序列化函数（此处内联以保持独立可运行）
function quoteString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);
    if (ch === '"') result += '\\"';
    else if (ch === "\\") result += "\\\\";
    else if (ch === "\n") result += "\\n";
    else if (ch === "\r") result += "\\r";
    else if (ch === "\t") result += "\\t";
    else if (ch === "\b") result += "\\b";
    else if (ch === "\f") result += "\\f";
    else if (code < 0x20) result += "\\u" + code.toString(16).padStart(4, "0");
    else result += ch;
  }
  result += '"';
  return result;
}

function toJSON(value) {
  const seen = new WeakSet();
  function serialize(val) {
    if (val === null) return "null";
    if (val === undefined) return '{"$type":"undefined"}';
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") {
      if (Number.isNaN(val) || !Number.isFinite(val)) return "null";
      return String(val);
    }
    if (typeof val === "string") return quoteString(val);
    if (typeof val === "bigint")
      return '{"$type":"BigInt","value":' + quoteString(val.toString()) + "}";
    if (typeof val === "symbol")
      return '{"$type":"Symbol","value":' + quoteString(val.toString()) + "}";
    if (typeof val === "function")
      return '{"$type":"function","value":' + quoteString(val.toString()) + "}";
    if (val instanceof Date)
      return '{"$type":"Date","value":' + quoteString(val.toISOString()) + "}";
    if (val instanceof RegExp)
      return (
        '{"$type":"RegExp","value":' +
        quoteString(val.source) +
        ',"flags":' +
        quoteString(val.flags) +
        "}"
      );
    if (val instanceof Map) {
      if (seen.has(val)) throw new TypeError("Circular");
      seen.add(val);
      const entries = [];
      for (const [k, v] of val)
        entries.push("[" + serialize(k) + "," + serialize(v) + "]");
      seen.delete(val);
      return '{"$type":"Map","value":[' + entries.join(",") + "]}";
    }
    if (val instanceof Set) {
      if (seen.has(val)) throw new TypeError("Circular");
      seen.add(val);
      const items = [];
      for (const item of val) items.push(serialize(item));
      seen.delete(val);
      return '{"$type":"Set","value":[' + items.join(",") + "]}";
    }
    if (Array.isArray(val)) {
      if (seen.has(val)) throw new TypeError("Circular");
      seen.add(val);
      const items = val.map((item) =>
        item === undefined ? "null" : serialize(item),
      );
      seen.delete(val);
      return "[" + items.join(",") + "]";
    }
    if (typeof val === "object") {
      if (seen.has(val)) throw new TypeError("Circular");
      seen.add(val);
      const props = [];
      for (const key of Object.keys(val)) {
        const v = val[key];
        if (v === undefined)
          props.push(quoteString(key) + ':{"$type":"undefined"}');
        else props.push(quoteString(key) + ":" + serialize(v));
      }
      seen.delete(val);
      return "{" + props.join(",") + "}";
    }
    return "null";
  }
  return serialize(value);
}

console.log("===== 基本类型反序列化 =====");
console.log(fromJSON("null")); // null
console.log(fromJSON("true")); // true
console.log(fromJSON("42")); // 42
console.log(fromJSON('"hello"')); // hello

console.log("\n===== 数组与对象 =====");
console.log(fromJSON("[1, 2, 3]")); // [1, 2, 3]
console.log(fromJSON('{"name":"Alice","age":30}')); // { name: 'Alice', age: 30 }

console.log("\n===== Date 还原 =====");
const dateStr = toJSON(new Date("2024-01-15T08:30:00.000Z"));
console.log("序列化:", dateStr);
const dateRestored = fromJSON(dateStr);
console.log("反序列化:", dateRestored);
console.log("是 Date 实例:", dateRestored instanceof Date);
console.log(
  "时间戳正确:",
  dateRestored.getTime() === new Date("2024-01-15T08:30:00.000Z").getTime(),
);

console.log("\n===== RegExp 还原 =====");
const regexStr = toJSON(/^\d+$/gi);
console.log("序列化:", regexStr);
const regexRestored = fromJSON(regexStr);
console.log("反序列化:", regexRestored);
console.log("是 RegExp 实例:", regexRestored instanceof RegExp);
console.log("source 正确:", regexRestored.source === "^\\d+$");
console.log("flags 正确:", regexRestored.flags === "gi");

console.log("\n===== Map 还原 =====");
const mapStr = toJSON(
  new Map([
    ["name", "Bob"],
    ["age", 25],
  ]),
);
console.log("序列化:", mapStr);
const mapRestored = fromJSON(mapStr);
console.log("反序列化:", mapRestored);
console.log("是 Map 实例:", mapRestored instanceof Map);
console.log('get("name"):', mapRestored.get("name"));
console.log('get("age"):', mapRestored.get("age"));

console.log("\n===== Set 还原 =====");
const setStr = toJSON(new Set([1, "two", true]));
console.log("序列化:", setStr);
const setRestored = fromJSON(setStr);
console.log("反序列化:", setRestored);
console.log("是 Set 实例:", setRestored instanceof Set);
console.log("has(1):", setRestored.has(1));
console.log('has("two"):', setRestored.has("two"));

console.log("\n===== undefined 还原 =====");
const undefStr = toJSON(undefined);
console.log("序列化:", undefStr);
console.log("反序列化:", fromJSON(undefStr)); // undefined

console.log("\n===== 嵌套复杂对象往返测试 =====");
const original = {
  name: "Charlie",
  age: 28,
  birthday: new Date("1996-06-15T00:00:00.000Z"),
  email: /[^@]+@[^@]+/,
  skills: new Set(["JS", "Python"]),
  scores: new Map([
    ["math", 95],
    ["english", 88],
  ]),
  tags: ["dev", "lead"],
  meta: {
    created: new Date("2024-01-01T00:00:00.000Z"),
    active: true,
  },
};
const serialized = toJSON(original);
console.log("序列化结果:", serialized);
const restored = fromJSON(serialized);
console.log("反序列化结果:", restored);
console.log("\n===== 往返验证 =====");
console.log("name 正确:", restored.name === "Charlie");
console.log("birthday 是 Date:", restored.birthday instanceof Date);
console.log("email 是 RegExp:", restored.email instanceof RegExp);
console.log("skills 是 Set:", restored.skills instanceof Set);
console.log('skills has "JS":', restored.skills.has("JS"));
console.log("scores 是 Map:", restored.scores instanceof Map);
console.log('scores get("math"):', restored.scores.get("math"));
console.log("meta.created 是 Date:", restored.meta.created instanceof Date);

console.log("\n===== 错误处理测试 =====");
try {
  fromJSON("{invalid}");
} catch (e) {
  console.log("捕获解析错误:", e.message);
}
