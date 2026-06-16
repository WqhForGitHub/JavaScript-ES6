/**
 * 手写判断字符串是否为回文
 *
 * 定义：正着读和反着读都一样的字符串
 *   - "level"   → true
 *   - "racecar" → true
 *   - "hello"   → false
 *   - ""        → true（空字符串视为回文）
 *   - "a"       → true（单字符视为回文）
 *
 * 进阶：忽略大小写和非字母数字字符
 *   - "A man, a plan, a canal: Panama" → true
 *   - "Was it a car or a cat I saw?"   → true
 *
 * 以下提供 4 种方法
 */

// ===== 方法 1：翻转字符串比较 =====
// 最直观的方式：将字符串翻转后与原串比较

function isPalindrome1(str) {
  if (typeof str !== "string") {
    return false;
  }
  return str === str.split("").reverse().join("");
}

// 优点：代码简洁，最容易理解和记忆
// 缺点：
//   1. 需要创建新数组和新字符串，空间复杂度 O(n)
//   2. reverse() 会遍历整个字符串，时间复杂度 O(n)
//   3. 对于超长字符串，额外空间开销较大

// ===== 方法 2：双指针法（首尾对向遍历）=====
// 左指针从头部、右指针从尾部，逐步向中间靠拢比较

function isPalindrome2(str) {
  if (typeof str !== "string") {
    return false;
  }

  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    if (str[left] !== str[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// 优点：
//   1. 空间复杂度 O(1)，不需要额外空间
//   2. 一旦发现不匹配立即返回，最好情况 O(1)
//   3. 面试中最推荐的写法
// 缺点：代码比方法 1 稍长

// ===== 方法 3：递归法 =====
// 递归比较首尾字符，然后对子串继续判断

function isPalindrome3(str) {
  if (typeof str !== "string") {
    return false;
  }

  // 基线条件：长度 0 或 1 时一定是回文
  if (str.length <= 1) {
    return true;
  }

  // 首尾不同则不是回文
  if (str[0] !== str[str.length - 1]) {
    return false;
  }

  // 递归判断去掉首尾的子串
  return isPalindrome3(str.slice(1, -1));
}

// 优点：思路优雅，体现递归思想
// 缺点：
//   1. 每次递归调用 slice 都会创建新字符串，空间复杂度 O(n)
//   2. 递归深度为 n/2，超长字符串可能栈溢出
//   3. 性能较差，不适合生产环境

// ===== 方法 4：忽略大小写和非字母数字字符（进阶版）=====
// 实际场景中常需要忽略空格、标点和大小写

function isPalindromeAdvanced(str) {
  if (typeof str !== "string") {
    return false;
  }

  // 预处理：只保留字母和数字，转为小写
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  // 用双指针判断
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// 优点：实用性最强，处理真实场景中的回文判断
// 缺点：正则替换需要额外空间存储 cleaned 字符串
// 也可以用双指针直接在原串上跳过非字母数字字符，空间 O(1)

// ===== 测试 =====

const testCases = [
  // 基础回文
  { value: "", expected: true, desc: "空字符串" },
  { value: "a", expected: true, desc: "单字符" },
  { value: "aa", expected: true, desc: "两个相同字符" },
  { value: "aba", expected: true, desc: "奇数长度回文" },
  { value: "abba", expected: true, desc: "偶数长度回文" },
  { value: "level", expected: true, desc: "level" },
  { value: "racecar", expected: true, desc: "racecar" },
  { value: "madam", expected: true, desc: "madam" },
  // 非回文
  { value: "ab", expected: false, desc: "两个不同字符" },
  { value: "hello", expected: false, desc: "hello" },
  { value: "world", expected: false, desc: "world" },
  { value: "abcba1", expected: false, desc: "abcba1" },
  // 非字符串
  { value: 12321, expected: false, desc: "数字 12321（非字符串）" },
  { value: null, expected: false, desc: "null" },
  { value: undefined, expected: false, desc: "undefined" },
  { value: true, expected: false, desc: "布尔值" },
];

const methods = [
  { name: "翻转字符串", fn: isPalindrome1 },
  { name: "双指针法", fn: isPalindrome2 },
  { name: "递归法", fn: isPalindrome3 },
];

console.log("========== 判断字符串是否为回文 ==========\n");

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;

  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });

  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 进阶版测试 ---
console.log("--- 进阶版：忽略大小写和非字母数字字符 ---");
const advancedTestCases = [
  {
    value: "A man, a plan, a canal: Panama",
    expected: true,
    desc: "A man, a plan, a canal: Panama",
  },
  {
    value: "Was it a car or a cat I saw?",
    expected: true,
    desc: "Was it a car or a cat I saw?",
  },
  { value: "No 'x' in Nixon", expected: true, desc: "No 'x' in Nixon" },
  { value: "race CAR", expected: true, desc: "race CAR（忽略大小写）" },
  { value: "12321", expected: true, desc: "数字回文 12321" },
  { value: "1a2", expected: false, desc: "1a2（非回文）" },
  { value: "hello world", expected: false, desc: "hello world（非回文）" },
];

advancedTestCases.forEach(({ value, expected, desc }) => {
  const result = isPalindromeAdvanced(value);
  const status = result === expected ? "✓" : "✗";
  console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：双指针法 > 翻转字符串 > 递归法");
console.log("翻转字符串  : 最简洁，空间 O(n)，适合日常快速判断");
console.log("双指针法    : 最推荐，空间 O(1)，面试首选");
console.log("递归法      : 思路优雅，但空间 O(n) 且可能栈溢出");
console.log("进阶版      : 实际场景常用，忽略大小写和标点");
