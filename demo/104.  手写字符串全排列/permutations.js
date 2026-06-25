/**
 * 手写字符串全排列
 *
 * 定义：返回字符串中所有字符的全排列
 *   - "abc" → ["abc", "acb", "bac", "bca", "cab", "cba"]
 *   - "ab"  → ["ab", "ba"]
 *   - "a"   → ["a"]
 *   - ""    → [""]
 *
 * 全排列数量：n!（n 的阶乘）
 *   - 3 个字符 → 6 种排列
 *   - 4 个字符 → 24 种排列
 *
 * 以下提供多种方法：
 *   1. 递归回溯（经典）
 *   2. 递归交换法
 *   3. 字典序法（非递归）
 *
 * 注意：如果字符串有重复字符，结果可能需要去重
 */

// ===== 方法 1：递归回溯 =====
// 固定一个字符，对剩余字符递归求全排列

function permutations(str) {
  if (typeof str !== "string") return [];
  if (str.length <= 1) return [str];

  const result = [];
  const used = new Array(str.length).fill(false);
  const path = [];

  // 先排序以便去重（可选）
  const chars = str.split("");

  function backtrack() {
    // 当路径长度等于原字符串长度，收集一个排列
    if (path.length === chars.length) {
      result.push(path.join(""));
      return;
    }

    for (let i = 0; i < chars.length; i++) {
      // 跳过已使用的字符
      if (used[i]) continue;

      // 去重：当前字符与前一个相同，且前一个未使用，跳过
      if (i > 0 && chars[i] === chars[i - 1] && !used[i - 1]) continue;

      used[i] = true;
      path.push(chars[i]);

      backtrack();

      path.pop();
      used[i] = false;
    }
  }

  chars.sort(); // 排序以便去重
  backtrack();
  return result;
}

// 优点：经典回溯思路，支持去重
// 缺点：空间 O(n) 用于 used 数组和 path

// ===== 方法 2：递归交换法 =====
// 交换字符位置来生成排列

function permutations2(str) {
  if (typeof str !== "string") return [];
  const result = [];
  const arr = str.split("");

  function swap(i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  function backtrack(start) {
    if (start === arr.length) {
      result.push(arr.join(""));
      return;
    }

    const seen = new Set(); // 用于去重
    for (let i = start; i < arr.length; i++) {
      if (seen.has(arr[i])) continue; // 跳过重复
      seen.add(arr[i]);

      swap(start, i);
      backtrack(start + 1);
      swap(start, i); // 回溯
    }
  }

  backtrack(0);
  return result;
}

// 优点：不需要额外 path 数组，原地交换
// 缺点：思路稍复杂

// ===== 方法 3：递归插入法 =====
// 每次取一个字符，插入到已有排列的所有可能位置

function permutations3(str) {
  if (typeof str !== "string") return [];
  if (str.length <= 1) return [str];

  const result = [];
  const first = str[0];
  const restPerms = permutations3(str.slice(1));

  // 将首字符插入到每个子排列的所有位置
  for (const perm of restPerms) {
    for (let i = 0; i <= perm.length; i++) {
      result.push(perm.slice(0, i) + first + perm.slice(i));
    }
  }

  // 去重
  return [...new Set(result)];
}

// 优点：思路直观
// 缺点：需要去重，性能稍差

// ===== 测试 =====

console.log("========== 手写字符串全排列 ==========\n");

const testCases = [
  { value: "abc", expectedLen: 6, desc: "abc" },
  { value: "ab", expectedLen: 2, desc: "ab" },
  { value: "a", expectedLen: 1, desc: "a" },
  { value: "", expectedLen: 1, desc: "空字符串" },
  { value: "aab", expectedLen: 3, desc: "aab（有重复）" },
];

const methods = [
  { name: "递归回溯", fn: permutations },
  { name: "递归交换法", fn: permutations2 },
  { name: "递归插入法", fn: permutations3 },
];

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  testCases.forEach(({ value, expectedLen, desc }) => {
    const result = fn(value);
    const status = result.length === expectedLen ? "✓" : "✗";
    console.log(
      `  ${status} ${desc}: ${result.length} 种排列 (期望 ${expectedLen})`,
    );
    if (value.length <= 3) {
      console.log(`       结果: [${result.join(", ")}]`);
    }
  });
  console.log("");
});

// --- 验证正确性 ---
console.log("--- 验证 abc 的全排列 ---");
const abcPerms = permutations("abc");
console.log(abcPerms); // ["abc", "acb", "bac", "bca", "cab", "cba"]
console.log("是否包含所有 6 种排列:", abcPerms.length === 6);

// --- 验证去重 ---
console.log("\n--- 验证 aab 的去重 ---");
const aabPerms = permutations("aab");
console.log(aabPerms); // ["aab", "aba", "baa"]
console.log("去重后 3 种:", aabPerms.length === 3);

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：递归回溯法，经典且支持去重");
console.log("递归交换法：原地交换，空间更优");
console.log("递归插入法：思路直观但性能稍差");
console.log("注意：n! 增长极快，长字符串排列数巨大，需控制输入长度");
