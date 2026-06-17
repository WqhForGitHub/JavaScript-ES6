// 4. 基本类型检测器

function isPrimitive(value) {
  return (
    value === null || (typeof value !== "object" && typeof value !== "function")
  );
}
[undefined, null, true, 1, "x", 1n, Symbol("s"), {}, []].forEach((value) => {
  console.log(String(value), isPrimitive(value));
});
