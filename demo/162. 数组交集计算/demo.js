// 162. 数组交集计算

function intersection(a, b) {
  const set = new Set(b);
  return a.filter((item) => set.has(item));
}
console.log(intersection([1, 2, 3], [2, 3, 4]));
