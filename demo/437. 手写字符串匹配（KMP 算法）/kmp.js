/**
 * 手写字符串匹配（KMP 算法）
 *
 * 在主串 text 中查找模式串 pattern 第一次出现的位置（下标），找不到返回 -1。
 * 相比暴力匹配 O(n*m)，KMP 利用模式串自身的结构信息，在不匹配时
 * 让主串指针不回退，仅调整模式串指针，整体复杂度 O(n + m)。
 *
 * 核心概念：
 * - next 数组（部分匹配表）：next[j] 表示 pattern[0..j] 的
 *   「最长相等前后缀」长度，即失配时 pattern 指针应回跳到的位置。
 *
 * 步骤：
 * 1. 构建 next 数组：用双指针 k（前缀末尾）与 i（后缀末尾），
 *    失配时 k = next[k-1] 回跳，匹配则 k++，next[i] = k。
 * 2. 匹配主串：j 为 pattern 指针，i 为主串指针。失配时 j = next[j-1]，
 *    i 不回退；匹配则 j++。当 j === m 时找到，返回 i - m + 1。
 */

// 构建 next 数组（最长公共前后缀长度）
function buildNext(pattern) {
  const m = pattern.length;
  const next = new Array(m).fill(0);
  let k = 0; // 当前最长相等前后缀长度
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[i] !== pattern[k]) {
      k = next[k - 1];
    }
    if (pattern[i] === pattern[k]) {
      k++;
    }
    next[i] = k;
  }
  return next;
}

// KMP 查找：返回 pattern 在 text 中首次出现的下标，找不到返回 -1
function kmp(text, pattern) {
  if (pattern === "") return 0;
  const n = text.length;
  const m = pattern.length;
  if (m > n) return -1;

  const next = buildNext(pattern);
  let j = 0; // pattern 指针
  for (let i = 0; i < n; i++) {
    while (j > 0 && text[i] !== pattern[j]) {
      j = next[j - 1]; // 主串指针不回退
    }
    if (text[i] === pattern[j]) {
      j++;
    }
    if (j === m) {
      return i - m + 1; // 匹配成功
    }
  }
  return -1;
}

// 找到所有出现位置
function kmpAll(text, pattern) {
  if (pattern === "") return [];
  const n = text.length;
  const m = pattern.length;
  const positions = [];
  if (m > n) return positions;

  const next = buildNext(pattern);
  let j = 0;
  for (let i = 0; i < n; i++) {
    while (j > 0 && text[i] !== pattern[j]) {
      j = next[j - 1];
    }
    if (text[i] === pattern[j]) {
      j++;
    }
    if (j === m) {
      positions.push(i - m + 1);
      j = next[j - 1]; // 继续找下一个匹配
    }
  }
  return positions;
}

// --- 测试 ---

console.log('next array of "ababc":', buildNext("ababc")); // [0,0,1,2,0]
console.log('next array of "aabaab":', buildNext("aabaab")); // [0,1,0,1,2,3]
console.log('next array of "aaaa":', buildNext("aaaa")); // [0,1,2,3]

console.log(kmp("hello world", "world")); // 6
console.log(kmp("hello world", "hello")); // 0
console.log(kmp("ababcabcacbab", "abcac")); // 5
console.log(kmp("aabaaabaaac", "aabaaac")); // 4
console.log(kmp("mississippi", "issip")); // 4
console.log(kmp("abc", "d")); // -1
console.log(kmp("abc", "")); // 0 (空模式约定为 0)
console.log(kmp("abc", "abcd")); // -1 (pattern 比主串长)
console.log(kmp("aaaaa", "aa")); // 0

console.log('kmpAll("abababa", "aba"):', kmpAll("abababa", "aba")); // [0, 2, 4]
console.log('kmpAll("aaaa", "aa"):', kmpAll("aaaa", "aa")); // [0, 1, 2]
console.log('kmpAll("abcabc", "d"):', kmpAll("abcabc", "d")); // []
