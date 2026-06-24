/**
 * 手写去除字符串中连续重复的字符
 *
 * 定义：将字符串中连续出现的相同字符合并为一个
 *   - "aaabbc"    → "abc"
 *   - "aabbcc"    → "abc"
 *   - "aaa"       → "a"
 *   - "abc"       → "abc"（无连续重复不变）
 *   - ""          → ""
 *   - "a"         → "a"
 *   - "aabbaa"    → "ababa"（只去连续重复，不相邻的相同字符保留）
 *
 * 注意：只去除"连续"重复，不相邻的相同字符不合并
 *
 * 以下提供多种方法
 */

// ===== 方法 1：遍历比较前一个字符 =====
// 最直观的方式

function removeConsecutive(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  let result = str[0]; // 第一个字符一定保留
  for (let i = 1; i < str.length; i++) {
    // 当前字符与前一个不同才加入结果
    if (str[i] !== str[i - 1]) {
      result += str[i];
    }
  }
  return result;
}

// 优点：时间 O(n)，空间 O(n)（结果字符串），最推荐
// 缺点：无

// ===== 方法 2：正则替换 =====
// 利用正则的回溯引用

function removeConsecutive2(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  // (.)\1+ 匹配：任意字符后跟一个或多个相同字符
  // $1 替换为单个字符
  return str.replace(/(.)\1+/g, "$1");
}

// 优点：一行代码，正则优雅
// 缺点：正则可读性稍差

// ===== 方法 3：reduce =====

function removeConsecutive3(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.split("").reduce((acc, ch) => {
    // 累加器的最后一个字符与当前不同才追加
    if (acc[acc.length - 1] !== ch) {
      return acc + ch;
    }
    return acc;
  }, "");
}

// 优点：函数式编程风格
// 缺点：性能稍差

// ===== 方法 4：双指针原地思路（转数组）=====

function removeConsecutive4(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  const arr = str.split("");
  let write = 1; // 写指针从 1 开始（第一个字符一定保留）
  for (let read = 1; read < arr.length; read++) {
    // 当前字符与前一个写入位置的字符不同才写入
    if (arr[read] !== arr[write - 1]) {
      arr[write] = arr[read];
      write++;
    }
  }
  return arr.slice(0, write).join("");
}

// 优点：双指针思路，体现算法能力
// 缺点：需要转数组

// ===== 测试 =====

console.log("========== 手写去除字符串中连续重复的字符 ==========\n");

const testCases = [
  { value: "aaabbc", expected: "abc", desc: "aaabbc" },
  { value: "aabbcc", expected: "abc", desc: "aabbcc" },
  { value: "aaa", expected: "a", desc: "aaa" },
  { value: "abc", expected: "abc", desc: "abc（无连续重复）" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a", expected: "a", desc: "单字符" },
  { value: "aabbaa", expected: "ababa", desc: "aabbaa（不相邻相同保留）" },
  { value: "aabbbcccc", expected: "abc", desc: "aabbbcccc" },
  { value: "111222333", expected: "123", desc: "111222333（数字）" },
];

const methods = [
  { name: "遍历比较", fn: removeConsecutive },
  { name: "正则替换", fn: removeConsecutive2 },
  { name: "reduce", fn: removeConsecutive3 },
  { name: "双指针", fn: removeConsecutive4 },
];

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;
  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: "${result}" (期望 "${expected}")`);
  });
  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 总结 ---
console.log("========== 总结 ==========");
console.log("推荐：遍历比较法，时间 O(n) 空间 O(n)，最简洁高效");
console.log("正则 (.)\\1+ 方案一行代码，优雅但可读性稍差");
console.log("注意：只去除连续重复，不相邻的相同字符保留");
