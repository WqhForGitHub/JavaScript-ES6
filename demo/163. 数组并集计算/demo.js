// 163. 数组并集计算

function union(a, b) {
  return [...new Set([...a, ...b])];
}
console.log(union([1, 2], [2, 3]));
