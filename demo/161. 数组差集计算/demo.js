// 161. 数组差集计算

function difference(a, b) {
  const set = new Set(b);
  return a.filter((item) => !set.has(item));
}
console.log(difference([1, 2, 3], [2, 4]));
