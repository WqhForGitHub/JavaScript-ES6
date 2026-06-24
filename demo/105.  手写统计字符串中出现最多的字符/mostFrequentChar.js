/**
 * 手写统计字符串中出现最多的字符
 *
 * 定义：找出字符串中出现次数最多的字符及其次数
 *   - "abcaaa"     → { char: "a", count: 4 }
 *   - "hello"      → { char: "l", count: 2 }
 *   - "abc"        → { char: "a", count: 1 }（并列时返回第一个）
 *   - ""           → { char: null, count: 0 }
 *
 * 以下提供多种方法：
 *   1. 哈希表计数（推荐）
 *   2. 排序后遍历
 *   3. 正则替换法
 */

// ===== 方法 1：哈希表计数 =====
// 遍历一次统计，再遍历找最大值

function mostFrequentChar(str) {
  if (typeof str !== "string" || str.length === 0) {
    return { char: null, count: 0 };
  }

  // 统计每个字符出现次数
  const map = {};
  for (const ch of str) {
    map[ch] = (map[ch] || 0) + 1;
  }

  // 找出出现次数最多的字符
  let maxChar = null;
  let maxCount = 0;
  for (const ch in map) {
    if (map[ch] > maxCount) {
      maxCount = map[ch];
      maxChar = ch;
    }
  }

  return { char: maxChar, count: maxCount };
}

// 优点：时间 O(n)，空间 O(k)（k 为字符种类数），最高效
// 缺点：需要额外哈希表

// ===== 方法 2：Map 计数（ES6）=====

function mostFrequentChar2(str) {
  if (typeof str !== "string" || str.length === 0) {
    return { char: null, count: 0 };
  }

  const map = new Map();
  for (const ch of str) {
    map.set(ch, (map.get(ch) || 0) + 1);
  }

  let maxChar = null;
  let maxCount = 0;
  for (const [ch, count] of map) {
    if (count > maxCount) {
      maxCount = count;
      maxChar = ch;
    }
  }

  return { char: maxChar, count: maxCount };
}

// 优点：使用 Map 更规范，键可以是任意类型
// 缺点：与对象方式性能相近

// ===== 方法 3：排序后遍历 =====

function mostFrequentChar3(str) {
  if (typeof str !== "string" || str.length === 0) {
    return { char: null, count: 0 };
  }

  const sorted = str.split("").sort();
  let maxChar = sorted[0];
  let maxCount = 1;
  let currentChar = sorted[0];
  let currentCount = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === currentChar) {
      currentCount++;
      if (currentCount > maxCount) {
        maxCount = currentCount;
        maxChar = currentChar;
      }
    } else {
      currentChar = sorted[i];
      currentCount = 1;
    }
  }

  return { char: maxChar, count: maxCount };
}

// 优点：不需要哈希表
// 缺点：排序 O(n log n)，性能不如哈希表

// ===== 进阶：返回所有并列最多的字符 =====

function mostFrequentChars(str) {
  if (typeof str !== "string" || str.length === 0) {
    return { chars: [], count: 0 };
  }

  const map = {};
  for (const ch of str) {
    map[ch] = (map[ch] || 0) + 1;
  }

  let maxCount = 0;
  for (const ch in map) {
    if (map[ch] > maxCount) maxCount = map[ch];
  }

  const chars = Object.keys(map).filter((ch) => map[ch] === maxCount);
  return { chars, count: maxCount };
}

// ===== 测试 =====

console.log("========== 手写统计字符串中出现最多的字符 ==========\n");

const testCases = [
  { value: "abcaaa", expected: { char: "a", count: 4 }, desc: "abcaaa" },
  { value: "hello", expected: { char: "l", count: 2 }, desc: "hello" },
  { value: "abc", expected: { char: "a", count: 1 }, desc: "abc（并列返回第一个）" },
  { value: "", expected: { char: null, count: 0 }, desc: "空字符串" },
  { value: "a", expected: { char: "a", count: 1 }, desc: "单字符" },
  { value: "aabbbcccc", expected: { char: "c", count: 4 }, desc: "aabbbcccc" },
  { value: "1122333", expected: { char: "3", count: 3 }, desc: "1122333" },
];

const methods = [
  { name: "哈希表(对象)", fn: mostFrequentChar },
  { name: "哈希表(Map)", fn: mostFrequentChar2 },
  { name: "排序遍历", fn: mostFrequentChar3 },
];

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;
  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const passed = result.char === expected.char && result.count === expected.count;
    const status = passed ? "✓" : "✗";
    if (!passed) allPassed = false;
    console.log(`  ${status} ${desc}: { char: "${result.char}", count: ${result.count} }`);
  });
  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 并列最多测试 ---
console.log("--- 进阶：并列最多的字符 ---");
console.log(mostFrequentChars("aabb")); // { chars: ["a", "b"], count: 2 }
console.log(mostFrequentChars("abcabc")); // { chars: ["a", "b", "c"], count: 2 }
console.log(mostFrequentChars("aaabbbcc")); // { chars: ["a", "b"], count: 3 }

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：哈希表计数法，时间 O(n) 空间 O(k)");
console.log("排序法时间 O(n log n)，性能稍差");
console.log("并列时返回第一个出现的最多字符");
console.log("进阶版返回所有并列最多的字符");
