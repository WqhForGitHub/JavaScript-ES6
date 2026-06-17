// 154. 类数组转数组

function demo() {
  console.log(Array.from(arguments));
  console.log([].slice.call(arguments));
}
demo("a", "b");
