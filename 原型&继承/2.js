// a
function Foo() {
    getName = function () {
        console.log(1);
    }
    return this;
}
// b
Foo.getName = function () {
    console.log(2);
}
// c
Foo.prototype.getName = function () {
    console.log(3);
}
// d
var getName = function () {
    console.log(4);
}
// e
function getName() {
    console.log(5);
}

Foo.getName(); // 2
getName(); // 4 
Foo().getName(); // 1
getName(); // 1
new Foo.getName();
new Foo().getName();
new new Foo().getName();
