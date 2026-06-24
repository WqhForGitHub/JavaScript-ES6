/**
 * 手写判断两个值是否相等（深度比较 deepEqual）
 *
 * 深度比较语义：
 *   - 基本类型用 ===（同时处理 NaN === NaN 为 true）
 *   - +0 与 -0 视为相等（与 Object.is 不同，这里采用 === 语义）
 *   - 对象/数组：递归比较所有自有可枚举属性
 *   - Date：比较时间戳
 *   - RegExp：比较 source 和 flags
 *   - Map/Set：比较键值对/元素
 *   - 处理循环引用（用缓存避免死循环）
 *
 * 实现思路：
 *   1. 先用 Object.is 比较（覆盖 NaN 与基本类型）
 *   2. 类型不同直接 false
 *   3. Date / RegExp 特殊处理
 *   4. Map / Set 特殊处理
 *   5. 对象/数组递归比较 keys
 */

function deepEqual(a, b, cache = new WeakMap()) {
  // 1. 基本类型与同引用：用 Object.is（含 NaN 处理）
  if (Object.is(a, b)) {
    return true;
  }

  // 2. 任一为 null/undefined 或基本类型（且未被 Object.is 判等）则不相等
  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false;
  }

  // 3. 类型标记必须一致（排除 Date vs RegExp 等）
  const tagA = Object.prototype.toString.call(a);
  const tagB = Object.prototype.toString.call(b);
  if (tagA !== tagB) {
    return false;
  }

  // 4. 处理循环引用：若该对已比较过，认为相等
  if (cache.has(a) && cache.get(a) === b) {
    return true;
  }
  cache.set(a, b);

  // 5. Date：比较时间戳
  if (tagA === "[object Date]") {
    return a.getTime() === b.getTime();
  }

  // 6. RegExp：比较 source 和 flags
  if (tagA === "[object RegExp]") {
    return a.source === b.source && a.flags === b.flags;
  }

  // 7. Map：键值对完全一致（顺序无关，按 key 比对）
  if (tagA === "[object Map]") {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k)) return false;
      if (!deepEqual(v, b.get(k), cache)) return false;
    }
    return true;
  }

  // 8. Set：元素一致
  if (tagA === "[object Set]") {
    if (a.size !== b.size) return false;
    for (const item of a) {
      let found = false;
      for (const other of b) {
        if (deepEqual(item, other, cache)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // 9. 数组 / 普通对象：比较自有可枚举属性
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    // b 必须拥有该 key，且值深度相等
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!deepEqual(a[key], b[key], cache)) {
      return false;
    }
  }

  return true;
}

// ===== 测试 =====

// --- 基本类型 ---
console.log(deepEqual(1, 1)); // true
console.log(deepEqual("a", "a")); // true
console.log(deepEqual(NaN, NaN)); // true
console.log(deepEqual(1, "1")); // false
console.log(deepEqual(null, null)); // true
console.log(deepEqual(null, undefined)); // false
console.log(deepEqual(0, -0)); // false（Object.is 语义，0 与 -0 不等）

// --- 对象 ---
console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })); // true
console.log(deepEqual({ a: 1 }, { a: 1, b: 2 })); // false（键数量不同）
console.log(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })); // true（顺序无关）

// --- 数组 ---
console.log(deepEqual([1, [2, 3]], [1, [2, 3]])); // true
console.log(deepEqual([1, 2], [1, 2, 3])); // false

// --- Date ---
console.log(deepEqual(new Date("2024-01-01"), new Date("2024-01-01"))); // true
console.log(deepEqual(new Date("2024-01-01"), new Date("2024-01-02"))); // false

// --- RegExp ---
console.log(deepEqual(/abc/gi, /abc/gi)); // true
console.log(deepEqual(/abc/g, /abc/i)); // false（flags 不同）
console.log(deepEqual(/abc/, /abd/)); // false（source 不同）

// --- Map ---
const m1 = new Map([["k", { v: 1 }]]);
const m2 = new Map([["k", { v: 1 }]]);
console.log(deepEqual(m1, m2)); // true

// --- Set ---
console.log(deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))); // true（顺序无关）
console.log(deepEqual(new Set([1, 2]), new Set([1, 2, 3]))); // false

// --- 不同类型 ---
console.log(deepEqual({}, [])); // false
console.log(deepEqual([], {})); // false
console.log(deepEqual({}, new Map())); // false

// --- 循环引用 ---
const a = { name: "x" };
a.self = a;
const b = { name: "x" };
b.self = b;
console.log(deepEqual(a, b)); // true

// --- 嵌套循环 + 不等 ---
const c = { name: "y" };
c.self = c;
console.log(deepEqual(a, c)); // false
