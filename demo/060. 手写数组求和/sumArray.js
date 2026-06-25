/**
 * 手写数组求和
 *
 * 核心需求：计算数组所有元素的和
 *
 * 以下提供 4 种方法：
 *   1. reduce 累加
 *   2. for 循环
 *   3. for...of
 *   4. eval（不推荐，仅作演示）
 */

// ===== 方法 1：reduce 累加（最推荐）=====

function sum1(arr) {
  return arr.reduce((acc, cur) => acc + cur, 0);
}

// 优点：函数式风格，简洁清晰
// 缺点：需注意初始值 0（空数组返回 0，而非 undefined）

// ===== 方法 2：for 循环 =====

function sum2(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// 优点：性能最优
// 缺点：写法稍啰嗦

// ===== 方法 3：for...of =====

function sum3(arr) {
  let sum = 0;
  for (const item of arr) {
    sum += item;
  }
  return sum;
}

// 优点：可读性好，无下标
// 缺点：相比 for 循环略慢（可忽略）

// ===== 方法 4：eval（仅作演示，绝不推荐生产使用）=====

function sum4(arr) {
  // eslint-disable-next-line no-eval
  return eval(arr.join("+")) || 0;
}

// 优点：一行代码
// 缺点：有安全风险（XSS），性能差，不推荐

// ===== 带过滤的求和（只求偶数和、正数和等）=====

function sumBy(arr, predicate) {
  return arr.reduce((acc, cur) => (predicate(cur) ? acc + cur : acc), 0);
}

// ===== 测试 =====

const arr = [1, 2, 3, 4, 5];
const methods = [
  { name: "reduce", fn: sum1 },
  { name: "for 循环", fn: sum2 },
  { name: "for...of", fn: sum3 },
  { name: "eval", fn: sum4 },
];

console.log("========== 数组求和 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}: ${fn(arr)}`); // 15
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", sum1([])); // 0
console.log("单元素:", sum1([42])); // 42
console.log("负数:", sum1([-1, -2, -3])); // -6
console.log("含 0:", sum1([0, 5, 0])); // 5
console.log("浮点数:", sum1([0.1, 0.2, 0.3])); // 0.6000000000000001（浮点精度问题）

// --- 浮点精度修复 ---
function sumFloat(arr) {
  // 转整数运算再转回，避免浮点误差
  return arr.reduce((acc, cur) => Math.round((acc + cur) * 1e10) / 1e10, 0);
}
console.log("浮点数(修复):", sumFloat([0.1, 0.2, 0.3])); // 0.6

// --- 条件求和 ---
console.log("\n========== 条件求和 ==========");
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("原始:", nums);
console.log(
  "偶数和:",
  sumBy(nums, (n) => n % 2 === 0),
); // 30
console.log(
  "奇数和:",
  sumBy(nums, (n) => n % 2 !== 0),
); // 25
console.log(
  "大于 5 的和:",
  sumBy(nums, (n) => n > 5),
); // 40

// --- 嵌套数组求和 ---
function sumNested(arr) {
  return arr.reduce((acc, cur) => {
    return acc + (Array.isArray(cur) ? sumNested(cur) : cur);
  }, 0);
}
console.log("\n========== 嵌套数组求和 ==========");
console.log("[1, [2, [3, 4]], 5] =>", sumNested([1, [2, [3, 4]], 5])); // 15

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：reduce > for...of > for 循环 >> eval");
console.log("reduce：最常用，函数式风格，可链式调用");
console.log("for 循环：性能最优，大数据量首选");
console.log("eval：有安全风险，绝不推荐生产使用");
