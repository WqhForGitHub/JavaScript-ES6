function foo() {
  console.log("foo");
}
var bar;
foo();
bar();
bar = function () {
  console.log("bar");
};
