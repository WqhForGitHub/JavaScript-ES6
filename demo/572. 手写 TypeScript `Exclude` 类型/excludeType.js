/**
 * 手写 TypeScript `Exclude` 类型
 *
 * 类型作用：
 *   从联合类型 T 中排除所有可分配给 U 的成员。
 *   即 T 减去 U（差集）。
 *
 * 实现思路：
 *   利用条件类型的分布式特性：
 *     type Exclude<T, U> = T extends U ? never : T;
 *   当 T 是联合类型时会分发：对每个成员判断是否 extends U，
 *   是则返回 never（被过滤），否则保留该成员。
 *
 * 运行时模拟：
 *   TS 的联合类型在 JS 运行时通常用数组/集合表示，这里用数组过滤模拟。
 */

// ===== TypeScript 类型实现 =====
// type Exclude<T, U> = T extends U ? never : T;
//
// 示例：
//   type T1 = Exclude<'a' | 'b' | 'c', 'a'>;        // 'b' | 'c'
//   type T2 = Exclude<string | number | boolean, number>; // string | boolean

// ===== 运行时模拟函数 =====
/**
 * 模拟 Exclude：从集合 T 中排除所有"可分配给" U 的成员。
 * 运行时通过判等函数 isU 判定成员是否属于 U。
 * @param {Array<any>} members 联合成员集合
 * @param {(value: any) => boolean} isU 判定成员是否属于 U
 * @returns {Array<any>} 排除后的成员数组
 */
function exclude(members, isU) {
  return members.filter((m) => !isU(m));
}

/**
 * 内置判等工具：基于值相等
 * @param {any} target
 * @returns {(value: any) => boolean}
 */
function equalsTo(target) {
  return (value) => Object.is(value, target);
}

/**
 * 基于类型标签的判定
 * @param {string} typeName 类型名（如 'number'）
 * @returns {(value: any) => boolean}
 */
function typeIs(typeName) {
  return (value) => typeof value === typeName;
}

// ===== 测试 =====

// 字面量联合：排除 'a'
console.log(exclude(["a", "b", "c"], equalsTo("a"))); // [ 'b', 'c' ]

// 排除多个值
console.log(exclude(["a", "b", "c", "d"], (v) => v === "a" || v === "c")); // [ 'b', 'd' ]

// 类型联合：排除 number
console.log(exclude(["foo", 1, true, 2, "bar"], typeIs("number"))); // [ 'foo', true, 'bar' ]

// 排除后为空
console.log(exclude([1, 2, 3], typeIs("number"))); // []

// 不存在可排除的成员
console.log(exclude([1, 2, 3], equalsTo(99))); // [ 1, 2, 3 ]
