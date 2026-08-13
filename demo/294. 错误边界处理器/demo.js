// 294. 错误边界处理器

function errorBoundary(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    console.log('捕获错误:', error.message);
    return fallback;
  }
}
console.log(errorBoundary(() => JSON.parse('bad'), { safe: true }));
