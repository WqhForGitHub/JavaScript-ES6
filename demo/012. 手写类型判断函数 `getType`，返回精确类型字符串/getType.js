/**
 * 手写类型判断函数 getType，返回精确类型字符串
 *
 * 需求：
 *   - 基本类型返回小写："number" | "string" | "boolean" | "undefined" | "symbol" | "bigint"
 *   - null 返回 "null"
 *   - 引用类型返回具体子类型："array" | "date" | "regexp" | "map" | "set" | "function" ...
 *
 * 实现思路：
 *   1. null 单独处理（typeof null === "object" 是历史 bug）
 *   2. 使用 Object.prototype.toString.call(value)
 *      返回格式 "[object Xxx]"，取中间部分并转小写
 *   3. 该方法能识别几乎所有内置类型（由引擎通过 Symbol.toStringTag 决定）
 */

function getType(value) {
  // 1. null 单独处理
  if (value === null) {
    return "null";
  }

  // 2. 使用 Object.prototype.toString 获取内部类型标记
  const toString = Object.prototype.toString;
  const tag = toString.call(value); // 例如 "[object Array]"

  // 3. 提取类型名并转小写
  //    正则匹配 "[object Xxx]" 中的 Xxx
  const match = tag.match(/^\[object (\w+)\]$/);
  return match ? match[1].toLowerCase() : "object";
}

// ===== 测试 =====

// --- 基本类型 ---
console.log(getType(undefined)); // "undefined"
console.log(getType(null)); // "null"
console.log(getType(true)); // "boolean"
console.log(getType(123)); // "number"
console.log(getType("hello")); // "string"
console.log(getType(Symbol("s"))); // "symbol"
console.log(getType(10n)); // "bigint"

// --- 引用类型 ---
console.log(getType([])); // "array"
console.log(getType({})); // "object"
console.log(getType(function () {})); // "function"
console.log(getType(() => {})); // "function"
console.log(getType(class A {})); // "function"
console.log(getType(new Date())); // "date"
console.log(getType(/regex/)); // "regexp"
console.log(getType(new Error())); // "error"
console.log(getType(new Map())); // "map"
console.log(getType(new Set())); // "set"
console.log(getType(new WeakMap())); // "weakmap"
console.log(getType(new WeakSet())); // "weakset"
console.log(getType(new ArrayBuffer(8))); // "arraybuffer"
console.log(getType(Promise.resolve())); // "promise"
console.log(getType(new Int8Array(8))); // "int8array"

// --- 包装对象 ---
console.log(getType(new Number(1))); // "number"
console.log(getType(new String("a"))); // "string"
console.log(getType(new Boolean(false))); // "boolean"

// --- 自定义 Symbol.toStringTag（通过 getter 设置内部标签）---
const custom = {};
Object.defineProperty(custom, Symbol.toStringTag, {
  get() {
    return "MyCustom";
  },
  configurable: true,
});
console.log(getType(custom)); // "mycustom"

// --- 也可通过普通值属性设置 ---
const custom2 = { [Symbol.toStringTag]: "MyTag" };
console.log(getType(custom2)); // "mytag"
