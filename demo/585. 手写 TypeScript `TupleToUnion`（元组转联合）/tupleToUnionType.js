/**
 * 手写 TypeScript `TupleToUnion`（元组转联合）
 *
 * 类型作用：
 *   将元组类型 T 中所有元素的类型提取出来组成一个联合类型。
 *   例如 [string, number, boolean] -> string | number | boolean。
 *
 * 实现思路：
 *   直接用索引访问 T[number]：
 *     type TupleToUnion<T extends readonly any[]> = T[number];
 *   T[number] 表示"取 T 中所有数字索引对应类型的联合"。
 *
 * 运行时模拟：
 *   JS 中元组即数组，转联合用 Set 表示（去重）或直接遍历。
 */

// ===== TypeScript 类型实现 =====
// type TupleToUnion<T extends readonly any[]> = T[number];
//
// 示例：
//   type T = TupleToUnion<[string, number, boolean]>; // string | number | boolean
//   type U = TupleToUnion<[1, 2, 3]>;                 // 1 | 2 | 3

// ===== 运行时模拟函数 =====
/**
 * 模拟 TupleToUnion：把元组（数组）转为"联合"——用 Set 表示去重后的成员
 * @param {Array<any>} tuple 元组
 * @returns {Set<any>} 成员集合（对应联合类型）
 */
function tupleToUnion(tuple) {
  if (!Array.isArray(tuple)) {
    throw new TypeError("Expected an array (tuple)");
  }
  return new Set(tuple);
}

/**
 * 转为"类型名联合"——返回数组中元素类型的字符串集合
 * @param {Array<any>} tuple
 * @returns {Set<string>}
 */
function tupleToTypeUnion(tuple) {
  if (!Array.isArray(tuple)) {
    throw new TypeError("Expected an array (tuple)");
  }
  return new Set(
    tuple.map((v) => {
      if (v === null) return "null";
      if (typeof v === "function") return "function";
      const m = Object.prototype.toString.call(v).match(/^\[object (\w+)\]$/);
      return m ? m[1].toLowerCase() : "object";
    }),
  );
}

/**
 * 判断某值是否属于元组对应的联合（即元组中是否包含该值）
 * @param {Array<any>} tuple
 * @param {any} value
 * @returns {boolean}
 */
function unionIncludes(tuple, value) {
  return tupleToUnion(tuple).has(value);
}

// ===== 测试 =====

// 字面量元组转联合
console.log(tupleToUnion([1, 2, 3])); // Set { 1, 2, 3 }
console.log(tupleToUnion(["a", "b", "a"])); // Set { 'a', 'b' }（去重）

// 类型联合
console.log(tupleToTypeUnion(["foo", 1, true, 2])); // Set { 'string', 'number', 'boolean' }
console.log(tupleToTypeUnion([new Date(), /x/, [1]])); // Set { 'date', 'regexp', 'array' }

// 联合包含判断
console.log(unionIncludes([1, 2, 3], 2)); // true
console.log(unionIncludes([1, 2, 3], 5)); // false
console.log(unionIncludes(["a", "b"], "a")); // true

// 空元组
console.log(tupleToUnion([])); // Set {}

// readonly 元组（JS 数组天然可读）
const readonlyTuple = Object.freeze([1, 2, 3]);
console.log(tupleToUnion(readonlyTuple)); // Set { 1, 2, 3 }

// 非数组抛错
try {
  tupleToUnion(123);
} catch (e) {
  console.log("catch:", e.message); // Expected an array (tuple)
}
