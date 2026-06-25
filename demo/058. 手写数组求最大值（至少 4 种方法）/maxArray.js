/**
 * 手写数组求最大值（至少 4 种方法）
 *
 * 核心需求：找出数组中的最大值
 *
 * 以下提供 5 种方法：
 *   1. Math.max + 展开运算符
 *   2. Math.max + apply
 *   3. reduce 累加比较
 *   4. for 循环遍历
 *   5. 排序取末尾
 */

// ===== 方法 1：Math.max + 展开运算符 =====

function max1(arr) {
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}

// 优点：代码最简洁
// 缺点：数组过大时展开可能超出调用栈限制

// ===== 方法 2：Math.max + apply =====

function max2(arr) {
  if (arr.length === 0) return undefined;
  return Math.max.apply(null, arr);
}

// 优点：兼容性好，ES5 写法
// 缺点：同样有调用栈限制（apply 参数数量上限）

// ===== 方法 3：reduce 累加比较 =====

function max3(arr) {
  if (arr.length === 0) return undefined;
  return arr.reduce((acc, cur) => (cur > acc ? cur : acc));
}

// 优点：函数式风格，无栈限制
// 缺点：无法处理空数组（需提前判断）

// ===== 方法 4：for 循环遍历 =====

function max4(arr) {
  if (arr.length === 0) return undefined;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

// 优点：性能最优，无栈限制，无额外开销
// 缺点：写法相对啰嗦

// ===== 方法 5：排序取末尾 =====

function max5(arr) {
  if (arr.length === 0) return undefined;
  return [...arr].sort((a, b) => a - b)[arr.length - 1];
}

// 优点：思路简单
// 缺点：排序是 O(n log n)，性能差；会改变数组顺序（需拷贝）

// ===== 测试 =====

const arr = [3, 7, 2, 9, 5, 1, 8];
const methods = [
  { name: "Math.max + 展开运算符", fn: max1 },
  { name: "Math.max + apply", fn: max2 },
  { name: "reduce 比较", fn: max3 },
  { name: "for 循环", fn: max4 },
  { name: "排序取末尾", fn: max5 },
];

console.log("========== 数组求最大值 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}: ${fn(arr)}`); // 9
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", max4([])); // undefined
console.log("单元素:", max4([42])); // 42
console.log("负数:", max4([-3, -7, -2])); // -2
console.log("含 0:", max4([0, -1, -2])); // 0
console.log("重复最大值:", max4([5, 5, 3])); // 5

// --- 含 NaN 的处理 ---
console.log("\n========== 含 NaN ==========");
const withNaN = [3, NaN, 7, 2];
console.log("原始:", withNaN);
console.log("Math.max + 展开:", max1(withNaN)); // NaN（NaN 参与比较结果为 NaN）
console.log("for 循环:", max4(withNaN)); // 7（> 比较时 NaN 不大于任何数，被跳过）

// --- 大数据量性能对比 ---
console.log("\n========== 性能对比（100 万数据） ==========");
const bigArr = Array.from({ length: 1000000 }, () => Math.random() * 1000);

const perfMethods = [
  { name: "Math.max + 展开", fn: max1 },
  { name: "reduce", fn: max3 },
  { name: "for 循环", fn: max4 },
];

perfMethods.forEach(({ name, fn }) => {
  const start = performance.now();
  const result = fn(bigArr);
  console.log(
    `${name}: ${result} (${(performance.now() - start).toFixed(2)}ms)`,
  );
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：Math.max > reduce > for 循环 > 排序");
console.log("Math.max：代码简洁，小数组首选");
console.log("for 循环：大数据量性能最优，无栈限制");
console.log("排序方案：性能最差，不推荐");
