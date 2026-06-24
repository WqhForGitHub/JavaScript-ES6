/**
 * 手写数组分块（chunk）
 *
 * 核心需求：把数组按指定大小切分成多个小数组（二维数组）
 *   例如：[1,2,3,4,5] 按 size=2 分块 => [[1,2],[3,4],[5]]
 *   最后一块不足 size 也会保留
 *
 * 以下提供 4 种方法：
 *   1. for 循环 + slice
 *   2. while + slice
 *   3. reduce
 *   4. 递归
 */

// ===== 方法 1：for 循环 + slice（最推荐）=====

function chunk1(arr, size = 1) {
  if (size <= 0) throw new Error("size 必须为正整数");
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// 优点：思路清晰，性能好，slice 不修改原数组
// 缺点：需校验 size

// ===== 方法 2：while + slice =====

function chunk2(arr, size = 1) {
  if (size <= 0) throw new Error("size 必须为正整数");
  const result = [];
  let i = 0;
  while (i < arr.length) {
    result.push(arr.slice(i, i + size));
    i += size;
  }
  return result;
}

// 优点：和 for 本质相同，写法稍异
// 缺点：无

// ===== 方法 3：reduce =====

function chunk3(arr, size = 1) {
  if (size <= 0) throw new Error("size 必须为正整数");
  return arr.reduce((acc, cur, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }
    acc[chunkIndex].push(cur);
    return acc;
  }, []);
}

// 优点：函数式风格
// 缺点：每次都要算 chunkIndex，性能略差

// ===== 方法 4：递归 =====

function chunk4(arr, size = 1) {
  if (size <= 0) throw new Error("size 必须为正整数");
  if (arr.length === 0) return [];
  const head = arr.slice(0, size);
  const tail = arr.slice(size);
  return [head, ...chunk4(tail, size)];
}

// 优点：思路优雅
// 缺点：递归深度受栈限制，大数组可能溢出

// ===== 测试 =====

const arr = [1, 2, 3, 4, 5];
const methods = [
  { name: "for + slice", fn: chunk1 },
  { name: "while + slice", fn: chunk2 },
  { name: "reduce", fn: chunk3 },
  { name: "递归", fn: chunk4 },
];

console.log("========== 数组分块 chunk ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name} (size=2):`, JSON.stringify(fn(arr, 2))); // [[1,2],[3,4],[5]]
});

// --- 不同 size ---
console.log("\n========== 不同 size ==========");
console.log("size=1:", JSON.stringify(chunk1([1, 2, 3], 1))); // [[1],[2],[3]]
console.log("size=2:", JSON.stringify(chunk1([1, 2, 3, 4, 5], 2))); // [[1,2],[3,4],[5]]
console.log("size=3:", JSON.stringify(chunk1([1, 2, 3, 4, 5], 3))); // [[1,2,3],[4,5]]
console.log("size=5:", JSON.stringify(chunk1([1, 2, 3, 4, 5], 5))); // [[1,2,3,4,5]]
console.log("size=10(超出):", JSON.stringify(chunk1([1, 2, 3], 10))); // [[1,2,3]]

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", JSON.stringify(chunk1([], 2))); // []
console.log("size 默认=1:", JSON.stringify(chunk1([1, 2, 3]))); // [[1],[2],[3]]

// --- size 校验 ---
console.log("\n========== size 校验 ==========");
try {
  chunk1([1, 2, 3], 0);
} catch (e) {
  console.log("size=0 抛错:", e.message); // size 必须为正整数
}
try {
  chunk1([1, 2, 3], -1);
} catch (e) {
  console.log("size=-1 抛错:", e.message); // size 必须为正整数
}

// --- 应用：分页 ---
console.log("\n========== 应用：分页 ==========");
const allItems = Array.from({ length: 23 }, (_, i) => `item${i + 1}`);
const pageSize = 5;
const pages = chunk1(allItems, pageSize);
console.log(`共 ${allItems.length} 条，每页 ${pageSize} 条 => ${pages.length} 页`);
console.log("第 3 页:", pages[2]); // ['item11','item12','item13','item14','item15']
console.log("最后一页:", pages[pages.length - 1]); // ['item21','item22','item23']

// --- 应用：批量请求 ---
console.log("\n========== 应用：批量处理 ==========");
const ids = [1, 2, 3, 4, 5, 6, 7];
const batches = chunk1(ids, 3);
console.log("分批:", JSON.stringify(batches)); // [[1,2,3],[4,5,6],[7]]

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：for + slice > while + slice > reduce > 递归");
console.log("for + slice：最直观、性能好，生产首选");
console.log("递归：思路优雅但有栈溢出风险");
console.log("常见应用：分页、批量请求、矩阵分块");
