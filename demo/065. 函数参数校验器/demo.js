// 65. 函数参数校验器

function requireNumber(value, name) {
  if (typeof value !== "number" || Number.isNaN(value))
    throw new TypeError(`${name} must be number`);
}
function divide(a, b) {
  requireNumber(a, "a");
  requireNumber(b, "b");
  return a / b;
}
console.log(divide(10, 2));
