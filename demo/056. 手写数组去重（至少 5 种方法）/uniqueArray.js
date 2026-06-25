/**
 * 手写数组去重（至少 5 种方法）
 *
 * 核心需求：去除数组中重复的元素，保留第一次出现的值
 *
 * 以下提供 6 种方法，各有适用场景：
 *   1. Set 去重（最推荐）
 *   2. filter + indexOf
 *   3. for 循环 + includes
 *   4. Map / Object 键值对去重
 *   5. reduce 累加去重
 *   6. 排序后相邻比较去重
 */

// ===== 方法 1：Set 去重（最简洁） =====
// 利用 Set 元素唯一的特性，再展开为数组

function unique1(arr) {
  return [...new Set(arr)];
}

// 优点：代码最简洁，性能好，能正确处理 NaN（Set 中 NaN === NaN）
// 缺点：无法区分对象引用（{} !== {}），对象去重需要额外处理

// ===== 方法 2：filter + indexOf =====
// indexOf 只返回第一个匹配元素的下标，过滤出下标等于当前索引的元素

function unique2(arr) {
  return arr.filter((item, index, self) => self.indexOf(item) === index);
}

// 优点：语义清晰
// 缺点：indexOf 使用 === 比较，无法识别 NaN（NaN 的 indexOf 永远是 -1）

// ===== 方法 3：for 循环 + includes =====
// includes 能正确识别 NaN

function unique3(arr) {
  const result = [];
  for (const item of arr) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

// 优点：能正确处理 NaN（includes 用 SameValueZero 比较）
// 缺点：includes 是 O(n) 查找，整体 O(n^2)

// ===== 方法 4：Map 键值对去重 =====
// Map 的键唯一，利用 has 判断是否已存在

function unique4(arr) {
  const map = new Map();
  const result = [];
  for (const item of arr) {
    if (!map.has(item)) {
      map.set(item, true);
      result.push(item);
    }
  }
  return result;
}

// 优点：时间复杂度 O(n)，能正确处理 NaN，保留插入顺序
// 缺点：需要额外的 Map 空间

// ===== 方法 5：reduce 累加去重 =====

function unique5(arr) {
  return arr.reduce((acc, item) => {
    if (!acc.includes(item)) {
      acc.push(item);
    }
    return acc;
  }, []);
}

// 优点：函数式风格，链式调用友好
// 缺点：includes 导致 O(n^2)

// ===== 方法 6：排序后相邻比较去重 =====
// 先排序，重复元素会相邻，比较相邻元素即可

function unique6(arr) {
  if (arr.length === 0) return [];
  const sorted = [...arr].sort();
  const result = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      result.push(sorted[i]);
    }
  }
  return result;
}

// 优点：不需要额外哈希结构
// 缺点：会改变元素相对顺序（排序后顺序变了），且无法去重对象

// ===== 测试 =====

const arr = [1, 2, 2, 3, 3, 3, 4, 1, "a", "a", NaN, NaN, true, true];
const arrWithObj = [{ a: 1 }, { a: 1 }, { a: 1 }];

const methods = [
  { name: "Set 去重", fn: unique1 },
  { name: "filter + indexOf", fn: unique2 },
  { name: "for + includes", fn: unique3 },
  { name: "Map 去重", fn: unique4 },
  { name: "reduce 去重", fn: unique5 },
  { name: "排序去重", fn: unique6 },
];

console.log("========== 数组去重 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`\n--- 方法：${name} ---`);
  console.log("结果:", fn(arr));
});

// --- 对象去重说明 ---
console.log("\n========== 对象去重说明 ==========");
console.log("原始数组:", arrWithObj);
console.log("Set 去重结果:", unique1(arrWithObj));
// [{ a: 1 }, { a: 1 }, { a: 1 }]  —— 对象引用不同，无法去重

// 对象去重需要按某个属性去重，例如按 a 属性：
function uniqueBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return [...map.values()];
}

console.log(
  "按 a 属性去重:",
  uniqueBy(arrWithObj, (o) => o.a),
); // [{ a: 1 }]

// --- NaN 处理说明 ---
console.log("\n========== NaN 处理对比 ==========");
const nanArr = [NaN, NaN, 1, 1];
console.log("filter+indexOf:", unique2(nanArr)); // [NaN, NaN, 1] —— indexOf 找不到 NaN
console.log("Set 去重:", unique1(nanArr)); // [NaN, 1] ✅
console.log("includes 去重:", unique3(nanArr)); // [NaN, 1] ✅
console.log("Map 去重:", unique4(nanArr)); // [NaN, 1] ✅

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log(
  "推荐优先级：Set > Map > includes > filter+indexOf > reduce > 排序",
);
console.log("Set 方案：最简洁、性能好、能处理 NaN，现代项目首选");
console.log("Map 方案：O(n) 时间复杂度，适合大数据量且需要保留顺序");
console.log("排序方案：不保留原顺序，仅在不关心顺序时使用");
