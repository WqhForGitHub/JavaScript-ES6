/**
 * 手写数组计数
 *
 * 核心需求：统计数组中每个元素出现的次数
 *   例如：[1, 1, 2, 3] => { '1': 2, '2': 1, '3': 1 }
 *
 * 以下提供 4 种方法：
 *   1. for 循环 + 普通对象
 *   2. reduce + 普通对象
 *   3. Map（推荐，键可以是任意类型）
 *   4. for 循环 + Map
 */

// ===== 方法 1：for 循环 + 普通对象 =====

function count1(arr) {
  const result = {};
  for (const item of arr) {
    // 对象的键会自动转为字符串，数字 1 和字符串 '1' 会冲突
    const key = typeof item === "number" ? item : String(item);
    if (result[key] === undefined) {
      result[key] = 1;
    } else {
      result[key] += 1;
    }
  }
  return result;
}

// 优点：简单直观
// 缺点：对象的键只能是字符串/Symbol，对象元素无法直接计数

// ===== 方法 2：reduce + 普通对象 =====

function count2(arr) {
  return arr.reduce((acc, cur) => {
    const key = typeof cur === "number" ? cur : String(cur);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// 优点：函数式风格，简洁
// 缺点：同上，键类型限制

// ===== 方法 3：Map（推荐，键可为任意类型）=====

function count3(arr) {
  const map = new Map();
  for (const item of arr) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

// 优点：键可为任意类型（对象、NaN 等），计数准确
// 缺点：返回 Map 而非普通对象，使用时需注意

// ===== 方法 4：reduce + Map =====

function count4(arr) {
  return arr.reduce((map, cur) => {
    map.set(cur, (map.get(cur) || 0) + 1);
    return map;
  }, new Map());
}

// 优点：函数式风格 + Map 优势
// 缺点：略啰嗦

// ===== Map 转普通对象（键为字符串时）=====
function mapToObject(map) {
  const obj = {};
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

// ===== 测试 =====

const arr = [1, 1, 2, 3, 1, 3, 3, "a", "a"];
const methods = [
  { name: "for + 对象", fn: count1 },
  { name: "reduce + 对象", fn: count2 },
  { name: "for + Map", fn: count3 },
  { name: "reduce + Map", fn: count4 },
];

console.log("========== 数组计数 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  const result = fn(arr);
  console.log(`${name}:`, result instanceof Map ? mapToObject(result) : result);
});
// 期望: { '1': 3, '2': 1, '3': 3, a: 2 }

// --- 题目示例 ---
console.log("\n========== 题目示例：[1,1,2,3] ==========");
console.log("结果:", count1([1, 1, 2, 3])); // { '1': 2, '2': 1, '3': 1 }

// --- Map 优势：支持任意类型键 ---
console.log("\n========== Map 支持任意类型键 ==========");
const mixed = [1, "1", true, NaN, NaN, { a: 1 }, { a: 1 }];
const mapResult = count3(mixed);
console.log("原始:", mixed);
console.log("Map 计数:");
for (const [key, value] of mapResult) {
  console.log(`  ${String(key)}: ${value}`);
}
// 1: 1, '1': 1, true: 1, NaN: 2, [object Object]: 1, [object Object]: 1
// 注意：两个 {a:1} 引用不同，分别计数

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", count1([])); // {}
console.log("单元素:", count1([42])); // { '42': 1 }
console.log("全相同:", count1([5, 5, 5, 5])); // { '5': 4 }

// --- 应用：统计字符出现次数 ---
console.log("\n========== 应用：统计字符频率 ==========");
function countChars(str) {
  return count1(str.split(""));
}
console.log("'hello world':", countChars("hello world"));
// { h: 1, e: 1, l: 3, o: 2, ' ': 1, w: 1, r: 1, d: 1 }

// --- 应用：找众数（出现次数最多的元素）---
function mode(arr) {
  const counts = count3(arr);
  let maxCount = 0;
  let modeValue = undefined;
  for (const [key, value] of counts) {
    if (value > maxCount) {
      maxCount = value;
      modeValue = key;
    }
  }
  return { value: modeValue, count: maxCount };
}
console.log("\n========== 应用：众数 ==========");
console.log("[1,1,2,3,3,3,4] =>", mode([1, 1, 2, 3, 3, 3, 4])); // { value: 3, count: 3 }

// --- 应用：只保留出现超过 N 次的元素 ---
function filterByCount(arr, n) {
  const counts = count3(arr);
  return arr.filter((item) => counts.get(item) >= n);
}
console.log("\n========== 应用：出现>=2次的元素 ==========");
console.log("[1,2,2,3,3,3] =>", filterByCount([1, 2, 2, 3, 3, 3], 2)); // [2,2,3,3,3]

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：Map > reduce+对象 > for+对象");
console.log("Map：键可为任意类型，计数最准确，推荐");
console.log("普通对象：键只能是字符串，数字/字符串会混在一起");
console.log("应用：频率统计、众数、字符计数、过滤高频元素");
