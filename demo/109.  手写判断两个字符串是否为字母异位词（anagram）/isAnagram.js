/**
 * 手写判断两个字符串是否为字母异位词（anagram）
 *
 * 定义：两个字符串包含相同的字母（相同种类和数量），只是顺序不同
 *   - "listen"  / "silent"  → true
 *   - "anagram" / "nagaram" → true
 *   - "hello"   / "world"   → false
 *   - "abc"     / "ab"      → false（长度不同）
 *   - ""        / ""        → true
 *
 * 规则：
 *   - 长度不同直接返回 false
 *   - 字符种类和数量完全相同
 *   - 顺序可以不同
 *
 * 以下提供多种方法：
 *   1. 排序比较（最简洁）
 *   2. 哈希表计数（最高效）
 *   3. 数组计数（ASCII 范围）
 *
 * 进阶：
 *   - 忽略大小写和空格
 *   - Unicode 字符支持
 */

// ===== 方法 1：排序比较 =====
// 将两个字符串排序后比较是否相等

function isAnagram(s, t) {
  if (typeof s !== "string" || typeof t !== "string") return false;
  if (s.length !== t.length) return false;

  // 排序后比较
  return s.split("").sort().join("") === t.split("").sort().join("");
}

// 优点：代码最简洁
// 缺点：排序 O(n log n)，性能不如哈希表

// ===== 方法 2：哈希表计数 =====
// 统计每个字符出现次数，比较两个哈希表

function isAnagram2(s, t) {
  if (typeof s !== "string" || typeof t !== "string") return false;
  if (s.length !== t.length) return false;

  const mapS = {};
  const mapT = {};

  // 统计 s 中每个字符出现次数
  for (const ch of s) {
    mapS[ch] = (mapS[ch] || 0) + 1;
  }

  // 统计 t 中每个字符出现次数
  for (const ch of t) {
    mapT[ch] = (mapT[ch] || 0) + 1;
  }

  // 比较两个哈希表
  for (const ch in mapS) {
    if (mapS[ch] !== mapT[ch]) return false;
  }

  return true;
}

// 优点：时间 O(n)，空间 O(k)，最高效
// 缺点：需要两个哈希表

// ===== 方法 3：单哈希表计数 =====
// 用一个哈希表，s 中字符 +1，t 中字符 -1，最后检查全为 0

function isAnagram3(s, t) {
  if (typeof s !== "string" || typeof t !== "string") return false;
  if (s.length !== t.length) return false;

  const map = {};

  // s 中字符 +1，t 中字符 -1
  for (let i = 0; i < s.length; i++) {
    map[s[i]] = (map[s[i]] || 0) + 1;
    map[t[i]] = (map[t[i]] || 0) - 1;
  }

  // 检查所有计数是否为 0
  for (const ch in map) {
    if (map[ch] !== 0) return false;
  }

  return true;
}

// 优点：只需一个哈希表，空间更优
// 缺点：逻辑稍复杂

// ===== 方法 4：数组计数（仅限 ASCII）=====

function isAnagram4(s, t) {
  if (typeof s !== "string" || typeof t !== "string") return false;
  if (s.length !== t.length) return false;

  // 26 个字母的计数数组（仅限小写字母）
  const count = new Array(26).fill(0);

  for (let i = 0; i < s.length; i++) {
    count[s[i].charCodeAt(0) - 97]++;
    count[t[i].charCodeAt(0) - 97]--;
  }

  return count.every((c) => c === 0);
}

// 优点：空间 O(1)（固定 26），性能最优
// 缺点：仅限 26 个小写字母，不通用

// ===== 进阶：忽略大小写和空格 =====

function isAnagramAdvanced(s, t) {
  if (typeof s !== "string" || typeof t !== "string") return false;

  // 预处理：转小写，移除非字母字符
  const cleanS = s.toLowerCase().replace(/[^a-z]/g, "");
  const cleanT = t.toLowerCase().replace(/[^a-z]/g, "");

  return isAnagram3(cleanS, cleanT);
}

// ===== 测试 =====

console.log("========== 手写判断字母异位词 ==========\n");

const testCases = [
  { s: "listen", t: "silent", expected: true, desc: "listen / silent" },
  { s: "anagram", t: "nagaram", expected: true, desc: "anagram / nagaram" },
  { s: "hello", t: "world", expected: false, desc: "hello / world" },
  { s: "abc", t: "ab", expected: false, desc: "abc / ab（长度不同）" },
  { s: "", t: "", expected: true, desc: "空字符串" },
  { s: "a", t: "a", expected: true, desc: "单字符相同" },
  { s: "a", t: "b", expected: false, desc: "单字符不同" },
  { s: "rat", t: "car", expected: false, desc: "rat / car" },
  { s: "aabb", t: "abab", expected: true, desc: "aabb / abab" },
];

const methods = [
  { name: "排序比较", fn: isAnagram },
  { name: "哈希表计数", fn: isAnagram2 },
  { name: "单哈希表", fn: isAnagram3 },
];

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;
  testCases.forEach(({ s, t, expected, desc }) => {
    const result = fn(s, t);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });
  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 进阶版测试 ---
console.log("--- 进阶：忽略大小写和空格 ---");
console.log(isAnagramAdvanced("Listen", "Silent")); // true（忽略大小写）
console.log(isAnagramAdvanced("a b c", "c b a")); // true（忽略空格）
console.log(isAnagramAdvanced("Dormitory", "Dirty room")); // true（经典 anagram）
console.log(isAnagramAdvanced("School master", "The classroom")); // true

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：单哈希表法，时间 O(n) 空间 O(k)，平衡好");
console.log("排序法最简洁但 O(n log n)");
console.log("数组计数法仅限小写字母，空间最优但不通用");
console.log("进阶版忽略大小写和空格，处理真实场景");
