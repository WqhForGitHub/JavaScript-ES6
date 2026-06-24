/**
 * 手写数组交集（intersection）
 *
 * 核心需求：求 A 和 B 的交集，即「同时在 A 和 B 中」的元素
 *   例如：A = [1,2,3,4], B = [3,4,5,6] => intersection(A, B) = [3,4]
 *
 * 以下提供 3 种方法：
 *   1. filter + includes
 *   2. filter + Set（推荐）
 *   3. Set 双向过滤（去重）
 */

// ===== 方法 1：filter + includes（最直观）=====

function intersection1(arr1, arr2) {
  return arr1.filter((item) => arr2.includes(item));
}

// 优点：直观易懂
// 缺点：includes 是 O(n)，整体 O(n*m)

// ===== 方法 2：filter + Set（推荐）=====

function intersection2(arr1, arr2) {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

// 优点：Set.has 是 O(1)，整体 O(n+m)，性能好
// 缺点：A 中重复元素会保留

// ===== 方法 3：去重交集（结果不含重复）=====

function intersection3(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const result = [];
  for (const item of set1) {
    if (set2.has(item)) {
      result.push(item);
    }
  }
  return result;
}

// 优点：结果去重，性能 O(n+m)
// 缺点：遍历顺序依赖 Set 插入顺序

// ===== 多个数组的交集 =====
function intersectionAll(...arrays) {
  if (arrays.length === 0) return [];
  // 以第一个数组为基础，逐个与后续数组取交集
  return arrays.reduce((acc, cur) => {
    const set = new Set(cur);
    return acc.filter((item) => set.has(item));
  });
}

// ===== 测试 =====

const A = [1, 2, 3, 4];
const B = [3, 4, 5, 6];

const methods = [
  { name: "filter + includes", fn: intersection1 },
  { name: "filter + Set", fn: intersection2 },
  { name: "去重交集", fn: intersection3 },
];

console.log("========== 数组交集 intersection ==========\n");
console.log("A:", A);
console.log("B:", B);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(A, B)); // [3, 4]
});

// --- 含重复元素 ---
console.log("\n========== 含重复元素 ==========");
const A2 = [1, 1, 2, 2, 3];
const B2 = [2, 2, 3, 4];
console.log("A:", A2, "B:", B2);
console.log("filter+includes:", intersection1(A2, B2)); // [2, 2, 3]（保留 A 中重复）
console.log("去重交集:", intersection3(A2, B2)); // [2, 3]（去重）

// --- 多个数组交集 ---
console.log("\n========== 多个数组交集 ==========");
console.log(
  "intersectionAll([1,2,3], [2,3,4], [2,3,5]):",
  intersectionAll([1, 2, 3], [2, 3, 4], [2, 3, 5]),
); // [2, 3]

// --- 含 NaN ---
console.log("\n========== 含 NaN ==========");
console.log("intersection([1, NaN, 2], [NaN, 2, 3]):", intersection3([1, NaN, 2], [NaN, 2, 3])); // [NaN, 2]
// Set 用 SameValueZero，能正确识别 NaN

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", intersection2([], [1, 2])); // []
console.log("无交集:", intersection2([1, 2], [3, 4])); // []
console.log("完全相同:", intersection3([1, 2, 3], [1, 2, 3])); // [1, 2, 3]

// --- 应用：找出共同好友 ---
console.log("\n========== 应用：共同好友 ==========");
const myFriends = ["Alice", "Bob", "Charlie", "David"];
const colleagueFriends = ["Bob", "David", "Eve"];
console.log("我的好友:", myFriends);
console.log("同事好友:", colleagueFriends);
console.log("共同好友:", intersection3(myFriends, colleagueFriends)); // ['Bob', 'David']

// --- 应用：标签匹配 ---
console.log("\n========== 应用：标签匹配 ==========");
const articleTags = ["JS", "React", "CSS"];
const userInterests = ["React", "Vue", "CSS", "Node"];
console.log("文章标签:", articleTags);
console.log("用户兴趣:", userInterests);
console.log("匹配标签:", intersection3(articleTags, userInterests)); // ['React', 'CSS']

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：filter + Set > 去重交集 > filter + includes");
console.log("filter + Set：性能 O(n+m)，保留 A 中重复");
console.log("去重交集：结果无重复，遍历两个 Set");
console.log("交集满足交换律：intersection(A,B) === intersection(B,A)（去重版本）");
