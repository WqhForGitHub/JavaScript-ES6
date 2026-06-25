/**
 * 手写莫队算法
 * 功能：离线区间查询，O((N+Q) sqrt(N))
 * 原理：将查询排序，通过移动左右指针增量计算
 */
function moAlgorithm(arr, queries) {
  const n = arr.length;
  const blockSize = Math.ceil(Math.sqrt(n));
  // 排序查询：按块排序，同块内按 r 排序
  const sorted = queries
    .map((q, i) => ({ ...q, idx: i }))
    .sort((a, b) => {
      const ba = Math.floor(a.l / blockSize),
        bb = Math.floor(b.l / blockSize);
      if (ba !== bb) return ba - bb;
      return ba % 2 === 0 ? a.r - b.r : b.r - a.r;
    });
  const results = new Array(queries.length);
  let curL = 0,
    curR = -1;
  const freq = new Map();
  let distinct = 0;
  function add(idx) {
    const v = arr[idx];
    freq.set(v, (freq.get(v) || 0) + 1);
    if (freq.get(v) === 1) distinct++;
  }
  function remove(idx) {
    const v = arr[idx];
    freq.set(v, freq.get(v) - 1);
    if (freq.get(v) === 0) distinct--;
  }
  for (const q of sorted) {
    while (curL > q.l) add(--curL);
    while (curR < q.r) add(++curR);
    while (curL < q.l) remove(curL++);
    while (curR > q.r) remove(curR--);
    results[q.idx] = distinct;
  }
  return results;
}
// ===== 测试 =====
const arr = [1, 1, 2, 3, 2, 4, 1, 5];
const queries = [
  { l: 0, r: 4 },
  { l: 1, r: 3 },
  { l: 2, r: 7 },
  { l: 0, r: 7 },
];
const results = moAlgorithm(arr, queries);
console.log("区间不同元素个数:");
queries.forEach((q, i) =>
  console.log("  [" + q.l + "," + q.r + "]:", results[i]),
);
// [0,4]: 3, [1,3]: 3, [2,7]: 5, [0,7]: 5
