// 23. 数值范围检测器

function inRange(n, min, max, inclusive = true) {
  return inclusive ? n >= min && n <= max : n > min && n < max;
}
console.log(inRange(5, 1, 10));
console.log(inRange(1, 1, 10, false));
console.log(Number.isSafeInteger(9007199254740991));
