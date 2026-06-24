/**
 * 手写字符串压缩（如 aaabbc → a3b2c1）
 *
 * 定义：将连续重复的字符压缩为"字符+次数"的形式
 *   - "aaabbc"     → "a3b2c1"
 *   - "abc"        → "a1b1c1"
 *   - "aaaa"       → "a4"
 *   - "aabbaa"     → "a2b2a2"（不相邻的相同字符分别压缩）
 *   - ""           → ""
 *   - "a"          → "a1"
 *
 * 规则：
 *   - 统计连续相同字符的个数
 *   - 输出"字符+次数"
 *   - 不相邻的相同字符分组压缩
 *
 * 以下提供多种方法
 */

// ===== 方法 1：遍历统计 =====
// 最直观的方式

function compressString(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  let result = "";
  let count = 1;

  for (let i = 1; i <= str.length; i++) {
    // 当前字符与前一个相同，计数增加
    if (i < str.length && str[i] === str[i - 1]) {
      count++;
    } else {
      // 字符不同或到末尾，输出压缩结果
      result += str[i - 1] + count;
      count = 1;
    }
  }

  return result;
}

// 优点：时间 O(n)，空间 O(n)，最推荐
// 缺点：无

// ===== 方法 2：正则替换 =====
// 利用正则匹配连续相同字符

function compressString2(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  // (.)\1* 匹配：一个字符后跟零个或多个相同字符
  return str.replace(/(.)\1*/g, (match, ch) => ch + match.length);
}

// 优点：一行代码，正则优雅
// 缺点：正则可读性稍差

// ===== 方法 3：while 循环 =====

function compressString3(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  let result = "";
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    let count = 0;
    // 统计连续相同字符
    while (i < str.length && str[i] === ch) {
      count++;
      i++;
    }
    result += ch + count;
  }

  return result;
}

// 优点：while 循环思路清晰
// 缺点：与 for 循环本质相同

// ===== 进阶：压缩后更长则返回原串 =====
// 实际压缩算法的优化：如果压缩后没有变短，返回原字符串

function compressSmart(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  const compressed = compressString(str);
  // 压缩后更长则返回原串
  return compressed.length < str.length ? compressed : str;
}

// ===== 测试 =====

console.log("========== 手写字符串压缩 ==========\n");

const testCases = [
  { value: "aaabbc", expected: "a3b2c1", desc: "aaabbc" },
  { value: "abc", expected: "a1b1c1", desc: "abc" },
  { value: "aaaa", expected: "a4", desc: "aaaa" },
  { value: "aabbaa", expected: "a2b2a2", desc: "aabbaa（不相邻分组）" },
  { value: "", expected: "", desc: "空字符串" },
  { value: "a", expected: "a1", desc: "单字符" },
  { value: "aabbbcccc", expected: "a2b3c4", desc: "aabbbcccc" },
  { value: "111222", expected: "1323", desc: "111222（数字）" },
];

const methods = [
  { name: "遍历统计", fn: compressString },
  { name: "正则替换", fn: compressString2 },
  { name: "while循环", fn: compressString3 },
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

// --- 智能压缩测试 ---
console.log("--- 进阶：智能压缩（压缩后更长则返回原串）---");
console.log(compressSmart("aaabbc")); // "a3b2c1"（压缩后更短）
console.log(compressSmart("abc")); // "abc"（压缩后 "a1b1c1" 更长，返回原串）
console.log(compressSmart("aaaa")); // "a4"（压缩后更短）

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：遍历统计法，时间 O(n) 空间 O(n)");
console.log("正则 (.)\\1* 方案一行代码，优雅但可读性稍差");
console.log("进阶版：压缩后更长则返回原串（实际压缩算法优化）");
