/**
 * 手写判断变量是否为 Map 或 Set
 *
 * 判定方式：
 *   1. 优先用 instanceof（同一 realm 内最直观）
 *   2. 跨 realm 兼容：用 Object.prototype.toString 检查内部标签
 *
 * 实现思路：
 *   - 排除 null/非对象
 *   - 用 toString 精确匹配 "[object Map]" 或 "[object Set]"
 *   - 同时返回具体类型（map / set）便于区分
 */

function isMapOrSet(value) {
  // 1. null / 非对象直接排除
  if (value === null || typeof value !== "object") {
    return false;
  }

  // 2. 用 Object.prototype.toString 精确判断（跨 realm 兼容）
  const tag = Object.prototype.toString.call(value);
  return tag === "[object Map]" || tag === "[object Set]";
}

// 辅助函数：返回具体是 Map 还是 Set
function getMapOrSetType(value) {
  if (value === null || typeof value !== "object") {
    return null;
  }
  const tag = Object.prototype.toString.call(value);
  if (tag === "[object Map]") return "Map";
  if (tag === "[object Set]") return "Set";
  return null;
}

// ===== 测试 =====

// --- Map ---
console.log(isMapOrSet(new Map())); // true
console.log(isMapOrSet(new Map([["a", 1]]))); // true
console.log(getMapOrSetType(new Map())); // "Map"

// --- Set ---
console.log(isMapOrSet(new Set())); // true
console.log(isMapOrSet(new Set([1, 2, 3]))); // true
console.log(getMapOrSetType(new Set())); // "Set"

// --- WeakMap / WeakSet（不算 Map/Set）---
console.log(isMapOrSet(new WeakMap())); // false
console.log(isMapOrSet(new WeakSet())); // false

// --- 其他对象 ---
console.log(isMapOrSet({})); // false
console.log(isMapOrSet([])); // false
console.log(isMapOrSet(new Date())); // false
console.log(isMapOrSet(/regex/)); // false
console.log(isMapOrSet(new Error())); // false

// --- 非对象 ---
console.log(isMapOrSet(null)); // false
console.log(isMapOrSet(undefined)); // false
console.log(isMapOrSet(123)); // false
console.log(isMapOrSet("hello")); // false
console.log(isMapOrSet(true)); // false
console.log(isMapOrSet(Symbol("s"))); // false
console.log(isMapOrSet(function () {})); // false

// --- Map 子类 ---
class MyMap extends Map {}
console.log(isMapOrSet(new MyMap())); // true（子类实例也算）
console.log(getMapOrSetType(new MyMap())); // "Map"

// --- 跨 realm（iframe / vm 中的 Map 也能正确识别）---
// 模拟：通过 toString 判断比 instanceof 更健壮
const fakeMap = {
  [Symbol.toStringTag]: "Map",
};
console.log(isMapOrSet(fakeMap)); // true（toString 标签为 Map）
