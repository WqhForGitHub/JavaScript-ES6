/**
 * 手写 JSON.stringify（简易版）
 *
 * 作用：
 *   - 将 JavaScript 值序列化为 JSON 字符串
 *   - 支持对象、数组、字符串、数字、布尔、null
 *
 * 转换规则（与原生 JSON.stringify 一致）：
 *   - undefined / function / symbol：作为对象属性值时被忽略，作为数组元素时转为 null
 *   - 字符串：用双引号包裹，转义特殊字符
 *   - 数字：Infinity / NaN 转为 null
 *   - 布尔：true / false
 *   - null：null
 *   - 对象：递归序列化键值对，key 加双引号
 *   - 数组：递归序列化元素
 *
 * 本简易版不处理：Date、RegExp、toJSON、缩进参数、循环引用（见 136）
 */

function myStringify(value) {
  // 顶层 undefined / function / symbol → undefined
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  if (value === null) {
    return "null";
  }

  const type = typeof value;

  if (type === "string") {
    return quoteString(value);
  }

  if (type === "number") {
    // Infinity / NaN → null
    return isFinite(value) ? String(value) : "null";
  }

  if (type === "boolean") {
    return value ? "true" : "false";
  }

  if (type === "bigint") {
    // 原生会抛 TypeError
    throw new TypeError("Do not know how to serialize a BigInt");
  }

  if (type === "symbol") {
    return undefined;
  }

  // 对象 / 数组
  if (type === "object") {
    if (value instanceof Date) {
      // 简易处理：用 ISO 字符串
      return quoteString(value.toISOString());
    }

    if (Array.isArray(value)) {
      return stringifyArray(value);
    }

    return stringifyObject(value);
  }

  return undefined;
}

function quoteString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);
    if (ch === '"') {
      result += '\\"';
    } else if (ch === "\\") {
      result += "\\\\";
    } else if (ch === "\n") {
      result += "\\n";
    } else if (ch === "\r") {
      result += "\\r";
    } else if (ch === "\t") {
      result += "\\t";
    } else if (ch === "\b") {
      result += "\\b";
    } else if (ch === "\f") {
      result += "\\f";
    } else if (code < 0x20) {
      // 控制字符用 \uXXXX
      result += "\\u" + code.toString(16).padStart(4, "0");
    } else {
      result += ch;
    }
  }
  result += '"';
  return result;
}

function stringifyArray(arr) {
  const parts = [];
  for (const item of arr) {
    const serialized = myStringify(item);
    // undefined / function / symbol 在数组中转为 null
    parts.push(serialized === undefined ? "null" : serialized);
  }
  return "[" + parts.join(",") + "]";
}

function stringifyObject(obj) {
  const parts = [];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    // undefined / function / symbol 作为属性值时被忽略
    if (value === undefined || typeof value === "function" || typeof value === "symbol") {
      continue;
    }
    const serialized = myStringify(value);
    if (serialized === undefined) continue;
    parts.push(quoteString(key) + ":" + serialized);
  }
  return "{" + parts.join(",") + "}";
}

// ===== 测试 =====

// 基本类型
console.log(myStringify(123)); // '123'
console.log(myStringify("hello")); // '"hello"'
console.log(myStringify(true)); // 'true'
console.log(myStringify(null)); // 'null'
console.log(myStringify(undefined)); // undefined

// 数字边界
console.log(myStringify(Infinity)); // 'null'
console.log(myStringify(NaN)); // 'null'

// 对象
console.log(myStringify({ a: 1, b: "hi" })); // '{"a":1,"b":"hi"}'

// 数组
console.log(myStringify([1, "x", true, null])); // '[1,"x",true,null]'

// 嵌套
console.log(myStringify({ a: { b: [1, 2] } })); // '{"a":{"b":[1,2]}}'

// undefined / function / symbol 作为属性值被忽略
console.log(myStringify({ a: 1, b: undefined, c: function () {}, d: Symbol("s") }));
// '{"a":1}'

// undefined / function / symbol 作为数组元素转为 null
console.log(myStringify([1, undefined, function () {}, Symbol("s")])); // '[1,null,null,null]'

// 字符串转义
console.log(myStringify('a"b\\c\n')); // '"a\"b\\c\n"'

// 与原生对比
const sample = { name: "Tom", age: 20, scores: [90, 85], meta: { ok: true } };
console.log(myStringify(sample) === JSON.stringify(sample)); // true

// BigInt 抛错
try {
  myStringify(10n);
} catch (e) {
  console.log("BigInt 抛错:", e instanceof TypeError); // true
}
