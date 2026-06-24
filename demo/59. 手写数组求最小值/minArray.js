/**
 * 手写数组求最小值
 *
 * 核心需求：找出数组中的最小值
 *
 * 以下提供 4 种方法（与求最大值对称）：
 *   1. Math.min + 展开运算符
 *   2. reduce 累加比较
 *   3. for 循环遍历
 *   4. 排序取首位
 */

// ===== 方法 1：Math.min + 展开运算符 =====

function min1(arr) {
  if (arr.length === 0) return undefined;
  return Math.min(...arr);
}

// 优点：代码最简洁
// 缺点：数组过大时展开可能超出调用栈限制

// ===== 方法 2：reduce 累加比较 =====

function min2(arr) {
  if (arr.length === 0) return undefined;
  return arr.reduce((acc, cur) => (cur < acc ? cur : acc));
}

// 优点：函数式风格，无栈限制
// 缺点：无法处理空数组（需提前判断）

// ===== 方法 3：for 循环遍历 =====

function min3(arr) {
  if (arr.length === 0) return undefined;
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
    }
  }
  return min;
}

// 优点：性能最优，无栈限制
// 缺点：写法相对啰嗦

// ===== 方法 4：排序取首位 =====

function min4(arr) {
  if (arr.length === 0) return undefined;
  return [...arr].sort((a, b) => a - b)[0];
}

// 优点：思路简单
// 缺点：排序是 O(n log n)，性能差

// ===== 测试 =====

const arr = [3, 7, 2, 9, 5, 1, 8];
const methods = [
  { name: "Math.min + 展开运算符", fn: min1 },
  { name: "reduce 比较", fn: min2 },
  { name: "for 循环", fn: min3 },
  { name: "排序取首位", fn: min4 },
];

console.log("========== 数组求最小值 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}: ${fn(arr)}`); // 1
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", min3([])); // undefined
console.log("单元素:", min3([42])); // 42
console.log("负数:", min3([-3, -7, -2])); // -7
console.log("含 0:", min3([0, 1, 2])); // 0
console.log("重复最小值:", min3([5, 5, 3, 3])); // 3

// --- 含 NaN 的处理 ---
console.log("\n========== 含 NaN ==========");
const withNaN = [3, NaN, 7, 2];
console.log("原始:", withNaN);
console.log("Math.min + 展开:", min1(withNaN)); // NaN（NaN 参与比较结果为 NaN）
console.log("for 循环:", min3(withNaN)); // 2（< 比较时 NaN 不小于任何数，被跳过）

// --- 同时求最大最小值（一次遍历）---
function minMax(arr) {
  if (arr.length === 0) return { min: undefined, max: undefined };
  let min = arr[0];
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }
  return { min, max };
}

console.log("\n========== 一次遍历同时求最小最大值 ==========");
console.log("结果:", minMax([3, 7, 2, 9, 5, 1, 8])); // { min: 1, max: 9 }

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：Math.min > reduce > for 循环 > 排序");
console.log("Math.min：代码简洁，小数组首选");
console.log("for 循环：大数据量性能最优");
console.log("如需同时求 min/max，一次遍历最省事");
