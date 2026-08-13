// 44. arguments对象演示

function showArgs() {
  console.log(Array.isArray(arguments));
  console.log(Array.from(arguments));
}
showArgs('a', 1, true);
