/**
 * 手写最长公共前缀
 *
 * 定义：找出一组字符串的最长公共前缀
 *   - ["flower","flow","flight"] → "fl"
 *   - ["dog","racecar","car"]    → ""
 *   - ["abc","abc","abc"]        → "abc"
 *   - [""]                       → ""
 *   - ["a"]                      → "a"
 *
 * 规则：
 *   - 公共前缀是所有字符串都以此开头的前缀
 *   - 如果没有公共前缀，返回空字符串
 *
 * 以下提供多种方法：
 *   1. 纵向扫描（逐字符比较）
 *   2. 横向扫描（两两比较）
 *   3. 排序后比较首尾
 *   4. 分治法
 */

// ===== 方法 1：纵向扫描 =====
// 逐列比较所有字符串的同一位置字符

function longestCommonPrefix(strs) {
  if (!Array.isArray(strs) || strs.length === 0) return "";
  if (strs.length === 1) return strs[0];

  // 以第一个字符串为基准
  const first = strs[0];

  for (let i = 0; i < first.length; i++) {
    const ch = first[i];
    // 检查所有其他字符串在位置 i 是否也是 ch
    for (let j = 1; j < strs.length; j++) {
      // 如果某个字符串长度不够或字符不同，返回前 i 个字符
      if (i >= strs[j].length || strs[j][i] !== ch) {
        return first.slice(0, i);
      }
    }
  }

  // 第一个字符串本身就是公共前缀
  return first;
}

// 优点：最直观，时间 O(S)（S 为所有字符总数），空间 O(1)
// 缺点：无

// ===== 方法 2：横向扫描 =====
// 两两比较，逐步缩减公共前缀

function longestCommonPrefix2(strs) {
  if (!Array.isArray(strs) || strs.length === 0) return "";

  let prefix = strs[0];

  for (let i = 1; i < strs.length; i++) {
    // 不断缩短 prefix 直到它是当前字符串的前缀
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, prefix.length - 1);
      if (prefix === "") return "";
    }
  }

  return prefix;
}

// 优点：思路清晰
// 缺点：indexOf 每次都从头搜索

// ===== 方法 3：排序后比较首尾 =====
// 排序后只需比较第一个和最后一个字符串

function longestCommonPrefix3(strs) {
  if (!Array.isArray(strs) || strs.length === 0) return "";

  const sorted = [...strs].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  let i = 0;
  while (i < first.length && i < last.length && first[i] === last[i]) {
    i++;
  }

  return first.slice(0, i);
}

// 优点：只需比较首尾，代码简洁
// 缺点：排序 O(n log n * m)，性能不如纵向扫描

// ===== 方法 4：分治法 =====

function longestCommonPrefix4(strs) {
  if (!Array.isArray(strs) || strs.length === 0) return "";

  function divide(left, right) {
    if (left === right) return strs[left];

    const mid = Math.floor((left + right) / 2);
    const lcpLeft = divide(left, mid);
    const lcpRight = divide(mid + 1, right);

    return commonPrefix(lcpLeft, lcpRight);
  }

  function commonPrefix(s1, s2) {
    const minLen = Math.min(s1.length, s2.length);
    let i = 0;
    while (i < minLen && s1[i] === s2[i]) i++;
    return s1.slice(0, i);
  }

  return divide(0, strs.length - 1);
}

// 优点：分治思想，适合并行处理
// 缺点：递归开销

// ===== 测试 =====

console.log("========== 手写最长公共前缀 ==========\n");

const testCases = [
  { value: ["flower", "flow", "flight"], expected: "fl", desc: "flower/flow/flight" },
  { value: ["dog", "racecar", "car"], expected: "", desc: "dog/racecar/car（无公共前缀）" },
  { value: ["abc", "abc", "abc"], expected: "abc", desc: "全相同" },
  { value: [""], expected: "", desc: "单个空字符串" },
  { value: ["a"], expected: "a", desc: "单个字符串" },
  { value: [], expected: "", desc: "空数组" },
  { value: ["", "b"], expected: "", desc: "含空字符串" },
  { value: ["ab", "a"], expected: "a", desc: "ab/a（长度不同）" },
  { value: ["interspecies", "interstellar", "interstate"], expected: "inters", desc: "interspecies/..." },
  { value: ["prefix", "preface", "premium"], expected: "pre", desc: "prefix/preface/premium" },
];

const methods = [
  { name: "纵向扫描", fn: longestCommonPrefix },
  { name: "横向扫描", fn: longestCommonPrefix2 },
  { name: "排序首尾", fn: longestCommonPrefix3 },
  { name: "分治法", fn: longestCommonPrefix4 },
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
console.log("推荐：纵向扫描法，时间 O(S) 空间 O(1)，最直观高效");
console.log("横向扫描：两两比较，逐步缩减前缀");
console.log("排序首尾：排序后只需比较首尾，简洁但有排序开销");
console.log("分治法：分治思想，适合并行但递归有开销");
