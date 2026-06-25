/**
 * 手写 TypeScript `UnionToIntersection`（联合转交叉）
 *
 * 类型作用：
 *   将联合类型 U 转换为交叉类型。
 *   例如 A | B | C 转为 A & B & C。
 *   常用于将多个 mixin 类型合并为一个具备全部属性的类型。
 *
 * 实现思路：
 *   利用函数参数位置上的"逆变"特性：
 *     type UnionToIntersection<U> =
 *       (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
 *         ? I : never;
 *   解释：先把联合 U 分发成多个函数类型 (k: A)=>void | (k: B)=>void，
 *   再让一个统一的 (k: infer I) => void 去匹配这个联合函数类型。
 *   由于函数参数逆变，infer I 必须同时满足 A、B、C，于是 I = A & B & C。
 *
 * 运行时模拟：
 *   TS 的联合在 JS 运行时通常用数组表示；交叉对应"对象合并"。
 *   这里演示把多个对象"合并"为一个具备全部属性的对象。
 */

// ===== TypeScript 类型实现 =====
// type UnionToIntersection<U> =
//   (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
//     ? I : never;
//
// 示例：
//   type U = { a: 1 } | { b: 2 };
//   type I = UnionToIntersection<U>; // { a: 1 } & { b: 2 }

// ===== 运行时模拟函数 =====
/**
 * 模拟 UnionToIntersection：把多个对象合并为一个交叉对象
 * @param {Array<Object>} members 联合成员
 * @returns {Object} 合并后的交叉对象
 */
function unionToIntersection(members) {
  return members.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

/**
 * 深合并版本
 * @param {Array<Object>} members
 * @returns {Object}
 */
function unionToIntersectionDeep(members) {
  const merge = (a, b) => {
    if (b === null || typeof b !== "object") return b;
    if (a === null || typeof a !== "object")
      return unionToIntersectionDeep([a, b]);
    const result = { ...a };
    for (const k of Object.keys(b)) {
      if (
        k in a &&
        typeof a[k] === "object" &&
        a[k] !== null &&
        typeof b[k] === "object" &&
        b[k] !== null
      ) {
        result[k] = merge(a[k], b[k]);
      } else {
        result[k] = b[k];
      }
    }
    return result;
  };
  return members.reduce(merge, {});
}

/**
 * 校验合并后对象是否同时"满足"所有成员（含全部键）
 * @param {Object} merged
 * @param {Array<Object>} members
 * @returns {boolean}
 */
function isIntersectionOf(merged, members) {
  return members.every((m) => Object.keys(m).every((k) => k in merged));
}

// ===== 测试 =====

const a = { a: 1 };
const b = { b: 2 };
const c = { c: 3 };

// 联合 -> 交叉
console.log(unionToIntersection([a, b, c])); // { a: 1, b: 2, c: 3 }
console.log(isIntersectionOf(unionToIntersection([a, b, c]), [a, b, c])); // true

// 复杂对象
const mixin1 = { name: "Alice", age: 18 };
const mixin2 = { email: "a@b.com", role: "admin" };
const mixin3 = { active: true };
console.log(unionToIntersection([mixin1, mixin2, mixin3]));
// { name: 'Alice', age: 18, email: 'a@b.com', role: 'admin', active: true }

// 深合并
const deep1 = { server: { host: "localhost" } };
const deep2 = { server: { port: 8080 }, debug: true };
console.log(unionToIntersectionDeep([deep1, deep2]));
// { server: { host: 'localhost', port: 8080 }, debug: true }

// 冲突键：后者覆盖前者（与 TS 交叉类型的语义在运行时一致）
const conflict1 = { x: 1 };
const conflict2 = { x: 2 };
console.log(unionToIntersection([conflict1, conflict2])); // { x: 2 }

// 空联合
console.log(unionToIntersection([])); // {}
