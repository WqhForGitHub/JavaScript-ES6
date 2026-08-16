var num = 1;
function func() {
  console.log(num);
}

(function () {
  var num = 2;
  func();
})();
