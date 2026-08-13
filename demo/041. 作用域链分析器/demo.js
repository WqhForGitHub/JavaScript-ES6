// 41. 作用域链分析器

const globalValue = 'global';
function outer() {
  const outerValue = 'outer';
  function inner() {
    console.log(outerValue, globalValue);
  }
  inner();
}
outer();
