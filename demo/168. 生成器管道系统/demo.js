// 168. 生成器管道系统

function* map(iterable, fn) {
  for (const item of iterable) yield fn(item);
}
function* filter(iterable, fn) {
  for (const item of iterable) if (fn(item)) yield item;
}
console.log([
  ...filter(
    map([1, 2, 3, 4], (n) => n * 2),
    (n) => n > 4
  ),
]);
