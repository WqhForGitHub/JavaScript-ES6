/**
 * 手写对象深度比较 deepEqual
 *
 * 作用：
 *   - 递归比较两个值是否"深度相等"
 *   - 嵌套对象/数组逐层比较
 *   - 处理 NaN、Date、RegExp、Map、Set 等特殊类型
 *
 * 实现思路：
 *   1. 先用 Object.is 处理基本类型、NaN、±0、同引用
 *   2. 其中一个为 null 或非对象 → 不等
 *   3. 处理 Date：比较 getTime
 *   4. 处理 RegExp：比较 source 和 flags
 *   5. 处理 Map：逐个比较键值对
 *   6. 处理 Set：比较元素集合
 *   7. 普通对象/数组：键数量相同 + 逐个递归比较
 *
 * 注意：本实现不处理循环引用（如需可加 WeakSet 缓存）
 */

function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  return x !== x && y !== y; // NaN
}

function deepEqual(a, b) {
  // 1. 基本类型 / 同引用 / NaN
  if (is(a, b)) return true;

  // 2. 其中一个为 null 或非对象
  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  // 3. 类型标签必须一致（如 [object Date]）
  const tagA = Object.prototype.toString.call(a);
  const tagB = Object.prototype.toString.call(b);
  if (tagA !== tagB) return false;

  // 4. Date
  if (tagA === "[object Date]") {
    return a.getTime() === b.getTime();
  }

  // 5. RegExp
  if (tagA === "[object RegExp]") {
    return a.source === b.source && a.flags === b.flags;
  }

  // 6. Map
  if (tagA === "[object Map]") {
    if (a.size !== b.size) return false;
    let equal = true;
    a.forEach((val, key) => {
      if (!b.has(key) || !deepEqual(val, b.get(key))) {
        equal = false;
      }
    });
    return equal;
  }

  // 7. Set
  if (tagA === "[object Set]") {
    if (a.size !== b.size) return false;
    // 简单实现：将 set 转数组逐个比较（基本类型元素）
    const arrA = [...a];
    const arrB = [...b];
    for (let i = 0; i < arrA.length; i++) {
      if (!arrB.some((v) => is(arrA[i], v))) return false;
    }
    return true;
  }

  // 8. 数组 / 普通对象
  const isArrA = Array.isArray(a);
  const isArrB = Array.isArray(b);
  if (isArrA !== isArrB) return false;

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) return false;

  // B 必须包含 A 的所有 key，且值深度相等
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      // Symbol 属性需用 hasOwnProperty 或 Reflect.ownKeys 判断
      if (!keysB.includes(key)) return false;
    }
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

// ===== 测试 =====

// 基本类型
console.log(deepEqual(1, 1)); // true
console.log(deepEqual("a", "a")); // true
console.log(deepEqual(NaN, NaN)); // true
console.log(deepEqual(0, -0)); // false

// 普通对象
console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })); // true
console.log(deepEqual({ a: 1 }, { a: 1, b: 2 })); // false

// 数组
console.log(deepEqual([1, [2, 3]], [1, [2, 3]])); // true
console.log(deepEqual([1, 2], [1, 2, 3])); // false

// Date
console.log(deepEqual(new Date("2024-01-01"), new Date("2024-01-01"))); // true
console.log(deepEqual(new Date(2024, 0, 1), new Date(2024, 0, 2))); // false

// RegExp
console.log(deepEqual(/abc/gi, /abc/gi)); // true
console.log(deepEqual(/abc/g, /abc/i)); // false

// Map
const m1 = new Map([["a", 1], ["b", { x: 2 }]]);
const m2 = new Map([["b", { x: 2 }], ["a", 1]]);
console.log(deepEqual(m1, m2)); // true

// Set
console.log(deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))); // true

// 嵌套复杂结构
const complex1 = { users: [{ name: "Tom" }, { name: "Jerry" }], count: 2 };
const complex2 = { users: [{ name: "Tom" }, { name: "Jerry" }], count: 2 };
console.log(deepEqual(complex1, complex2)); // true

// 不同类型
console.log(deepEqual({ a: 1 }, [1])); // false
console.log(deepEqual(null, undefined)); // false
console.log(deepEqual(null, null)); // true

// Symbol 属性
const sym = Symbol("s");
console.log(deepEqual({ [sym]: 1 }, { [sym]: 1 })); // true
