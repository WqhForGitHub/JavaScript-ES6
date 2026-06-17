// 38. IIFE立即执行函数

const result = (function (n) {
  const value = n + 1;
  return value;
})(10);
console.log(result);
