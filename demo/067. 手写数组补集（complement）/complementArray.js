/**
 * 手写数组补集（complement）
 *
 * 核心需求：求 A 相对于「全集 U」的补集，即「在 U 中但不在 A 中」的元素
 *   数学定义：complement(A, U) = U - A = difference(U, A)
 *
 *   例如：U = [1,2,3,4,5,6], A = [2,4,6]
 *        complement(A, U) = [1,3,5]  （U 中不在 A 里的）
 *
 * 补集本质上就是「以全集为被减数、A 为减数」的差集。
 *
 * 以下提供 3 种方法：
 *   1. filter + Set（推荐）
 *   2. filter + includes
 *   3. reduce + Set
 */

// ===== 方法 1：filter + Set（推荐）=====

function complement1(arr, universe) {
  const setArr = new Set(arr);
  return universe.filter((item) => !setArr.has(item));
}

// 优点：O(n+m)，性能好，能处理 NaN
// 缺点：需额外 Set 空间

// ===== 方法 2：filter + includes =====

function complement2(arr, universe) {
  return universe.filter((item) => !arr.includes(item));
}

// 优点：直观易懂
// 缺点：includes 是 O(n)，整体 O(n*m)，无法识别 NaN

// ===== 方法 3：reduce + Set =====

function complement3(arr, universe) {
  const setArr = new Set(arr);
  return universe.reduce((acc, cur) => {
    if (!setArr.has(cur)) acc.push(cur);
    return acc;
  }, []);
}

// 优点：函数式风格
// 缺点：相比 filter 略啰嗦

// ===== 去重补集（结果不含重复）=====
function complementUnique(arr, universe) {
  const setArr = new Set(arr);
  const seen = new Set();
  const result = [];
  for (const item of universe) {
    if (!setArr.has(item) && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

// ===== 测试 =====

const U = [1, 2, 3, 4, 5, 6];
const A = [2, 4, 6];

const methods = [
  { name: "filter + Set", fn: complement1 },
  { name: "filter + includes", fn: complement2 },
  { name: "reduce + Set", fn: complement3 },
];

console.log("========== 数组补集 complement ==========\n");
console.log("全集 U:", U);
console.log("子集 A:", A);

methods.forEach(({ name, fn }) => {
  console.log(`${name}  complement(A, U):`, fn(A, U)); // [1, 3, 5]
});

// --- 补集与差集的关系 ---
console.log("\n========== 补集 = 全集对子集的差集 ==========");
console.log("complement(A, U):", complement1(A, U)); // [1, 3, 5]
// 等价于 difference(U, A)

// --- 含 NaN ---
console.log("\n========== 含 NaN ==========");
console.log(
  "complement([NaN, 1], [1, 2, NaN]):",
  complement1([NaN, 1], [1, 2, NaN]),
); // [2]

// --- 含重复元素 ---
console.log("\n========== 含重复元素 ==========");
console.log("complement([2], [1,1,2,3,3]):", complement1([2], [1, 1, 2, 3, 3])); // [1, 1, 3, 3]
console.log(
  "complementUnique([2], [1,1,2,3,3]):",
  complementUnique([2], [1, 1, 2, 3, 3]),
); // [1, 3]

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("A 为空（补集=全集）:", complement1([], U)); // [1, 2, 3, 4, 5, 6]
console.log("A = U（补集为空）:", complement1(U, U)); // []
console.log("U 为空:", complement1([1, 2], [])); // []

// --- 应用：找出未选课学生 ---
console.log("\n========== 应用：未选课学生 ==========");
const allStudents = ["Alice", "Bob", "Charlie", "David", "Eve"];
const enrolled = ["Bob", "David"];
console.log("全部学生:", allStudents);
console.log("已选课:", enrolled);
console.log("未选课:", complement1(enrolled, allStudents)); // ['Alice', 'Charlie', 'Eve']

// --- 应用：找出缺失的数字 ---
console.log("\n========== 应用：缺失的数字（1-10）==========");
const fullRange = Array.from({ length: 10 }, (_, i) => i + 1);
const present = [1, 3, 5, 7, 9];
console.log("已有:", present);
console.log("缺失:", complement1(present, fullRange)); // [2, 4, 6, 8, 10]

// --- 验证补集性质 ---
console.log("\n========== 验证性质 ==========");
// A ∪ complement(A, U) = U  （并集等于全集）
const unionAU = [...new Set([...A, ...complement1(A, U)])].sort(
  (a, b) => a - b,
);
console.log("A ∪ complement(A) =", unionAU); // [1,2,3,4,5,6] = U
// A ∩ complement(A, U) = ∅  （交集为空）
const interAU = A.filter((x) => complement1(A, U).includes(x));
console.log("A ∩ complement(A) =", interAU); // [] 空集

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：filter + Set > filter + includes");
console.log("补集本质：complement(A, U) = difference(U, A)");
console.log("性质：A ∪ complement(A,U) = U，A ∩ complement(A,U) = ∅");
console.log("注意全集 U 的定义，不同场景全集不同");
