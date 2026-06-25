/**
 * 手写 TypeScript `Extract` 类型
 *
 * 类型作用：
 *   从联合类型 T 中提取所有可分配给 U 的成员。
 *   即 T 与 U 的交集，与 Exclude 互为补集。
 *
 * 实现思路：
 *   利用条件类型的分布式特性：
 *     type Extract<T, U> = T extends U ? T : never;
 *   当 T 是联合类型时分发：对每个成员判断是否 extends U，
 *   是则保留该成员，否则返回 never（被过滤）。
 *
 * 运行时模拟：
 *   用数组 filter 保留满足判定的成员。
 */

// ===== TypeScript 类型实现 =====
// type Extract<T, U> = T extends U ? T : never;
//
// 示例：
//   type T1 = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
//   type T2 = Extract<string | number | (() => void), Function>; // () => void

// ===== 运行时模拟函数 =====
/**
 * 模拟 Extract：从集合 T 中提取所有"可分配给" U 的成员。
 * @param {Array<any>} members 联合成员集合
 * @param {(value: any) => boolean} isU 判定成员是否属于 U
 * @returns {Array<any>} 提取后的成员数组
 */
function extract(members, isU) {
  return members.filter((m) => isU(m));
}

/**
 * 判定值是否为函数（对应 TS 的 Function 类型）
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value) {
  return typeof value === "function";
}

/**
 * 判定值是否属于给定集合（对应 TS 的字面量联合）
 * @param {Array<any>} allowed
 * @returns {(value: any) => boolean}
 */
function oneOf(allowed) {
  const set = new Set(allowed);
  return (value) => set.has(value);
}

// ===== 测试 =====

// 字面量联合：提取 'a' | 'b'
console.log(extract(["a", "b", "c", "d"], oneOf(["a", "b"]))); // [ 'a', 'b' ]

// 类型联合：提取 Function
const mixed = ["foo", 1, () => {}, function named() {}, true];
console.log(extract(mixed, isFunction)); // [ [Function (anonymous)], [Function: named] ]

// 提取 number
console.log(extract([1, "a", 2, "b", 3], (v) => typeof v === "number")); // [ 1, 2, 3 ]

// 提取后为空
console.log(extract([1, 2, 3], isFunction)); // []

// 全部命中
console.log(extract([1, 2, 3], (v) => typeof v === "number")); // [ 1, 2, 3 ]
