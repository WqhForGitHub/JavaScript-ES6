// 21. 数据类型判断器

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value === "object"
    ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
    : typeof value;
}
[null, [], {}, new Date(), /re/, 1, "x"].forEach((value) =>
  console.log(typeOf(value)),
);
