// 67. 函数执行计时器

function time(fn, label = "task") {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(3)}ms`);
  return result;
}
time(
  () => Array.from({ length: 10000 }, (_, i) => i).reduce((a, b) => a + b, 0),
  "sum",
);
