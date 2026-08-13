// 30. 变量提升现象演示

console.log(hoistedVar);
var hoistedVar = 'value';
try {
  console.log(tdz);
  const tdz = 1;
} catch (error) {
  console.log(error.message);
}
sayHi();
function sayHi() {
  console.log('hi');
}
