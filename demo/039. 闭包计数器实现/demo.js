// 39. 闭包计数器实现

function createCounter(start = 0) {
  let count = start;
  return () => ++count;
}
const counter = createCounter(5);
console.log(counter());
console.log(counter());
