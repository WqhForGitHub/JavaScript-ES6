/**
 * 手写数组差集（difference）
 *
 * 核心需求：求 A 相对 B 的差集，即「在 A 中但不在 B 中」的元素
 *   例如：A = [1,2,3,4], B = [3,4,5,6] => difference(A, B) = [1,2]
 *
 * 注意：差集是「有方向的」，difference(A, B) ≠ difference(B, A)
 *
 * 以下提供 3 种方法：
 *   1. filter + includes
 *   2. filter + Set（性能优）
 *   3. reduce + Set
 */

// ===== 方法 1：filter + includes（最直观）=====

function difference1(arr, ...others) {
  // 支持多个数组：排除所有 others 中出现的元素
  const exclude = others.flat();
  return arr.filter((item) => !exclude.includes(item));
}

// 优点：直观易懂
// 缺点：includes 是 O(n)，整体 O(n*m)

// ===== 方法 2：filter + Set（性能优，推荐）=====

function difference2(arr, ...others) {
  const excludeSet = new Set(others.flat());
  return arr.filter((item) => !excludeSet.has(item));
}

// 优点：Set.has 是 O(1)，整体 O(n+m)，性能好
// 缺点：需额外 Set 空间

// ===== 方法 3：reduce + Set =====

function difference3(arr, ...others) {
  const excludeSet = new Set(others.flat());
  return arr.reduce((acc, cur) => {
    if (!excludeSet.has(cur)) acc.push(cur);
    return acc;
  }, []);
}

// 优点：函数式风格
// 缺点：相比 filter 略啰嗦

// ===== 对称差集（symmetric difference）=====
// A △ B = (A - B) ∪ (B - A)，即「只在 A 或只在 B 中」的元素
function symmetricDifference(arr1, arr2) {
  const set2 = new Set(arr2);
  const set1 = new Set(arr1);
  const onlyInA = arr1.filter((x) => !set2.has(x));
  const onlyInB = arr2.filter((x) => !set1.has(x));
  return [...new Set([...onlyInA, ...onlyInB])];
}

// ===== 测试 =====

const A = [1, 2, 3, 4];
const B = [3, 4, 5, 6];

const methods = [
  { name: "filter + includes", fn: difference1 },
  { name: "filter + Set", fn: difference2 },
  { name: "reduce + Set", fn: difference3 },
];

console.log("========== 数组差集 difference ==========\n");
console.log("A:", A);
console.log("B:", B);

methods.forEach(({ name, fn }) => {
  console.log(`${name}  difference(A, B):`, fn(A, B)); // [1, 2]
});

// --- 差集的方向性 ---
console.log("\n========== 差集的方向性 ==========");
console.log("difference(A, B):", difference2(A, B)); // [1, 2]
console.log("difference(B, A):", difference2(B, A)); // [5, 6]

// --- 多个数组的差集 ---
console.log("\n========== 多个数组差集 ==========");
console.log("difference([1,2,3,4,5], [2], [4]):", difference2([1, 2, 3, 4, 5], [2], [4]));
// [1, 3, 5]

// --- 对称差集 ---
console.log("\n========== 对称差集 symmetricDifference ==========");
console.log("A:", A, "B:", B);
console.log("symmetricDifference(A, B):", symmetricDifference(A, B)); // [1, 2, 5, 6]

// --- 含重复元素 ---
console.log("\n========== 含重复元素 ==========");
console.log("difference([1,1,2,3], [2]):", difference2([1, 1, 2, 3], [2])); // [1, 1]
// 注意：filter 保留 A 中的重复，如需去重可再 unique

// --- 含 NaN ---
console.log("\n========== 含 NaN ==========");
console.log("difference([1, NaN, 2], [NaN]):", difference2([1, NaN, 2], [NaN])); // [1, 2]
// Set 用 SameValueZero，能正确识别 NaN

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组 A:", difference2([], [1, 2])); // []
console.log("空数组 B:", difference2([1, 2], [])); // [1, 2]
console.log("两空数组:", difference2([], [])); // []

// --- 应用：删除指定元素 ---
console.log("\n========== 应用：删除指定元素 ==========");
const list = [1, 2, 3, 4, 5, 6];
const toRemove = [2, 4, 6];
console.log("删除后:", difference2(list, toRemove)); // [1, 3, 5]

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：filter + Set > filter + includes > reduce");
console.log("filter + Set：性能最优 O(n+m)，推荐生产使用");
console.log("差集有方向性：difference(A,B) ≠ difference(B,A)");
console.log("对称差集：两边都「独有」的元素");
