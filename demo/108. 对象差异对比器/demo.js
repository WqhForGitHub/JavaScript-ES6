// 108. 对象差异对比器

function diff(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result = {};
  keys.forEach((key) => {
    if (!Object.is(a[key], b[key])) result[key] = { from: a[key], to: b[key] };
  });
  return result;
}
console.log(diff({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 }));
