/**
 * 手写 TypeScript `Permutation`（全排列）
 *
 * 类型作用：
 *   生成联合类型 U 的所有全排列，结果是一个元组的联合。
 *   例如 Permutation<'A' | 'B' | 'C'> -> ['A','B','C'] | ['A','C','B'] | ...（6 种）。
 *
 * 实现思路：
 *   经典递归：每次从联合 U 中取一个元素放到首位，剩余元素递归全排列：
 *     type Permutation<U, P = U> =
//        [U] extends [never]
//          ? []
//          : U extends P
//            ? [U, ...Permutation<Exclude<P, U>>]
//            : never;
 *   关键点：
 *   1) [U] extends [never] 作为终止条件（用元组包裹阻止分发）；
 *   2) U extends P 触发联合分发，每个成员 U 放首位；
 *   3) Exclude<P, U> 把当前选中的元素从剩余集合中剔除。
 *
 * 运行时模拟：
 *   JS 用回溯递归生成全排列数组。
 */

// ===== TypeScript 类型实现 =====
// type Permutation<U, P = U> =
//   [U] extends [never]
//     ? []
//     : U extends P
//       ? [U, ...Permutation<Exclude<P, U>>]
//       : never;
//
// 示例：
//   type R = Permutation<'A' | 'B' | 'C'>;
//   // ['A','B','C'] | ['A','C','B'] | ['B','A','C'] | ['B','C','A'] | ['C','A','B'] | ['C','B','A']

// ===== 运行时模拟函数 =====
/**
 * 模拟 Permutation：生成数组的所有全排列
 * @param {Array<any>} arr 元素集合
 * @returns {Array<Array<any>>} 所有全排列
 */
function permutation(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  // 终止条件
  if (arr.length === 0) return [[]];
  if (arr.length === 1) return [[arr[0]]];

  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    // 递归求剩余的全排列，把 current 拼到首位
    for (const p of permutation(rest)) {
      result.push([current, ...p]);
    }
  }
  return result;
}

/**
 * 基于交换的回溯实现（原地对数组操作）
 * @param {Array<any>} arr
 * @returns {Array<Array<any>>}
 */
function permutationSwap(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  const result = [];
  const a = [...arr];
  const backtrack = (start) => {
    if (start === a.length) {
      result.push([...a]);
      return;
    }
    for (let i = start; i < a.length; i++) {
      [a[start], a[i]] = [a[i], a[start]]; // 交换
      backtrack(start + 1);
      [a[start], a[i]] = [a[i], a[start]]; // 回溯
    }
  };
  backtrack(0);
  return result;
}

/**
 * 统计全排列数量（n!）
 * @param {number} n
 * @returns {number}
 */
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ===== 测试 =====

console.log(permutation(["A", "B", "C"]));
// [ ['A','B','C'], ['A','C','B'], ['B','A','C'], ['B','C','A'], ['C','A','B'], ['C','B','A'] ]
console.log(permutation(["A", "B", "C"]).length); // 6

console.log(permutation([1, 2]));
// [ [1, 2], [2, 1] ]
console.log(permutation([1, 2]).length); // 2

console.log(permutation([1])); // [[1]]
console.log(permutation([])); // [[]]
console.log(permutation([]).length); // 1

// 4 元素全排列
const four = permutation([1, 2, 3, 4]);
console.log(four.length); // 24
console.log(four.length === factorial(4)); // true

// 交换版本
console.log(permutationSwap(["A", "B", "C"]).length); // 6
console.log(permutationSwap([1, 2, 3]).length); // 6

// 字符串全排列
console.log(permutation("abc".split("")).map((p) => p.join("")));
// ['abc','acb','bac','bca','cab','cba']

// 含重复元素（不去重）
console.log(permutation([1, 1, 2]).length); // 6（含重复排列）

// 非数组抛错
try {
  permutation(123);
} catch (e) {
  console.log("catch:", e.message); // Expected an array
}
