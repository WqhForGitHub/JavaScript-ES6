/**
 * 手写树状数组求逆序对
 * 功能：统计数组中逆序对数量
 * 原理：从右往左扫描，查询比当前元素小的已出现元素个数
 */
function countInversions(arr) {
  // 离散化
  const sorted = [...new Set(arr)].sort((a, b) => a - b);
  const rank = new Map();
  sorted.forEach((v, i) => rank.set(v, i + 1));
  const n = sorted.length;
  const tree = new Array(n + 1).fill(0);
  function lowbit(x) {
    return x & -x;
  }
  function update(i) {
    for (; i <= n; i += lowbit(i)) tree[i]++;
  }
  function query(i) {
    let s = 0;
    for (; i > 0; i -= lowbit(i)) s += tree[i];
    return s;
  }
  let count = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    const r = rank.get(arr[i]);
    count += query(r - 1);
    update(r);
  }
  return count;
}
// ===== 测试 =====
console.log(
  "逆序对 [3,1,4,1,5,9,2,6]:",
  countInversions([3, 1, 4, 1, 5, 9, 2, 6]),
); // 6
console.log("逆序对 [5,4,3,2,1]:", countInversions([5, 4, 3, 2, 1])); // 10
console.log("逆序对 [1,2,3,4,5]:", countInversions([1, 2, 3, 4, 5])); // 0
