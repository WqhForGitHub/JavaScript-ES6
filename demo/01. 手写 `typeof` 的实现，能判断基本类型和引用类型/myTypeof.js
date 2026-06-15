/**
 * 手写 typeof：判断基本类型和引用类型
 *
 * 原生 typeof 的缺陷：
 *   - typeof null === "object"  （历史遗留 bug）
 *   - typeof [] / {} / Date / RegExp ... 都返回 "object"，无法区分
 *
 * 思路：先用 typeof 判断基本类型，再对 object 细分
 */

function myTypeof(value) {
  // 1. 先用原生 typeof 获取初步结果
  const type = typeof value;

  // 2. 基本类型直接返回（除 null 外 typeof 判断都是准确的）
  if (type !== "object" && type !== "function") {
    return type; // "undefined" | "boolean" | "number" | "string" | "symbol" | "bigint"
  }

  // 3. null 需要特殊处理（typeof null === "object" 是历史 bug）
  if (value === null) {
    return "null";
  }

  // 4. function 单独处理
  if (type === "function") {
    return "function";
  }

  // 5. 其他引用类型，通过 Object.prototype.toString 精确判断
  //    返回格式为 "[object Xxx]"，取中间的类型名
  const toString = Object.prototype.toString;
  const match = toString.call(value).match(/^\[object (\w+)\]$/);

  return match ? match[1].toLowerCase() : "object";
}

// ===== 测试 =====

// 基本类型
console.log(myTypeof(undefined)); // "undefined"
console.log(myTypeof(true)); // "boolean"
console.log(myTypeof(123)); // "number"
console.log(myTypeof("hello")); // "string"
console.log(myTypeof(Symbol("s"))); // "symbol"
console.log(myTypeof(10n)); // "bigint"

// null
console.log(myTypeof(null)); // "null"（原生 typeof 返回 "object"）

// 引用类型
console.log(myTypeof(function () {})); // "function"
console.log(myTypeof([])); // "array"
console.log(myTypeof({})); // "object"
console.log(myTypeof(new Date())); // "date"
console.log(myTypeof(/regex/)); // "regexp"
console.log(myTypeof(new Error())); // "error"
console.log(myTypeof(new Map())); // "map"
console.log(myTypeof(new Set())); // "set"
console.log(myTypeof(new WeakMap())); // "weakmap"
console.log(myTypeof(new WeakSet())); // "weakset"
console.log(myTypeof(Promise.resolve())); // "promise"
