var a = 3;
function c() {
    console.log(a)
}
(function () {
    var a = 4;
    c();
})();
