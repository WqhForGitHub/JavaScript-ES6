function foo() {
  var num = 1;
  function bar() {
    console.log(num);
  }
  bar();
}
foo();

function func1() {
  var value = 1;
  func2();
}
function func2() {
  console.log(value);
}
func1();
