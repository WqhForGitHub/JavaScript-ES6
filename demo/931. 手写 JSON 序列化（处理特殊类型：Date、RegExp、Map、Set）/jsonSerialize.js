/**
 * 手写 JSON 序列化（处理特殊类型：Date、RegExp、Map、Set）
 *
 * 不使用内置的 JSON.stringify，从零实现序列化功能。
 * 支持特殊类型：
 * - Date       → { "$type": "Date", "value": ISOString }
 * - RegExp     → { "$type": "RegExp", "value": pattern, "flags": flags }
 * - Map        → { "$type": "Map", "value": [[k, v], ...] }
 * - Set        → { "$type": "Set", "value": [item, ...] }
 * - undefined  → { "$type": "undefined" }
 * - function   → { "$type": "function", "value": "source code" }
 * - Symbol     → { "$type": "Symbol", "value": "Symbol(description)" }
 * - BigInt     → { "$type": "BigInt", "value": "string form" }
 *
 * 使用 "$type" 包装器标记特殊类型，便于反序列化时还原。
 */

/**
 * 对字符串进行 JSON 转义并加上双引号。
 * @param {string} str - 原始字符串
 * @returns {string} 转义后的 JSON 字符串字面量
 */
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

/**
 * 手写 JSON 序列化主函数。
 * @param {*} value - 要序列化的值
 * @param {number} [indent=0] - 缩进空格数（0 表示紧凑模式）
 * @returns {string} JSON 字符串
 */
function toJSON(value, indent = 0) {
  const seen = new WeakSet(); // 用于检测循环引用

  /**
   * 递归序列化单个值。
   * @param {*} val - 当前值
   * @param {number} level - 缩进层级
   * @returns {string} 序列化结果
   */
  function serialize(val, level) {
    // ---------- null ----------
    if (val === null) return "null";

    // ---------- undefined ----------
    if (val === undefined) return '{"$type":"undefined"}';

    // ---------- 布尔值 ----------
    if (typeof val === "boolean") return val ? "true" : "false";

    // ---------- 数字 ----------
    if (typeof val === "number") {
      // NaN 和 Infinity 在 JSON 中转为 null
      if (Number.isNaN(val) || !Number.isFinite(val)) return "null";
      return String(val);
    }

    // ---------- 字符串 ----------
    if (typeof val === "string") return quoteString(val);

    // ---------- BigInt ----------
    if (typeof val === "bigint") {
      return '{"$type":"BigInt","value":' + quoteString(val.toString()) + "}";
    }

    // ---------- Symbol ----------
    if (typeof val === "symbol") {
      return '{"$type":"Symbol","value":' + quoteString(val.toString()) + "}";
    }

    // ---------- 函数 ----------
    if (typeof val === "function") {
      return '{"$type":"function","value":' + quoteString(val.toString()) + "}";
    }

    // ---------- Date ----------
    if (val instanceof Date) {
      return '{"$type":"Date","value":' + quoteString(val.toISOString()) + "}";
    }

    // ---------- RegExp ----------
    if (val instanceof RegExp) {
      return (
        '{"$type":"RegExp","value":' +
        quoteString(val.source) +
        ',"flags":' +
        quoteString(val.flags) +
        "}"
      );
    }

    // ---------- Map ----------
    if (val instanceof Map) {
      if (seen.has(val))
        throw new TypeError("Converting circular structure to JSON");
      seen.add(val);
      const entries = [];
      for (const [k, v] of val) {
        entries.push(
          "[" + serialize(k, level + 1) + "," + serialize(v, level + 1) + "]",
        );
      }
      seen.delete(val);
      return '{"$type":"Map","value":[' + entries.join(",") + "]}";
    }

    // ---------- Set ----------
    if (val instanceof Set) {
      if (seen.has(val))
        throw new TypeError("Converting circular structure to JSON");
      seen.add(val);
      const items = [];
      for (const item of val) {
        items.push(serialize(item, level + 1));
      }
      seen.delete(val);
      return '{"$type":"Set","value":[' + items.join(",") + "]}";
    }

    // ---------- 数组 ----------
    if (Array.isArray(val)) {
      if (seen.has(val))
        throw new TypeError("Converting circular structure to JSON");
      seen.add(val);
      const items = val.map((item) => {
        // 数组中的 undefined / function / symbol 在标准 JSON 中转为 null
        if (
          item === undefined ||
          typeof item === "function" ||
          typeof item === "symbol"
        ) {
          return "null";
        }
        return serialize(item, level + 1);
      });
      seen.delete(val);
      return "[" + items.join(",") + "]";
    }

    // ---------- 普通对象 ----------
    if (typeof val === "object") {
      if (seen.has(val))
        throw new TypeError("Converting circular structure to JSON");
      seen.add(val);
      const props = [];
      for (const key of Object.keys(val)) {
        const v = val[key];
        // 对象属性中的 undefined / function / symbol 保留为带类型标记的值
        if (v === undefined) {
          props.push(quoteString(key) + ':{"$type":"undefined"}');
        } else if (typeof v === "function") {
          props.push(
            quoteString(key) +
              ':{"$type":"function","value":' +
              quoteString(v.toString()) +
              "}",
          );
        } else if (typeof v === "symbol") {
          props.push(
            quoteString(key) +
              ':{"$type":"Symbol","value":' +
              quoteString(v.toString()) +
              "}",
          );
        } else {
          props.push(quoteString(key) + ":" + serialize(v, level + 1));
        }
      }
      seen.delete(val);
      return "{" + props.join(",") + "}";
    }

    return "null";
  }

  return serialize(value, 0);
}

// ===================== 测试用例 =====================

console.log("===== 基本类型 =====");
console.log(toJSON(null)); // null
console.log(toJSON(true)); // true
console.log(toJSON(42)); // 42
console.log(toJSON('hello "world"')); // "hello \"world\""
console.log(toJSON(undefined)); // {"$type":"undefined"}

console.log("\n===== Date =====");
const date = new Date("2024-01-15T08:30:00.000Z");
console.log(toJSON(date));
// {"$type":"Date","value":"2024-01-15T08:30:00.000Z"}

console.log("\n===== RegExp =====");
const regex = /^[a-z]+$/gi;
console.log(toJSON(regex));
// {"$type":"RegExp","value":"^[a-z]+$","flags":"gi"}

console.log("\n===== Map =====");
const map = new Map([
  ["name", "Alice"],
  ["age", 30],
  [1, "one"],
]);
console.log(toJSON(map));
// {"$type":"Map","value":[["name","Alice"],["age",30],[1,"one"]]}

console.log("\n===== Set =====");
const set = new Set([1, "two", true, null]);
console.log(toJSON(set));
// {"$type":"Set","value":[1,"two",true,null]}

console.log("\n===== 嵌套对象 =====");
const nested = {
  name: "Bob",
  age: 25,
  hobbies: ["reading", "coding"],
  birthday: new Date("1999-12-31T00:00:00.000Z"),
  pattern: /\d+/g,
  data: new Map([["key", "value"]]),
  tags: new Set(["a", "b"]),
  nothing: undefined,
  handler: function add(a, b) {
    return a + b;
  },
  sym: Symbol("mySymbol"),
  big: BigInt(12345678901234567890),
};
console.log(toJSON(nested));

console.log("\n===== 数组 =====");
console.log(toJSON([1, "two", null, undefined, true]));
// [1,"two",null,null,true]

console.log("\n===== 特殊字符串转义 =====");
console.log(toJSON("line1\nline2\ttab\\back"));
// "line1\nline2\ttab\\back"

console.log("\n===== 循环引用检测 =====");
const cyclic = { a: 1 };
cyclic.self = cyclic;
try {
  console.log(toJSON(cyclic));
} catch (e) {
  console.log("捕获循环引用错误:", e.message);
}
