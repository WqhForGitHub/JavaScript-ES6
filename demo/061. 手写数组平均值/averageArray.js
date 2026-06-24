/**
 * 手写数组平均值
 *
 * 核心需求：计算数组所有元素的平均值（和 / 个数）
 *
 * 以下提供 3 种方法，并处理空数组的边界情况：
 *   1. reduce 求和再除以长度
 *   2. for 循环求和
 *   3. 一次遍历累加（动态平均）
 */

// ===== 方法 1：reduce 求和再除以长度（最推荐）=====

function average1(arr) {
  if (arr.length === 0) return 0; // 或返回 NaN，按业务定义
  const sum = arr.reduce((acc, cur) => acc + cur, 0);
  return sum / arr.length;
}

// 优点：简洁清晰，复用求和逻辑
// 缺点：需处理空数组

// ===== 方法 2：for 循环求和 =====

function average2(arr) {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}

// 优点：性能最优
// 缺点：写法啰嗦

// ===== 方法 3：一次遍历动态平均 =====
// 利用公式：avg_n = avg_{n-1} + (x_n - avg_{n-1}) / n
// 适合流式数据，无需存储所有值

function average3(arr) {
  if (arr.length === 0) return 0;
  let avg = 0;
  for (let i = 0; i < arr.length; i++) {
    avg = avg + (arr[i] - avg) / (i + 1);
  }
  return avg;
}

// 优点：可处理流式数据，无需先求和
// 缺点：浮点累积误差可能略大

// ===== 加权平均 =====
function weightedAverage(arr, weights) {
  if (arr.length === 0) return 0;
  let sum = 0;
  let totalWeight = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] * weights[i];
    totalWeight += weights[i];
  }
  return totalWeight === 0 ? 0 : sum / totalWeight;
}

// ===== 测试 =====

const arr = [1, 2, 3, 4, 5];
const methods = [
  { name: "reduce", fn: average1 },
  { name: "for 循环", fn: average2 },
  { name: "动态平均", fn: average3 },
];

console.log("========== 数组平均值 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}: ${fn(arr)}`); // 3
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", average1([])); // 0
console.log("单元素:", average1([42])); // 42
console.log("负数:", average1([-1, -2, -3])); // -2
console.log("浮点数:", average1([0.1, 0.2, 0.3])); // 0.2
console.log("含 0:", average1([0, 10, 20])); // 10

// --- 加权平均 ---
console.log("\n========== 加权平均 ==========");
const scores = [90, 80, 70];
const weights = [0.5, 0.3, 0.2]; // 权重
console.log("成绩:", scores);
console.log("权重:", weights);
console.log("加权平均:", weightedAverage(scores, weights)); // 85

// --- 面试常见：去除最高最低分后的平均 ---
function averageWithoutExtremes(arr) {
  if (arr.length <= 2) return average1(arr);
  const sorted = [...arr].sort((a, b) => a - b);
  // 去掉一个最高分和一个最低分
  const middle = sorted.slice(1, -1);
  return average1(middle);
}

console.log("\n========== 去除最高最低分后的平均 ==========");
console.log("[10, 9, 8, 7, 1] =>", averageWithoutExtremes([10, 9, 8, 7, 1])); // 8（去掉 1 和 10，剩 [7,8,9] 平均 8）

// --- 保留指定小数位 ---
function averageFixed(arr, digits = 2) {
  return Number(average1(arr).toFixed(digits));
}
console.log("\n========== 保留小数位 ==========");
console.log("[1, 2, 3] 保留 2 位:", averageFixed([1, 2, 3], 2)); // 2
console.log("[1, 1, 2] 保留 2 位:", averageFixed([1, 1, 2], 2)); // 1.33

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：reduce > for 循环 > 动态平均");
console.log("reduce：最简洁，复用求和逻辑");
console.log("for 循环：性能最优");
console.log("动态平均：适合流式数据场景");
console.log("注意：空数组需特殊处理，避免除以 0 得到 NaN");
