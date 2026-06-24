/**
 * 手写数组并集（union）
 *
 * 核心需求：求 A 和 B 的并集，即「在 A 或在 B 中」的所有元素（去重）
 *   例如：A = [1,2,3], B = [3,4,5] => union(A, B) = [1,2,3,4,5]
 *
 * 以下提供 4 种方法：
 *   1. Set + 展开运算符（最推荐）
 *   2. concat + filter + indexOf
 *   3. for 循环 + includes
 *   4. Map 去重
 */

// ===== 方法 1：Set + 展开运算符（最推荐）=====

function union1(...arrays) {
  return [...new Set(arrays.flat())];
}

// 优点：代码最简洁，性能好，能处理 NaN
// 缺点：对象引用不同无法去重

// ===== 方法 2：concat + filter + indexOf =====

function union2(arr1, arr2) {
  return arr1
    .concat(arr2)
    .filter((item, index, self) => self.indexOf(item) === index);
}

// 优点：兼容性好（ES5）
// 缺点：indexOf 无法识别 NaN，O(n^2)

// ===== 方法 3：for 循环 + includes =====

function union3(...arrays) {
  const result = [];
  for (const arr of arrays) {
    for (const item of arr) {
      if (!result.includes(item)) {
        result.push(item);
      }
    }
  }
  return result;
}

// 优点：能处理 NaN（includes 用 SameValueZero），保留首次出现顺序
// 缺点：includes 是 O(n)，整体 O(n^2)

// ===== 方法 4：Map 去重 =====

function union4(...arrays) {
  const map = new Map();
  const result = [];
  for (const item of arrays.flat()) {
    if (!map.has(item)) {
      map.set(item, true);
      result.push(item);
    }
  }
  return result;
}

// 优点：O(n) 时间，保留插入顺序，能处理 NaN
// 缺点：需额外 Map 空间

// ===== 测试 =====

const A = [1, 2, 3];
const B = [3, 4, 5];

const methods = [
  { name: "Set + 展开", fn: () => union1(A, B) },
  { name: "concat + filter + indexOf", fn: () => union2(A, B) },
  { name: "for + includes", fn: () => union3(A, B) },
  { name: "Map 去重", fn: () => union4(A, B) },
];

console.log("========== 数组并集 union ==========\n");
console.log("A:", A);
console.log("B:", B);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn()); // [1, 2, 3, 4, 5]
});

// --- 多个数组并集 ---
console.log("\n========== 多个数组并集 ==========");
console.log(
  "union1([1,2], [2,3], [3,4], [4,5]):",
  union1([1, 2], [2, 3], [3, 4], [4, 5]),
); // [1, 2, 3, 4, 5]

// --- 含重复元素 ---
console.log("\n========== 含重复元素 ==========");
console.log("union1([1,1,2], [2,2,3]):", union1([1, 1, 2], [2, 2, 3])); // [1, 2, 3]

// --- 含 NaN ---
console.log("\n========== 含 NaN ==========");
console.log("union1([1, NaN], [NaN, 2]):", union1([1, NaN], [NaN, 2])); // [1, NaN, 2]
console.log("union2(indexOf 无法去 NaN):", union2([1, NaN], [NaN, 2])); // [1, NaN, NaN, 2]

// --- 混合类型 ---
console.log("\n========== 混合类型 ==========");
console.log("union1([1, '1'], ['1', true]):", union1([1, "1"], ["1", true])); // [1, '1', true]

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", union1([], [])); // []
console.log("一个空数组:", union1([1, 2], [])); // [1, 2]
console.log("完全相同:", union1([1, 2, 3], [1, 2, 3])); // [1, 2, 3]

// --- 应用：合并标签 ---
console.log("\n========== 应用：合并标签去重 ==========");
const tags1 = ["JS", "React", "CSS"];
const tags2 = ["React", "Vue", "Node", "CSS"];
console.log("标签1:", tags1);
console.log("标签2:", tags2);
console.log("合并后:", union1(tags1, tags2)); // ['JS', 'React', 'CSS', 'Vue', 'Node']

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：Set + 展开 > Map > for+includes > filter+indexOf");
console.log("Set + 展开：最简洁，性能 O(n)，现代项目首选");
console.log("并集满足交换律和结合律：union(A,B) === union(B,A)");
console.log("注意：对象因引用不同无法去重，需按 key 去重");
