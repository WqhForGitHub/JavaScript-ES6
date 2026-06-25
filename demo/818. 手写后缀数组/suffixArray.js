/**
 * 手写后缀数组
 * 功能：将字符串所有后缀按字典序排列
 * 实现：O(n log^2 n) 倍增法
 */
function buildSuffixArray(s) {
  const n = s.length;
  const sa = Array.from({ length: n }, (_, i) => i);
  const rank = s.split("").map((c) => c.charCodeAt(0));
  const tmp = new Array(n);
  for (let k = 1; k < n; k <<= 1) {
    sa.sort((a, b) => {
      if (rank[a] !== rank[b]) return rank[a] - rank[b];
      const ra = a + k < n ? rank[a + k] : -1;
      const rb = b + k < n ? rank[b + k] : -1;
      return ra - rb;
    });
    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]];
      if (
        rank[sa[i]] !== rank[sa[i - 1]] ||
        (sa[i] + k < n ? rank[sa[i] + k] : -1) !==
          (sa[i - 1] + k < n ? rank[sa[i - 1] + k] : -1)
      )
        tmp[sa[i]]++;
    }
    for (let i = 0; i < n; i++) rank[i] = tmp[i];
  }
  return sa;
}
function buildLCP(s, sa) {
  const n = s.length;
  const rank = new Array(n);
  const lcp = new Array(n);
  for (let i = 0; i < n; i++) rank[sa[i]] = i;
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1];
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
      lcp[rank[i]] = h;
      if (h > 0) h--;
    } else lcp[rank[i]] = 0;
  }
  return lcp;
}
// ===== 测试 =====
const s = "banana";
const sa = buildSuffixArray(s);
const lcp = buildLCP(s, sa);
console.log("后缀数组:", sa.map((i) => s.substring(i)).join(", "));
console.log("SA:", sa); // [5, 3, 1, 0, 4, 2]
console.log("LCP:", lcp); // [0, 1, 3, 0, 0, 2]
