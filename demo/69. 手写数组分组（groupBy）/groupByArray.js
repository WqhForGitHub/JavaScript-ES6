/**
 * 手写数组分组（groupBy）
 *
 * 核心需求：按某个「分组依据」将数组元素归类到不同组
 *   例如：
 *     [{name:'a',age:18},{name:'b',age:20},{name:'c',age:18}]
 *     按年龄分组 => { 18: [...], 20: [...] }
 *
 *   类似 Lodash 的 _.groupBy，参数是一个返回分组 key 的函数（或属性名）。
 *
 * 以下提供 3 种方法：
 *   1. for 循环 + reduce
 *   2. reduce
 *   3. Map（key 可为任意类型）
 */

// ===== 方法 1：for 循环 + 普通对象 =====

function groupBy1(arr, iteratee) {
  const result = {};
  for (const item of arr) {
    const key = resolveKey(item, iteratee);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

// ===== 方法 2：reduce（函数式风格）=====

function groupBy2(arr, iteratee) {
  return arr.reduce((acc, item) => {
    const key = resolveKey(item, iteratee);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

// ===== 方法 3：Map（key 可为任意类型）=====

function groupBy3(arr, iteratee) {
  const map = new Map();
  for (const item of arr) {
    const key = resolveKey(item, iteratee);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
}

// ===== 辅助函数：解析分组 key =====
// iteratee 可以是函数，也可以是属性名（字符串）

function resolveKey(item, iteratee) {
  if (typeof iteratee === "function") {
    return iteratee(item);
  }
  // 字符串：取对应属性
  return item[iteratee];
}

// ===== Map 转普通对象 =====
function mapToObject(map) {
  const obj = {};
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

// ===== 测试 =====

const people = [
  { name: "Alice", age: 18, city: "Beijing" },
  { name: "Bob", age: 20, city: "Shanghai" },
  { name: "Charlie", age: 18, city: "Beijing" },
  { name: "David", age: 20, city: "Shenzhen" },
  { name: "Eve", age: 22, city: "Shanghai" },
];

const methods = [
  { name: "for + 对象", fn: groupBy1 },
  { name: "reduce", fn: groupBy2 },
  { name: "Map", fn: (arr, it) => mapToObject(groupBy3(arr, it)) },
];

console.log("========== 数组分组 groupBy ==========\n");
console.log("原始数据:", people);

// --- 按属性名分组 ---
console.log("\n--- 按属性名 'age' 分组 ---");
methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, JSON.stringify(fn(people, "age"), null, 0));
});
// { '18': [Alice, Charlie], '20': [Bob, David], '22': [Eve] }

console.log("\n--- 按属性名 'city' 分组 ---");
console.log(JSON.stringify(groupBy1(people, "city"), null, 2));
// { Beijing: [Alice, Charlie], Shanghai: [Bob, Eve], Shenzhen: [David] }

// --- 按函数分组 ---
console.log("\n--- 按函数（奇偶）分组 ---");
const nums = [1, 2, 3, 4, 5, 6];
console.log("原始:", nums);
console.log("奇偶分组:", groupBy1(nums, (n) => (n % 2 === 0 ? "even" : "odd")));
// { odd: [1,3,5], even: [2,4,6] }

console.log("\n--- 按函数（长度区间）分组 ---");
const words = ["a", "bb", "ccc", "dddd", "eeeee"];
console.log("原始:", words);
console.log(
  "按长度分组:",
  groupBy1(words, (w) => `${w.length}个字符`),
);
// { '1个字符': ['a'], '2个字符': ['bb'], '3个字符': ['ccc'], ... }

// --- 按日期分组 ---
console.log("\n--- 按日期（年-月）分组 ---");
const events = [
  { name: "事件1", date: "2024-01-15" },
  { name: "事件2", date: "2024-01-20" },
  { name: "事件3", date: "2024-02-01" },
];
console.log(
  "按月分组:",
  groupBy1(events, (e) => e.date.slice(0, 7)),
);
// { '2024-01': [事件1, 事件2], '2024-02': [事件3] }

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", groupBy1([], "age")); // {}
console.log(
  "单元素:",
  groupBy1([{ a: 1 }], "a"),
); // { '1': [{a:1}] }

// --- 应用：统计每个部门人数 ---
console.log("\n========== 应用：统计每个部门人数 ==========");
const employees = [
  { name: "A", dept: "研发" },
  { name: "B", dept: "研发" },
  { name: "C", dept: "产品" },
  { name: "D", dept: "研发" },
  { name: "E", dept: "产品" },
];
const byDept = groupBy1(employees, "dept");
const countByDept = Object.fromEntries(
  Object.entries(byDept).map(([k, v]) => [k, v.length]),
);
console.log("各部门人数:", countByDept); // { 研发: 3, 产品: 2 }

// --- 应用：找出每组的第一个 ---
console.log("\n========== 应用：每组取第一个 ==========");
const firstOfEach = Object.fromEntries(
  Object.entries(groupBy1(people, "city")).map(([k, v]) => [k, v[0].name]),
);
console.log("各城市第一人:", firstOfEach); // { Beijing: 'Alice', Shanghai: 'Bob', Shenzhen: 'David' }

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：reduce > for+对象 > Map");
console.log("reduce：函数式风格，最常用");
console.log("Map：当 key 是对象/非字符串时必须用 Map");
console.log("iteratee 支持函数和属性名两种形式，更灵活");
console.log("常见应用：按属性/条件分组、统计、数据归类");
