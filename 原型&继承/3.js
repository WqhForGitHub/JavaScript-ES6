var F = function () { };
Object.prototype.a = function () {
    console.log('a');
};
Function.prototype.b = function () {
    console.log('b');
}
var f = new F();
f.a(); // a
f.b(); //  undefined
F.a(); // a
F.b() // b
