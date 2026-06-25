/**
 * 手写 TypeScript `UnionToTuple`（联合转元组）
 *
 * 类型作用：
 *   将联合类型 U 转换为元组类型。
 *   例如 'a' | 'b' | 'c' -> ['a', 'b', 'c']（顺序由实现决定，TS 不保证联合顺序）。
 *
 * 实现思路：
 *   TS 没有直接的内建方法，需要先求出"联合的最后一个成员"再递归排除：
 *     type LastOfUnion<U> = UnionToIntersection<
 *       U extends any ? (x: U) => 0 : never
 *     > extends (x: infer L) => 0 ? L : never;
 *
 *     type UnionToTuple<U, Last = LastOfUnion<U>> =
 *       [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last];
 *   注意：TS 联合类型本身无序，元组顺序不可依赖。
 *
 * 运行时模拟：
 *   JS 用 Set 表示联合，转元组即 Array.from(set)。
 */

// ===== TypeScript 类型实现 =====
// type UnionToIntersection<U> =
//   (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
//     ? I : never;
//
// type LastOfUnion<U> = UnionToIntersection<
//   U extends any ? (x: U) => 0 : never
// > extends (x: infer L) => 0 ? L : never;
//
// type UnionToTuple<U, Last = LastOfUnion<U>> =
//   [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last];
//
// 示例：
//   type T = UnionToTuple<'a' | 'b' | 'c'>; // ['a', 'b', 'c']（顺序不保证）

// ===== 运行时模拟函数 =====
/**
 * 模拟 UnionToTuple：把"联合"（用 Set 表示）转为元组（数组）
 * @param {Set<any>|Array<any>} union 联合（Set 或数组）
 * @returns {Array<any>} 元组
 */
function unionToTuple(union) {
  if (union instanceof Set) {
    return Array.from(union);
  }
  if (Array.isArray(union)) {
    return Array.from(new Set(union));
  }
  throw new TypeError("Expected a Set or Array");
}

/**
 * 模拟 LastOfUnion + 递归排除的实现思路
 * 每次取一个成员放到末尾，递归处理剩余，构造元组
 * @param {Set<any>|Array<any>} union
 * @returns {Array<any>}
 */
function unionToTupleRecursive(union) {
  const set = union instanceof Set ? union : new Set(union);
  const result = [];
  // 迭代器每次取一个，等价于"取最后一个"
  for (const item of set) {
    result.push(item);
  }
  return result;
}

/**
 * 按指定排序规则生成元组
 * @param {Set<any>|Array<any>} union
 * @param {(a: any, b: any) => number} [compareFn]
 * @returns {Array<any>}
 */
function unionToTupleSorted(union, compareFn) {
  const arr =
    union instanceof Set ? Array.from(union) : Array.from(new Set(union));
  return compareFn ? arr.sort(compareFn) : arr.sort();
}

// ===== 测试 =====

// 字面量联合
console.log(unionToTuple(new Set(["a", "b", "c"]))); // [ 'a', 'b', 'c' ]
console.log(unionToTuple(new Set([1, 2, 3]))); // [ 1, 2, 3 ]

// 数组输入（去重）
console.log(unionToTuple([1, 2, 2, 3, 3])); // [ 1, 2, 3 ]

// 递归版本
console.log(unionToTupleRecursive(new Set(["x", "y", "z"]))); // [ 'x', 'y', 'z' ]

// 排序版本（保证顺序可预测）
console.log(unionToTupleSorted(new Set([3, 1, 2]))); // [ 1, 2, 3 ]
console.log(unionToTupleSorted(new Set(["c", "a", "b"]))); // [ 'a', 'b', 'c' ]
console.log(unionToTupleSorted(new Set([3, 1, 2]), (a, b) => b - a)); // [ 3, 2, 1 ]

// 空联合
console.log(unionToTuple(new Set())); // []
console.log(unionToTuple([])); // []

// 复杂成员
console.log(unionToTuple(new Set([{ a: 1 }, { b: 2 }]))); // [ { a: 1 }, { b: 2 } ]

// 非法输入抛错
try {
  unionToTuple(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a Set or Array
}
