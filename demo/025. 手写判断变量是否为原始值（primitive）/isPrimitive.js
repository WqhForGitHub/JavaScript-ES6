/**
 * 手写判断变量是否为原始值（primitive）
 *
 * 原始类型（primitive）：
 *   - string
 *   - number
 *   - boolean
 *   - undefined
 *   - null
 *   - symbol
 *   - bigint
 *
 * 非原始值（引用类型）：
 *   - object（含 Array、Date、RegExp、Map、Set 等）
 *   - function
 *   - 包装对象（new String()、new Number()、new Boolean()）
 *
 * 实现思路：
 *   方式一：typeof + null 判断
 *   方式二：Object(value) !== value（装箱后不等于自身即为原始值）
 *
 * 这里采用方式一，更直观且性能更好。
 */

function isPrimitive(value) {
  // 1. null 是原始值（typeof null === "object"，需单独处理）
  if (value === null) {
    return true;
  }

  // 2. typeof 判断：
  //    原始类型：string | number | boolean | undefined | symbol | bigint
  //    非原始：object | function
  const type = typeof value;
  return (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    type === "undefined" ||
    type === "symbol" ||
    type === "bigint"
  );
}

// 备选实现：利用装箱特性（Object(value) 对原始值会创建包装对象，引用不同）
function isPrimitiveAlt(value) {
  return value !== Object(value);
}

// ===== 测试 =====

// --- 原始值 ---
console.log(isPrimitive("hello")); // true
console.log(isPrimitive(123)); // true
console.log(isPrimitive(NaN)); // true（NaN 是 number 原始值）
console.log(isPrimitive(Infinity)); // true
console.log(isPrimitive(true)); // true
console.log(isPrimitive(false)); // true
console.log(isPrimitive(undefined)); // true
console.log(isPrimitive(null)); // true
console.log(isPrimitive(Symbol("s"))); // true
console.log(isPrimitive(10n)); // true

// --- 引用类型 ---
console.log(isPrimitive({})); // false
console.log(isPrimitive([])); // false
console.log(isPrimitive(new Date())); // false
console.log(isPrimitive(/regex/)); // false
console.log(isPrimitive(new Map())); // false
console.log(isPrimitive(new Set())); // false
console.log(isPrimitive(function () {})); // false
console.log(isPrimitive(() => {})); // false
console.log(isPrimitive(class A {})); // false

// --- 包装对象（关键区分点：原始值 vs 包装对象）---
console.log(isPrimitive(new String("hello"))); // false（包装对象是引用类型）
console.log(isPrimitive(new Number(123))); // false
console.log(isPrimitive(new Boolean(true))); // false

// --- 对比原始值与包装对象 ---
console.log(isPrimitive("abc")); // true（字面量字符串）
console.log(isPrimitive(new String("abc"))); // false（包装对象）
console.log(isPrimitive(42)); // true
console.log(isPrimitive(new Number(42))); // false

// --- 验证备选实现一致性 ---
console.log(isPrimitiveAlt("hello")); // true
console.log(isPrimitiveAlt(null)); // true
console.log(isPrimitiveAlt({})); // false
console.log(isPrimitiveAlt(new Number(1))); // false
console.log(isPrimitiveAlt(10n)); // true
console.log(isPrimitiveAlt(Symbol("s"))); // true
